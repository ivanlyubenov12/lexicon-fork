import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { defaultTemplate } from '@/lib/templates/presets'
import type { Block, LayoutAssets } from '@/lib/templates/types'
import type { LexiconData, QuestionAnswer, VoiceItem } from '@/app/lexicon/[classId]/LexiconBlocks'
import LayoutEditor from './LayoutEditor'

export default async function LayoutPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const [clsRes, questionsRes, voiceQsRes, pollsRes, eventsRes, studentsRes] = await Promise.all([
    admin
      .from('classes')
      .select('id, name, layout, template_id, cover_image_url, superhero_prompt, superhero_image_url, school_year, school_logo_url')
      .eq('id', classId)
      .eq('moderator_id', user.id)
      .single(),

    admin
      .from('questions')
      .select('id, text, type')
      .eq('class_id', classId)
      .eq('type', 'personal')
      .order('order_index'),

    admin
      .from('questions')
      .select('id, text, description, type, max_length, voice_display, order_index')
      .eq('class_id', classId)
      .eq('type', 'class_voice')
      .order('order_index'),

    admin
      .from('class_polls')
      .select('id, question')
      .eq('class_id', classId)
      .order('order_index'),

    admin
      .from('events')
      .select('id, title, event_date, note, photos')
      .eq('class_id', classId)
      .order('order_index')
      .limit(20),

    admin
      .from('students')
      .select('id, first_name, last_name, photo_url')
      .eq('class_id', classId)
      .order('last_name'),
  ])

  if (!clsRes.data) redirect('/moderator')

  const cls = clsRes.data
  const savedBlocks = cls.layout as Block[] | null
  const initialBlocks: Block[] = savedBlocks?.length ? savedBlocks : defaultTemplate.blocks

  // Back-fill voice_display for questions that predate migration 017.
  const voiceQsRaw = voiceQsRes.data ?? []
  const nullVoiceQs = voiceQsRaw.filter(q => q.voice_display === null)
  if (nullVoiceQs.length > 0) {
    await Promise.all(nullVoiceQs.map(q =>
      admin.from('questions').update({
        voice_display: q.order_index <= 1 ? 'barchart' : 'wordcloud',
      }).eq('id', q.id)
    ))
    for (const q of voiceQsRaw) {
      if (q.voice_display === null) {
        q.voice_display = q.order_index <= 1 ? 'barchart' : 'wordcloud'
      }
    }
  }

  const assets: LayoutAssets = {
    questions: (questionsRes.data ?? []).map(q => ({ id: q.id, label: q.text, type: q.type })),
    voiceQuestions: voiceQsRaw.map(q => ({
      id: q.id,
      label: q.text,
      description: q.description ?? null,
      type: q.type,
      max_length: q.max_length ?? null,
      voice_display: (q.voice_display as 'wordcloud' | 'barchart') ?? 'wordcloud',
      order_index: q.order_index ?? 0,
    })),
    polls: (pollsRes.data ?? []).map(p => ({ id: p.id, label: p.question })),
    events: (eventsRes.data ?? []).map(e => ({ id: e.id, label: e.title })),
    coverImageUrl: cls.cover_image_url ?? null,
  }

  // ── Build live lexicon data for the preview panel ─────────────────────────
  const studentList = studentsRes.data ?? []
  const studentMap = new Map(studentList.map(s => [s.id, s]))

  // Question answers (all approved for this class)
  const questionIds = (questionsRes.data ?? []).map(q => q.id)
  const questionData: LexiconData['questionData'] = {}
  if (questionIds.length > 0) {
    const [qTextsRes, answersRes] = await Promise.all([
      admin.from('questions').select('id, text').in('id', questionIds),
      admin.from('answers')
        .select('id, question_id, student_id, text_content, media_url, media_type')
        .in('question_id', questionIds)
        .eq('status', 'approved'),
    ])
    for (const q of qTextsRes.data ?? []) {
      const qAnswers: QuestionAnswer[] = (answersRes.data ?? [])
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

  // Voice answers (all for this class)
  const voiceIds = voiceQsRaw.map(q => q.id)
  const voiceData: LexiconData['voiceData'] = {}
  if (voiceIds.length > 0) {
    const voiceAnswersRes = await admin
      .from('class_voice_answers')
      .select('question_id, content')
      .eq('class_id', classId)
      .in('question_id', voiceIds)
    for (const q of voiceQsRaw) {
      const display = (q.voice_display as 'wordcloud' | 'barchart') ?? 'wordcloud'
      const raw = (voiceAnswersRes.data ?? []).filter(a => a.question_id === q.id).map(a => a.content)
      const total = raw.length
      const freq: Record<string, number> = {}
      for (const w of raw) { const k = w.trim().toLowerCase(); freq[k] = (freq[k] ?? 0) + 1 }
      const maxF = Math.max(...Object.values(freq), 1)
      const items: VoiceItem[] = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([k, n]) => ({
          text: raw.find(w => w.trim().toLowerCase() === k) ?? k,
          size: n >= maxF * 0.6 ? 'lg' : n >= maxF * 0.3 ? 'md' : 'sm',
          pct: total > 0 ? Math.round((n / total) * 100) : 0,
        }))
      voiceData[q.id] = { text: q.text, items, display }
    }
  }

  // Poll data
  const pollIds = (pollsRes.data ?? []).map(p => p.id)
  const pollData: LexiconData['pollData'] = {}
  if (pollIds.length > 0) {
    const votesRes = await admin
      .from('class_poll_votes')
      .select('poll_id, nominee_student_id')
      .in('poll_id', pollIds)
    for (const p of pollsRes.data ?? []) {
      const pvotes = (votesRes.data ?? []).filter(v => v.poll_id === p.id)
      const countMap: Record<string, number> = {}
      for (const v of pvotes) countMap[v.nominee_student_id] = (countMap[v.nominee_student_id] ?? 0) + 1
      const total = pvotes.length
      const nominees = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([sid, count]) => ({
          studentId: sid,
          name: studentMap.get(sid)?.first_name ?? 'Ученик',
          pct: total > 0 ? Math.round((count / total) * 100) : 0,
          photoUrl: studentMap.get(sid)?.photo_url ?? null,
        }))
      pollData[p.id] = { question: p.question, nominees, totalVotes: total }
    }
  }

  // Teaser map (first question answers)
  const teaserMap: Record<string, string> = {}
  const firstQ = questionsRes.data?.[0]
  if (firstQ && questionData[firstQ.id]) {
    for (const a of questionData[firstQ.id].answers) {
      if (a.text_content) teaserMap[a.student_id] = a.text_content
    }
  }

  const [namePart, schoolPart] = cls.name.includes(' — ')
    ? cls.name.split(' — ')
    : [cls.name, null]

  const lexiconData: LexiconData = {
    classId,
    classData: {
      name: cls.name,
      superhero_prompt: cls.superhero_prompt ?? null,
      superhero_image_url: cls.superhero_image_url ?? null,
      cover_image_url: cls.cover_image_url ?? null,
    },
    namePart,
    schoolPart,
    studentList,
    teaserMap,
    questionData,
    voiceData,
    pollData,
    eventList: eventsRes.data ?? [],
  }

  return (
    <LayoutEditor
      classId={classId}
      className={cls.name}
      initialBlocks={initialBlocks}
      templateId={cls.template_id ?? 'primary'}
      assets={assets}
      lexiconData={lexiconData}
    />
  )
}
