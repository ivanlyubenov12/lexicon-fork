import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import type { PDFData, PDFStudent, PDFPoll, PDFAnswer, PDFVoiceQuestion, PDFVoiceItem, PDFEventComment, PDFStudentEvent } from '@/lib/pdf/types'

function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const s = String(url).trim()
  if (!s || s === 'undefined' || s === 'null' || !s.startsWith('http')) return null
  return s
}

function cloudinaryVideoThumbnail(videoUrl: string): string {
  return videoUrl
    .replace('/video/upload/', '/video/upload/w_400,h_300,c_fill,so_2/')
    .replace(/\.[^.]+$/, '.jpg')
}

function cloudinaryImageThumb(url: string, w = 600, h = 400): string {
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/image/upload/', `/image/upload/w_${w},h_${h},c_fill,q_auto,f_jpg/`)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: cls } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url, cover_image_url, superhero_image_url, superhero_prompt, plan, bg_pattern, template_id, stars_label, member_label, group_label, page_layouts')
    .eq('id', classId)
    .single()

  if (!cls) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }

  const [namePart, schoolPart] = cls.name.includes(' — ')
    ? cls.name.split(' — ')
    : [cls.name, null]

  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('last_name')

  const studentIds = (students ?? []).map((s: any) => s.id)

  const { data: questions } = await admin
    .from('questions')
    .select('id, text, type, voice_display, order_index')
    .eq('class_id', classId)
    .order('order_index')

  const personalQuestions = (questions ?? []).filter((q: any) =>
    ['personal', 'better_together', 'superhero'].includes(q.type)
  )
  const voiceQuestions = (questions ?? []).filter((q: any) =>
    q.type === 'class_voice'
  )
  const qMap = new Map(personalQuestions.map((q: any) => [q.id, q.text]))

  // ── Voice questions data ──────────────────────────────────────────────────
  const voiceIds = voiceQuestions.map((q: any) => q.id)
  const { data: voiceAnswers } = voiceIds.length > 0
    ? await admin
        .from('class_voice_answers')
        .select('question_id, content')
        .eq('class_id', classId)
        .in('question_id', voiceIds)
    : { data: [] }

  const pdfVoiceQuestions: PDFVoiceQuestion[] = voiceQuestions.map((q: any) => {
    const raw = (voiceAnswers ?? [])
      .filter((a: any) => a.question_id === q.id)
      .map((a: any) => a.content as string)
    const total = raw.length
    const freq: Record<string, number> = {}
    for (const w of raw) {
      const k = w.trim().toLowerCase()
      freq[k] = (freq[k] ?? 0) + 1
    }
    const maxF = Math.max(...Object.values(freq), 1)
    const items: PDFVoiceItem[] = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([k, n]) => ({
        text: raw.find((w: string) => w.trim().toLowerCase() === k) ?? k,
        size: (n >= maxF * 0.6 ? 'lg' : n >= maxF * 0.3 ? 'md' : 'sm') as 'lg' | 'md' | 'sm',
        pct: total > 0 ? Math.round((n / total) * 100) : 0,
      }))
    const voiceDisplay = (q.voice_display as 'wordcloud' | 'barchart' | null)
      ?? ((q.order_index ?? 99) <= 1 ? 'barchart' : 'wordcloud')
    return { text: q.text, items, display: voiceDisplay }
  }).filter((vq: PDFVoiceQuestion) => vq.items.length > 0)

  // ── Personal answers ──────────────────────────────────────────────────────
  const { data: answers } = studentIds.length > 0
    ? await admin
        .from('answers')
        .select('student_id, question_id, text_content, media_url, media_type')
        .in('student_id', studentIds)
        .eq('status', 'approved')
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

  // Fetch video answers — no QR generation for preview, just track for display
  const { data: allVideoAnswersRaw } = studentIds.length > 0
    ? await admin
        .from('answers')
        .select('student_id, question_id, media_url')
        .in('student_id', studentIds)
        .eq('media_type', 'video')
        .not('media_url', 'is', null)
    : { data: [] }

  // Map student → list of {question_text, qr_png: null, url}
  const videoQrsByStudent = new Map<string, Array<{ question_text: string; qr_png: null; url: string }>>()
  for (const a of (allVideoAnswersRaw ?? []) as any[]) {
    const list = videoQrsByStudent.get(a.student_id) ?? []
    list.push({
      question_text: qMap.get(a.question_id) ?? '',
      qr_png: null,
      url: a.media_url,
    })
    videoQrsByStudent.set(a.student_id, list)
  }

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
  const studentPhotoMap = new Map(
    (students ?? []).map((s: any) => [s.id, s.photo_url ?? null])
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
        id,
        name: studentNameMap.get(id) ?? 'Непознат',
        votes: n,
        pct: total > 0 ? Math.round((n / total) * 100) : 0,
        photo_url: safeUrl(studentPhotoMap.get(id)) ? cloudinaryImageThumb(safeUrl(studentPhotoMap.get(id))!, 120, 120) : null,
      }))
    return { question: poll.question, nominees, totalVotes: total }
  })

  const { data: events } = await admin
    .from('events')
    .select('id, title, event_date, note, photos')
    .eq('class_id', classId)
    .order('order_index')

  const eventIds = (events ?? []).map((e: any) => e.id)
  const { data: eventComments } = eventIds.length > 0
    ? await admin
        .from('event_comments')
        .select('event_id, comment_text, student_id, students(first_name, last_name, photo_url)')
        .in('event_id', eventIds)
    : { data: [] }

  const eventsById = new Map((events ?? []).map((e: any) => [e.id, e]))

  const commentsByEvent = new Map<string, PDFEventComment[]>()
  const eventCommentsByStudent = new Map<string, PDFStudentEvent[]>()
  for (const c of (eventComments ?? []) as any[]) {
    const list = commentsByEvent.get(c.event_id) ?? []
    list.push({
      student_name: c.students
        ? `${c.students.first_name} ${c.students.last_name}`
        : 'Ученик',
      student_photo_url: safeUrl(c.students?.photo_url) ? cloudinaryImageThumb(safeUrl(c.students!.photo_url)!, 80, 80) : null,
      text: c.comment_text,
    })
    commentsByEvent.set(c.event_id, list)

    const ev = eventsById.get(c.event_id)
    if (ev && c.student_id) {
      const slist = eventCommentsByStudent.get(c.student_id) ?? []
      slist.push({
        event_title: ev.title,
        event_date: ev.event_date ?? null,
        event_photo_url: Array.isArray(ev.photos) && ev.photos.length > 0 ? cloudinaryImageThumb(ev.photos[0], 400, 240) : null,
        comment_text: c.comment_text,
      })
      eventCommentsByStudent.set(c.student_id, slist)
    }
  }

  const pdfStudents: PDFStudent[] = (students ?? []).map((s: any) => ({
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    photo_url: safeUrl(s.photo_url) ? cloudinaryImageThumb(safeUrl(s.photo_url)!, 300, 400) : null,
    answers: (answersByStudent.get(s.id) ?? [])
      .filter((a: any) => (a.text_content || a.media_url) && qMap.has(a.question_id))
      .map((a: any): PDFAnswer => ({
        question_text: qMap.get(a.question_id) ?? '',
        text_content: a.text_content ?? null,
        media_url: a.media_url ?? null,
        media_type: a.media_type ?? null,
        video_thumbnail_url: a.media_type === 'video' && a.media_url
          ? cloudinaryVideoThumbnail(a.media_url)
          : null,
        video_qr_png: null, // omitted for browser preview
      })),
    video_qrs: videoQrsByStudent.get(s.id) ?? [],
    messages: msgByStudent.get(s.id) ?? [],
    event_comments: eventCommentsByStudent.get(s.id) ?? [],
  }))

  const pdfData: PDFData = {
    preset: (cls as any).template_id ?? null,
    starsLabel: (cls as any).stars_label ?? null,
    memberLabel: (cls as any).member_label ?? null,
    groupLabel: (cls as any).group_label ?? null,
    coverBlocks: (() => { const v = ((cls as any).page_layouts as Record<string, unknown> | null)?.cover; return Array.isArray(v) ? v as any : null })(),
    closingBlocks: ((cls as any).page_layouts as Record<string, unknown> | null)?.closing as any ?? null,
    studentPageBlocks: (() => { const v = ((cls as any).page_layouts as Record<string, unknown> | null)?.student_page; return Array.isArray(v) ? v as any : null })(),
    classInfo: {
      name: cls.name,
      namePart,
      schoolPart: schoolPart ?? null,
      school_year: cls.school_year,
      school_logo_url: cls.school_logo_url ?? null,
      cover_image_url: (cls as any).cover_image_url ?? null,
      superhero_image_url: cls.superhero_image_url ?? null,
      superhero_prompt: cls.superhero_prompt ?? null,
    },
    bg_pattern_png: null, // omitted for browser preview
    students: pdfStudents,
    polls: pdfPolls,
    voice_questions: pdfVoiceQuestions,
    events: (events ?? []).map((e: any) => ({
      id: e.id,
      title: e.title,
      event_date: e.event_date ?? null,
      note: e.note ?? null,
      photos: (Array.isArray(e.photos) ? e.photos : [])
        .filter((u: string) => safeUrl(u))
        .map((u: string) => cloudinaryImageThumb(u, 600, 420)),
      comments: commentsByEvent.get(e.id) ?? [],
    })),
  }

  return NextResponse.json(pdfData)
}
