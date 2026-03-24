export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { defaultTemplate } from '@/lib/templates/presets'
import type { Block } from '@/lib/templates/types'
import LexiconShell from './LexiconShell'
import LexiconBlocks from './LexiconBlocks'
import type { LexiconData } from './LexiconBlocks'

export default async function LexiconCoverPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  // ── Class data ──────────────────────────────────────────────────────
  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, status, superhero_prompt, superhero_image_url, school_logo_url, cover_image_url, layout, template_id')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  const [namePart, schoolPart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name, null]

  // Use saved layout or fall back to default template blocks
  const blocks: Block[] = (classData.layout as Block[] | null) ?? defaultTemplate.blocks

  // ── Students ────────────────────────────────────────────────────────
  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', classId)
    .order('last_name')

  const studentList = students ?? []

  // ── Teasers: first personal question answers ─────────────────────────
  const { data: firstPersonalQArr } = await admin
    .from('questions')
    .select('id')
    .eq('class_id', classId)
    .eq('type', 'personal')
    .order('order_index')
    .limit(1)

  const teaserMap: Record<string, string> = {}
  if (firstPersonalQArr?.[0]) {
    const { data: teaserAnswers } = await admin
      .from('answers')
      .select('student_id, text_content')
      .eq('question_id', firstPersonalQArr[0].id)
      .eq('status', 'approved')
    for (const a of teaserAnswers ?? []) {
      if (a.text_content) teaserMap[a.student_id] = a.text_content
    }
  }

  // ── Voice answers (word cloud) ───────────────────────────────────────
  const { data: voiceQs } = await admin
    .from('questions')
    .select('id, text')
    .eq('class_id', classId)
    .eq('type', 'class_voice')
    .order('order_index')

  const voiceQIds = (voiceQs ?? []).map(q => q.id)
  const voiceAnswersRaw = voiceQIds.length > 0
    ? ((await admin.from('class_voice_answers').select('question_id, content').eq('class_id', classId).in('question_id', voiceQIds)).data ?? [])
    : []

  const firstVoiceQ = voiceQs?.[0] ?? null
  const firstVoiceAnswers = firstVoiceQ
    ? voiceAnswersRaw.filter(a => a.question_id === firstVoiceQ.id).map(a => a.content)
    : []

  const voiceFreq: Record<string, number> = {}
  for (const a of firstVoiceAnswers) {
    const key = a.trim().toLowerCase()
    voiceFreq[key] = (voiceFreq[key] ?? 0) + 1
  }
  const maxFreq = Math.max(...Object.values(voiceFreq), 1)
  const voiceItems = Object.entries(voiceFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([key, count]) => ({
      text: firstVoiceAnswers.find(a => a.trim().toLowerCase() === key) ?? key,
      size: count >= maxFreq * 0.6 ? 'lg' as const : count >= maxFreq * 0.3 ? 'md' as const : 'sm' as const,
    }))

  // ── Polls (bar chart) ─────────────────────────────────────────────────
  const { data: polls } = await admin
    .from('class_polls')
    .select('id, question')
    .eq('class_id', classId)
    .order('order_index')

  const pollIds = (polls ?? []).map(p => p.id)
  const pollVotesRaw = pollIds.length > 0
    ? ((await admin.from('class_poll_votes').select('poll_id, nominee_student_id').in('poll_id', pollIds)).data ?? [])
    : []

  const studentNameMap = new Map(studentList.map(s => [s.id, s.first_name]))

  const pollResults = (polls ?? []).map(poll => {
    const votes = pollVotesRaw.filter(v => v.poll_id === poll.id)
    const countMap: Record<string, number> = {}
    for (const v of votes) countMap[v.nominee_student_id] = (countMap[v.nominee_student_id] ?? 0) + 1
    const total = votes.length
    const nominees = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([sid, count]) => ({
        name: studentNameMap.get(sid) ?? 'Ученик',
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
    return { id: poll.id, question: poll.question, nominees, totalVotes: total }
  }).filter(p => p.nominees.length > 0)

  // ── Events preview ────────────────────────────────────────────────────
  const { data: events } = await admin
    .from('events')
    .select('id, title, event_date, note, photos')
    .eq('class_id', classId)
    .order('order_index')
    .limit(20)

  const lexiconData: LexiconData = {
    classId,
    classData: {
      name: classData.name,
      superhero_prompt: classData.superhero_prompt,
      superhero_image_url: classData.superhero_image_url,
      cover_image_url: classData.cover_image_url,
    },
    namePart,
    schoolPart,
    studentList,
    teaserMap,
    voiceItems,
    firstVoiceQ,
    pollResults,
    eventList: events ?? [],
  }

  return (
    <LexiconShell classId={classId} logoUrl={classData.school_logo_url} themeId={classData.template_id}>
      <LexiconBlocks blocks={blocks} data={lexiconData} />
    </LexiconShell>
  )
}
