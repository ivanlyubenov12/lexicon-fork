export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import Link from 'next/link'
import QuestionsEditor from '../questions/QuestionsEditor'
import PollsEditor from '../polls/PollsEditor'
import MessagesTable from '../messages/MessagesTable'
import { QUESTION_PRESETS } from '@/lib/templates/defaultSeed'
import { applyTemplate } from '../template/actions'
import type { QuestionPreset } from '@/lib/templates/defaultSeed'

const TABS = [
  { key: 'template',   label: 'Шаблон',     icon: 'style' },
  { key: 'questions',  label: 'Въпросник',  icon: 'quiz' },
  { key: 'polls',      label: 'Анкети',     icon: 'poll' },
  { key: 'messages',   label: 'Послания',   icon: 'forum' },
] as const

type Tab = typeof TABS[number]['key']

const PRESET_META: Record<string, { emoji: string; description: string; examples: string[] }> = {
  primary: {
    emoji: '📚',
    description: 'За ученици от 1 до 4 клас',
    examples: ['Любим предмет', 'Тайна суперсила', 'Мечта за бъдещето'],
  },
  kindergarten: {
    emoji: '🧸',
    description: 'За деца от детска градина',
    examples: ['Любима играчка', 'Любимо животно', 'Любима приказка'],
  },
  teens: {
    emoji: '🎓',
    description: 'За ученици от 5 до 12 клас',
    examples: ['Бъдеща кариера', 'Неща, от които ме е срам', 'Съвет към 5-годишния мен'],
  },
}

interface MessageRow {
  id: string; content: string; status: string; created_at: string
  recipient_student_id: string; author_student_id: string
  recipient: { first_name: string; last_name: string }
  author: { first_name: string; last_name: string }
}

