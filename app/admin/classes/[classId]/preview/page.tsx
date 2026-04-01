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

export default async function AdminPreviewPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, status, school_logo_url, cover_image_url, superhero_prompt, superhero_image_url, layout, template_id, theme_id, bg_pattern, member_label, group_label, memories_label, stars_label')
    .eq('id', classId)
    .single()

  if (!classData) redirect('/admin/classes')

  const [namePart, schoolPart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name, null]

  const blocks: Block[] = (classData.layout as Block[] | null) ?? defaultTemplate.blocks

  const linkedQuestionIds = new Set<string>()
  const linkedVoiceIds    = new Set<string>()
  const linkedPollIds     = new Set<string>()
  for (const b of blocks) {
    const cfg = b.config as Record<string, unknown>
    if ((b.type === 'question' || b.type === 'photo_gallery') && cfg.questionId) linkedQuestionIds.add(cfg.questionId as string)
    if (b.type === 'class_voice' && cfg.questionId) linkedVoiceIds.add(cfg.questionId as string)
    if (b.type === 'subjects_bar' && cfg.questionId) linkedVoiceIds.add(cfg.questionId as string)
    if (b.type === 'poll' && cfg.pollId) linkedPollIds.add(cfg.pollId as string)
  }

  const { data: students } = await admin.from('students').select('id, first_name, last_name, photo_url').eq('class_id', classId).order('sort_order', { ascending: true, nullsFirst: false })
    .order('last_name')
  const studentList = students ?? []
  const studentMap = new Map(studentList.map(s => [s.id, s]))

  const questionData: LexiconData['questionData'] = {}
  if (linkedQuestionIds.size > 0) {
    const ids = [...linkedQuestionIds]
    const [qTexts, answers] = await Promise.all([
      admin.from('questions').select('id, text').in('id', ids),
      admin.from('answers').select('id, question_id, student_id, text_content, media_url, media_type').in('question_id', ids).eq('status', 'approved'),
    ])
    for (const q of qTexts.data ?? []) {
      questionData[q.id] = {
        text: q.text,
        answers: (answers.data ?? []).filter(a => a.question_id === q.id).map(a => {
          const s = studentMap.get(a.student_id)
          return { id: a.id, student_id: a.student_id, text_content: a.text_content, media_url: a.media_url, media_type: a.media_type,
            student: s ? { first_name: s.first_name, last_name: s.last_name, photo_url: s.photo_url ?? null } : null }
        }) as QuestionAnswer[],
      }
    }
  }

  const voiceData: LexiconData['voiceData'] = {}
  if (linkedVoiceIds.size > 0) {
    const ids = [...linkedVoiceIds]
    const [qTexts, voiceAnswers] = await Promise.all([
      admin.from('questions').select('id, text, voice_display').in('id', ids),
      admin.from('class_voice_answers').select('question_id, content').eq('class_id', classId).in('question_id', ids),
    ])
    for (const q of qTexts.data ?? []) {
      const raw = (voiceAnswers.data ?? []).filter(a => a.question_id === q.id).map(a => a.content)
      const allWords = raw.flatMap(c => c.split(',').map((w: string) => w.trim()).filter(Boolean))
      const freq: Record<string, number> = {}
      for (const w of allWords) { const k = w.toLowerCase(); freq[k] = (freq[k] ?? 0) + 1 }
      const maxF = Math.max(...Object.values(freq), 1)
      const total = raw.length
      const items: VoiceItem[] = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => ({
        text: allWords.find(w => w.toLowerCase() === k) ?? k,
        size: n >= maxF * 0.6 ? 'lg' : n >= maxF * 0.3 ? 'md' : 'sm',
        pct: total > 0 ? Math.round((n / total) * 100) : 0,
      }))
      voiceData[q.id] = { text: q.text, items, display: (q.voice_display as 'wordcloud' | 'barchart') ?? 'wordcloud' }
    }
  }

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
      pollData[p.id] = {
        question: p.question, totalVotes: total,
        nominees: Object.entries(countMap).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([sid, count]) => ({
          studentId: sid,
          name: studentMap.get(sid)?.first_name ?? 'Ученик',
          pct: total > 0 ? Math.round((count / total) * 100) : 0,
          photoUrl: studentMap.get(sid)?.photo_url ?? null,
        })),
      }
    }
  }

  const teaserMap: Record<string, string> = {}
  const firstQBlock = blocks.find(b => b.type === 'question')
  const firstQId = (firstQBlock?.config as Record<string, unknown>)?.questionId as string | undefined
  if (firstQId && questionData[firstQId]) {
    for (const a of questionData[firstQId].answers) { if (a.text_content) teaserMap[a.student_id] = a.text_content }
  }

  const { data: events } = await admin.from('events').select('id, title, event_date, note, photos').eq('class_id', classId).order('order_index').limit(20)

  const basePath = `/admin/classes/${classId}/preview`
  const lexiconData: LexiconData = {
    classId, preset: classData.template_id ?? null,
    memberLabel: (classData as any).member_label ?? null,
    groupLabel: (classData as any).group_label ?? null,
    memoriesLabel: (classData as any).memories_label ?? null,
    starsLabel: (classData as any).stars_label ?? null,
    classData: { name: classData.name, superhero_prompt: classData.superhero_prompt, superhero_image_url: classData.superhero_image_url, cover_image_url: classData.cover_image_url },
    namePart, schoolPart, studentList, teaserMap, questionData, voiceData, pollData, eventList: events ?? [],
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gray-900 text-white flex items-center justify-between px-5 py-2.5 text-sm shadow-lg">
        <Link href="/admin/classes" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад към класове
        </Link>
        <span className="font-semibold tracking-wide text-xs uppercase text-gray-400">
          Админ превю — {classData.name}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${classData.status === 'published' ? 'bg-green-700 text-green-200' : 'bg-gray-700 text-gray-300'}`}>
          {classData.status}
        </span>
      </div>
      <div className="pt-10">
        <LexiconShell classId={classId} logoUrl={classData.school_logo_url} themeId={classData.theme_id ?? classData.template_id} preset={classData.template_id} bgPattern={classData.bg_pattern} basePath={basePath} memberLabel={(classData as any).member_label} groupLabel={(classData as any).group_label} memoriesLabel={(classData as any).memories_label}>
          <LexiconBlocks blocks={blocks} data={lexiconData} basePath={basePath} />
        </LexiconShell>
      </div>
    </>
  )
}
