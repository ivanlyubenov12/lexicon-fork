export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { defaultTemplate } from '@/lib/templates/presets'
import type { Block } from '@/lib/templates/types'
import LexiconShell from '@/app/lexicon/[classId]/LexiconShell'
import LexiconBlocks from '@/app/lexicon/[classId]/LexiconBlocks'
import type { LexiconData, QuestionAnswer, VoiceItem } from '@/app/lexicon/[classId]/LexiconBlocks'

export default async function ModeratorPreviewPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  noStore()
  const { classId } = await params
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, status, school_logo_url, cover_image_url, superhero_prompt, superhero_image_url, layout, template_id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!classData) redirect('/moderator')

  const [namePart, schoolPart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name, null]

  const blocks: Block[] = (classData.layout as Block[] | null) ?? defaultTemplate.blocks

  // ── Collect linked IDs ────────────────────────────────────────────────────
  const linkedQuestionIds = new Set<string>()
  const linkedVoiceIds    = new Set<string>()
  const linkedPollIds     = new Set<string>()

  for (const b of blocks) {
    const cfg = b.config as Record<string, unknown>
    if ((b.type === 'question' || b.type === 'photo_gallery') && cfg.questionId)
      linkedQuestionIds.add(cfg.questionId as string)
    if (b.type === 'class_voice' && cfg.questionId)
      linkedVoiceIds.add(cfg.questionId as string)
    if (b.type === 'poll' && cfg.pollId)
      linkedPollIds.add(cfg.pollId as string)
  }

  // ── Students ──────────────────────────────────────────────────────────────
  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', classId)
    .order('last_name')
  const studentList = students ?? []
  const studentMap = new Map(studentList.map(s => [s.id, s]))

  // ── Progress: how many students have at least one submitted/approved answer
  const studentIds = studentList.map(s => s.id)
  const { data: submittedAnswers } = studentIds.length > 0
    ? await admin
        .from('answers')
        .select('student_id')
        .in('student_id', studentIds)
        .in('status', ['submitted', 'approved'])
    : { data: [] }
  const studentsWithAnswers = new Set((submittedAnswers ?? []).map((a: any) => a.student_id)).size
  const totalStudents = studentList.length

  // ── Question answers ──────────────────────────────────────────────────────
  const questionData: LexiconData['questionData'] = {}

  if (linkedQuestionIds.size > 0) {
    const ids = [...linkedQuestionIds]
    const [qTexts, answers] = await Promise.all([
      admin.from('questions').select('id, text').in('id', ids),
      admin.from('answers')
        .select('id, question_id, student_id, text_content, media_url, media_type')
        .in('question_id', ids)
        .eq('status', 'approved'),
    ])
    for (const q of qTexts.data ?? []) {
      const qAnswers: QuestionAnswer[] = (answers.data ?? [])
        .filter(a => a.question_id === q.id)
        .map(a => {
          const s = studentMap.get(a.student_id)
          return {
            id: a.id,
            student_id: a.student_id,
            text_content: a.text_content,
            media_url: a.media_url,
            media_type: a.media_type,
            student: s ? { first_name: s.first_name, last_name: s.last_name, photo_url: s.photo_url ?? null } : null,
          }
        })
      questionData[q.id] = { text: q.text, answers: qAnswers }
    }
  }

  // ── Class voice ───────────────────────────────────────────────────────────
  const voiceData: LexiconData['voiceData'] = {}

  if (linkedVoiceIds.size > 0) {
    const ids = [...linkedVoiceIds]
    const [qTexts, voiceAnswers] = await Promise.all([
      admin.from('questions').select('id, text').in('id', ids),
      admin.from('class_voice_answers').select('question_id, content').eq('class_id', classId).in('question_id', ids),
    ])
    for (const q of qTexts.data ?? []) {
      const raw = (voiceAnswers.data ?? []).filter(a => a.question_id === q.id).map(a => a.content)
      const freq: Record<string, number> = {}
      for (const w of raw) { const k = w.trim().toLowerCase(); freq[k] = (freq[k] ?? 0) + 1 }
      const maxF = Math.max(...Object.values(freq), 1)
      const items: VoiceItem[] = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([k, n]) => ({
          text: raw.find(w => w.trim().toLowerCase() === k) ?? k,
          size: n >= maxF * 0.6 ? 'lg' : n >= maxF * 0.3 ? 'md' : 'sm',
        }))
      voiceData[q.id] = { text: q.text, items }
    }
  }

  // ── Polls ─────────────────────────────────────────────────────────────────
  const pollData: LexiconData['pollData'] = {}

  if (linkedPollIds.size > 0) {
    const ids = [...linkedPollIds]
    const [pollRows, votes] = await Promise.all([
      admin.from('class_polls').select('id, question').in('id', ids),
      admin.from('class_poll_votes').select('poll_id, nominee_student_id').in('poll_id', ids),
    ])
    for (const p of pollRows.data ?? []) {
      const pvotes = (votes.data ?? []).filter(v => v.poll_id === p.id)
      const countMap: Record<string, number> = {}
      for (const v of pvotes) countMap[v.nominee_student_id] = (countMap[v.nominee_student_id] ?? 0) + 1
      const total = pvotes.length
      const nominees = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([sid, count]) => ({
          name: studentMap.get(sid)?.first_name ?? 'Ученик',
          pct: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
      pollData[p.id] = { question: p.question, nominees, totalVotes: total }
    }
  }

  // ── Teaser map ────────────────────────────────────────────────────────────
  const teaserMap: Record<string, string> = {}
  const firstQBlock = blocks.find(b => b.type === 'question')
  const firstQId = (firstQBlock?.config as Record<string, unknown>)?.questionId as string | undefined
  if (firstQId && questionData[firstQId]) {
    for (const a of questionData[firstQId].answers) {
      if (a.text_content) teaserMap[a.student_id] = a.text_content
    }
  } else {
    const { data: firstQ } = await admin
      .from('questions').select('id').eq('class_id', classId).eq('type', 'personal').order('order_index').limit(1).single()
    if (firstQ) {
      const { data: ta } = await admin.from('answers').select('student_id, text_content').eq('question_id', firstQ.id).eq('status', 'approved')
      for (const a of ta ?? []) { if (a.text_content) teaserMap[a.student_id] = a.text_content }
    }
  }

  // ── Events ────────────────────────────────────────────────────────────────
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
    questionData,
    voiceData,
    pollData,
    eventList: events ?? [],
  }

  const pct = totalStudents > 0 ? Math.round((studentsWithAnswers / totalStudents) * 100) : 0

  return (
    <>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-indigo-900 text-white flex items-center justify-between px-5 py-2.5 text-sm shadow-lg">
        <Link
          href={`/moderator/${classId}`}
          className="flex items-center gap-1.5 text-indigo-200 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад към панела
        </Link>

        <span className="font-semibold tracking-wide text-xs uppercase text-indigo-300">
          Превю — само ти виждаш това
        </span>

        <div className="flex items-center gap-2 text-indigo-200">
          <div className="w-24 h-1.5 rounded-full bg-indigo-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs tabular-nums">
            {studentsWithAnswers}/{totalStudents} деца
          </span>
        </div>
      </div>

      {/* Lexicon content pushed below banner */}
      <div className="pt-10">
        <LexiconShell classId={classId} logoUrl={classData.school_logo_url} themeId={classData.template_id} basePath={`/moderator/${classId}/preview`}>
          <LexiconBlocks blocks={blocks} data={lexiconData} basePath={`/moderator/${classId}/preview`} />
        </LexiconShell>
      </div>
    </>
  )
}
