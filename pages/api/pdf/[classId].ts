import type { NextApiRequest, NextApiResponse } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generatePDFBuffer } from '@/lib/pdf/LexiconPDF'
import type { PDFData, PDFStudent, PDFPoll } from '@/lib/pdf/types'

export const config = {
  api: { responseLimit: false },
  maxDuration: 60,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { classId } = req.query as { classId: string }
  const admin = createServiceRoleClient()

  const { data: cls } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url, superhero_image_url, superhero_prompt, plan')
    .eq('id', classId)
    .single()

  if (!cls) {
    res.status(404).send('Class not found')
    return
  }

  if (cls.plan !== 'premium') {
    res.status(403).send('PDF export requires Premium plan')
    return
  }

  const [namePart, schoolPart] = cls.name.includes(' — ')
    ? cls.name.split(' — ')
    : [cls.name, null]

  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', classId)
    .order('last_name')

  const studentIds = (students ?? []).map((s: any) => s.id)

  const { data: questions } = await admin
    .from('questions')
    .select('id, text')
    .eq('class_id', classId)
    .in('type', ['personal', 'better_together', 'superhero'])
    .order('order_index')

  const qMap = new Map((questions ?? []).map((q: any) => [q.id, q.text]))

  const { data: answers } = studentIds.length > 0
    ? await admin
        .from('answers')
        .select('student_id, question_id, text_content')
        .in('student_id', studentIds)
        .eq('status', 'approved')
        .not('text_content', 'is', null)
    : { data: [] }

  const answersByStudent = new Map<string, any[]>()
  for (const a of (answers ?? []) as any[]) {
    const list = answersByStudent.get(a.student_id) ?? []
    list.push(a)
    answersByStudent.set(a.student_id, list)
  }

  const { data: messages } = studentIds.length > 0
    ? await admin
        .from('peer_messages')
        .select('recipient_student_id, content, author_student_id')
        .in('recipient_student_id', studentIds)
        .eq('status', 'approved')
    : { data: [] }

  const authorIds = [...new Set((messages ?? []).map((m: any) => m.author_student_id))]
  const { data: authors } = authorIds.length > 0
    ? await admin.from('students').select('id, first_name, last_name').in('id', authorIds)
    : { data: [] }
  const authorMap = new Map((authors ?? []).map((a: any) => [a.id, `${a.first_name} ${a.last_name}`]))

  const msgByStudent = new Map<string, Array<{ content: string; author_name: string }>>()
  for (const m of (messages ?? []) as any[]) {
    const list = msgByStudent.get(m.recipient_student_id) ?? []
    list.push({ content: m.content, author_name: authorMap.get(m.author_student_id) ?? 'Съученик' })
    msgByStudent.set(m.recipient_student_id, list)
  }

  const pdfStudents: PDFStudent[] = (students ?? []).map((s: any) => ({
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    photo_url: s.photo_url ?? null,
    answers: (answersByStudent.get(s.id) ?? [])
      .filter((a: any) => a.text_content)
      .map((a: any) => ({
        question_text: qMap.get(a.question_id) ?? '',
        text_content: a.text_content,
      })),
    messages: msgByStudent.get(s.id) ?? [],
  }))

  const { data: polls } = await admin
    .from('class_polls')
    .select('id, question')
    .eq('class_id', classId)
    .order('order_index')

  const pollIds = (polls ?? []).map((p: any) => p.id)
  const { data: votes } = pollIds.length > 0
    ? await admin
        .from('class_poll_votes')
        .select('poll_id, nominee_student_id')
        .in('poll_id', pollIds)
    : { data: [] }

  const studentNameMap = new Map(
    (students ?? []).map((s: any) => [s.id, `${s.first_name} ${s.last_name}`]),
  )

  const pdfPolls: PDFPoll[] = (polls ?? []).map((poll: any) => {
    const pollVotes = (votes ?? []).filter((v: any) => v.poll_id === poll.id)
    const counts: Record<string, number> = {}
    for (const v of pollVotes as any[]) {
      counts[v.nominee_student_id] = (counts[v.nominee_student_id] ?? 0) + 1
    }
    const total = Object.values(counts).reduce((s, n) => s + n, 0)
    const nominees = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, n]) => ({
        name: studentNameMap.get(id) ?? 'Непознат',
        votes: n,
        pct: total > 0 ? Math.round((n / total) * 100) : 0,
      }))
    return { question: poll.question, nominees, totalVotes: total }
  })

  const { data: events } = await admin
    .from('events')
    .select('title, event_date, note')
    .eq('class_id', classId)
    .order('order_index')

  const pdfData: PDFData = {
    classInfo: {
      name: cls.name,
      namePart,
      schoolPart: schoolPart ?? null,
      school_year: cls.school_year,
      school_logo_url: cls.school_logo_url ?? null,
      superhero_image_url: cls.superhero_image_url ?? null,
      superhero_prompt: cls.superhero_prompt ?? null,
    },
    students: pdfStudents,
    polls: pdfPolls,
    events: (events ?? []).map((e: any) => ({
      title: e.title,
      event_date: e.event_date ?? null,
      note: e.note ?? null,
    })),
  }

  let buffer: Buffer
  try {
    buffer = await generatePDFBuffer(pdfData)
  } catch (err) {
    console.error('[PDF] renderToBuffer failed:', err)
    res.status(500).json({ error: 'PDF generation failed', detail: String(err) })
    return
  }

  const filename = `lexicon-${namePart.replace(/\s+/g, '-').toLowerCase()}.pdf`
  const encodedFilename = encodeURIComponent(filename)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="lexicon.pdf"; filename*=UTF-8''${encodedFilename}`)
  res.setHeader('Cache-Control', 'no-store')
  res.send(buffer)
}