export default async function LexiconPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { classId } = await params
  const { tab: tabParam } = await searchParams
  const tab: Tab = (TABS.map(t => t.key) as string[]).includes(tabParam ?? '') ? tabParam as Tab : 'template'

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url, template_id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!classData) redirect('/moderator')

  const [namePart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name]

  // ── Tab-specific data ────────────────────────────────────────────────────

  // Questions tab
  let systemQuestions: any[] = []
  let customQuestions: any[] = []
  if (tab === 'questions') {
    const [sysRes, cusRes] = await Promise.all([
      admin.from('questions')
        .select('id, text, type, allows_text, allows_media, max_length, order_index, description, voice_display, is_featured')
        .is('class_id', null).eq('is_system', true).order('order_index'),
      admin.from('questions')
        .select('id, text, type, allows_text, allows_media, max_length, order_index, description, voice_display, is_featured')
        .eq('class_id', classId).eq('is_system', false).order('order_index'),
    ])
    const normalise = (rows: any[] | null) => (rows ?? []).map(q => ({
      ...q,
      description: q.description ?? null,
      voice_display: q.voice_display ?? null,
      is_featured: q.is_featured ?? false,
      max_length: q.max_length ?? null,
    }))
    systemQuestions = normalise(sysRes.data)
    customQuestions = normalise(cusRes.data)
  }

  // Polls tab
  let pollsWithCounts: any[] = []
  let studentCount = 0
  if (tab === 'polls') {
    const { data: polls } = await admin.from('class_polls')
      .select('id, question, order_index').eq('class_id', classId).order('order_index')
    const { data: votes } = await admin.from('class_poll_votes')
      .select('poll_id, nominee_student_id, students!class_poll_votes_nominee_student_id_fkey(first_name, last_name)')
      .in('poll_id', (polls ?? []).map(p => p.id))
    const voteMap: Record<string, Record<string, { name: string; count: number }>> = {}
    for (const vote of votes ?? []) {
      if (!voteMap[vote.poll_id]) voteMap[vote.poll_id] = {}
      const s = (vote as any).students
      const name = s ? `${s.first_name} ${s.last_name}` : 'Неизвестен'
      if (!voteMap[vote.poll_id][vote.nominee_student_id])
        voteMap[vote.poll_id][vote.nominee_student_id] = { name, count: 0 }
      voteMap[vote.poll_id][vote.nominee_student_id].count++
    }
    pollsWithCounts = (polls ?? []).map(p => ({
      ...p,
      vote_counts: Object.values(voteMap[p.id] ?? {})
        .sort((a, b) => b.count - a.count)
        .map(v => ({ nominee_name: v.name, votes: v.count })),
    }))
    const { count } = await admin.from('students')
      .select('id', { count: 'exact', head: true }).eq('class_id', classId)
    studentCount = count ?? 0
  }

  // Messages tab
  let messages: MessageRow[] = []
  let pendingMsgCount = 0
  if (tab === 'messages') {
    const { data: students } = await admin.from('students')
      .select('id').eq('class_id', classId)
    const studentIds = (students ?? []).map(s => s.id)
    if (studentIds.length > 0) {
      const { data } = await admin.from('peer_messages')
        .select('id, content, status, created_at, recipient_student_id, author_student_id, recipient:students!recipient_student_id(first_name, last_name), author:students!author_student_id(first_name, last_name)')
        .in('recipient_student_id', studentIds)
        .order('created_at', { ascending: false })
      messages = (data ?? []) as unknown as MessageRow[]
    }
    pendingMsgCount = messages.filter(m => m.status === 'pending').length
  }

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData.school_year ?? null}
        logoUrl={classData.school_logo_url ?? null}
        active="lexicon"
      />

      <main className="ml-64 flex-1 p-8 lg:p-12">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Лексикон</p>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
            Настройки на лексикона
          </h1>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          {TABS.map(t => (
            <Link
              key={t.key}
              href={`/moderator/${classId}/lexicon?tab=${t.key}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </div>

        {/* ── Шаблон ──────────────────────────────────────────────────────── */}
        {tab === 'template' && (
          <div className="max-w-2xl space-y-4">
            <p className="text-sm text-gray-500 mb-6">
              Шаблонът определя въпросника и оформлението на лексикона.
            </p>
            {QUESTION_PRESETS.map(preset => {
              const meta = PRESET_META[preset.id]
              const isActive = classData.template_id === preset.id
              return (
                <form key={preset.id} action={applyTemplate.bind(null, classId, preset.id as QuestionPreset)}>
                  <button
                    type="submit"
                    className={`w-full text-left bg-white border-2 rounded-2xl p-6 flex items-start gap-5 hover:border-indigo-400 hover:shadow-md transition-all group ${
                      isActive ? 'border-indigo-500 shadow-sm' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-4xl leading-none mt-0.5">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-base">{preset.label}</span>
                        {isActive && (
                          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Текущ</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{meta.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {meta.examples.map(ex => (
                          <span key={ex} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{ex}</span>
                        ))}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-500 transition-colors mt-1 flex-shrink-0">arrow_forward</span>
                  </button>
                </form>
              )
            })}
            <div className="pt-2">
              <Link
                href={`/moderator/${classId}/layout`}
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium"
              >
                <span className="material-symbols-outlined text-base">tune</span>
                Редактирай оформлението на блокове
              </Link>
            </div>
          </div>
        )}

        {/* ── Въпросник ───────────────────────────────────────────────────── */}
        {tab === 'questions' && (
          <QuestionsEditor
            classId={classId}
            systemQuestions={systemQuestions}
            customQuestions={customQuestions}
          />
        )}

        {/* ── Анкети ──────────────────────────────────────────────────────── */}
        {tab === 'polls' && (
          <PollsEditor
            classId={classId}
            initialPolls={pollsWithCounts}
            studentCount={studentCount}
          />
        )}

        {/* ── Послания ────────────────────────────────────────────────────── */}
        {tab === 'messages' && (
          <div>
            <div className="flex items-end justify-between gap-6 mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
                  Послания между деца
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Прегледайте и одобрете посланията, написани от учениците един към друг.
                </p>
              </div>
              {pendingMsgCount > 0 && (
                <div className="flex-shrink-0 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                  <span className="material-symbols-outlined text-amber-500 text-base">pending</span>
                  <span className="text-sm font-semibold text-amber-700">{pendingMsgCount} чакащи</span>
                </div>
              )}
            </div>
            <MessagesTable messages={messages} classId={classId} />
          </div>
        )}
      </main>
    </div>
  )
}
