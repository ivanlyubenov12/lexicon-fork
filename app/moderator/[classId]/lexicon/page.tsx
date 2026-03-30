export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import Link from 'next/link'
import QuestionsEditor from '../questions/QuestionsEditor'
import PollsEditor from '../polls/PollsEditor'
import MessagesTable from '../messages/MessagesTable'
import { QUESTION_PRESETS } from '@/lib/templates/defaultSeed'
import TemplateAccordion from './TemplateAccordion'
import { updateBgPattern } from './bgActions'
import { updateTheme } from './themeActions'
import type { QuestionPreset } from '@/lib/templates/defaultSeed'
import { BG_PATTERN_OPTIONS } from '@/lib/lexicon/bgPatterns'
import { themes } from '@/lib/templates/themes'

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
  sports: {
    emoji: '⚽',
    description: 'За спортен отбор',
    examples: ['Любима позиция', 'Тайна суперсила на терена', 'Мечтан клуб'],
  },
  friends: {
    emoji: '👥',
    description: 'За приятелска група',
    examples: ['Как се запознахме', 'Тайна суперсила', 'Най-смешен спомен'],
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
    .select('id, name, school_year, school_logo_url, template_id, theme_id, bg_pattern, layout, is_customized')
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
    const preset = classData.template_id ?? 'primary'
    const [sysRes, cusRes] = await Promise.all([
      admin.from('questions')
        .select('id, text, type, allows_text, allows_media, max_length, order_index, description, voice_display, is_featured, poll_options, is_anonymous')
        .is('class_id', null).eq('is_system', true).eq('preset', preset).order('order_index'),
      admin.from('questions')
        .select('id, text, type, allows_text, allows_media, max_length, order_index, description, voice_display, is_featured, poll_options, is_anonymous')
        .eq('class_id', classId).order('order_index'),
    ])
    const normalise = (rows: any[] | null) => (rows ?? []).map(q => ({
      ...q,
      description: q.description ?? null,
      voice_display: q.voice_display ?? null,
      is_featured: q.is_featured ?? false,
      max_length: q.max_length ?? null,
      poll_options: q.poll_options ?? null,
      is_anonymous: q.is_anonymous ?? true,
    }))
    systemQuestions = normalise(sysRes.data)

    // Deduplicate custom questions by text — keep lowest order_index, delete the rest
    const allCustom = normalise(cusRes.data)
    const firstByText = new Map<string, any>()
    for (const q of allCustom) {
      if (!firstByText.has(q.text)) firstByText.set(q.text, q)
    }
    const toDelete = allCustom.filter(q => firstByText.get(q.text).id !== q.id).map(q => q.id)
    customQuestions = allCustom.filter(q => !toDelete.includes(q.id))

    if (toDelete.length > 0) {
      await admin.from('answers').delete().in('question_id', toDelete)
      await admin.from('class_voice_answers').delete().in('question_id', toDelete)
      await admin.from('questions').delete().in('id', toDelete)

      // Patch layout blocks that reference deleted IDs → replace with kept ID for same text
      const deletedToKept = new Map(toDelete.map(id => {
        const deleted = allCustom.find(q => q.id === id)!
        return [id, firstByText.get(deleted.text).id as string]
      }))
      const currentLayout = (classData.layout as any[] | null) ?? []
      const patched = currentLayout.map((b: any) => {
        const qid = b.config?.questionId as string | undefined
        if (qid && deletedToKept.has(qid)) {
          return { ...b, config: { ...b.config, questionId: deletedToKept.get(qid) } }
        }
        return b
      })
      if (patched.some((b: any, i: number) => b !== currentLayout[i])) {
        await admin.from('classes').update({ layout: patched }).eq('id', classId)
      }
    }
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

      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Лексикон</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
              Настройки на лексикона
            </h1>
          </div>
          <Link
            href={`/moderator/${classId}/layout`}
            className="flex-shrink-0 flex items-center gap-2 bg-white border border-gray-200 hover:border-indigo-400 hover:text-indigo-700 text-gray-600 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            Редактирай оформлението
          </Link>
        </div>

        {/* Tab nav */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-8 hide-scrollbar">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit min-w-full sm:min-w-0">
            {TABS.map(t => (
              <Link
                key={t.key}
                href={`/moderator/${classId}/lexicon?tab=${t.key}`}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
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
        </div>

        {/* ── Шаблон ──────────────────────────────────────────────────────── */}
        {tab === 'template' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-6">
              Шаблонът определя въпросника. Избраният шаблон може да се донастрои с цветова палитра и фон.
            </p>
            <TemplateAccordion
              classId={classId}
              presets={QUESTION_PRESETS.map(p => ({
                id: p.id,
                label: p.label,
                emoji: PRESET_META[p.id]?.emoji ?? '',
                description: PRESET_META[p.id]?.description ?? '',
                examples: PRESET_META[p.id]?.examples ?? [],
              }))}
              activePresetId={classData.template_id ?? null}
              isCustomized={!!(classData as any).is_customized}
            />

            {/* ── По поръчка — active when is_customized ── */}
            {(() => {
              const isCustomActive = !!(classData as any).is_customized
              const activeThemeId  = classData.theme_id ?? 'classic'
              const activeBgId     = classData.bg_pattern ?? 'school'
              return (
                <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${
                  isCustomActive ? 'border-indigo-500 shadow-md' : 'border-dashed border-gray-200'
                }`}>
                  <div className="p-4 sm:p-6 flex items-start gap-4 sm:gap-5">
                    <span className="text-4xl leading-none mt-0.5">✏️</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-base">По поръчка</span>
                        {isCustomActive && (
                          <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Текущ</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {isCustomActive
                          ? `Базиран на „${PRESET_META[classData.template_id ?? 'primary']?.emoji} ${QUESTION_PRESETS.find(p => p.id === classData.template_id)?.label ?? classData.template_id}" с персонализирани промени.`
                          : 'Направи промяна в цветовата палитра, фона, въпросника или наредбата на блоковете — шаблонът автоматично ще стане „По поръчка".'}
                      </p>
                    </div>
                  </div>

                  {/* Customisation pickers — shown when active */}
                  {isCustomActive && (
                    <div className="border-t border-indigo-100 bg-indigo-50/40 px-4 sm:px-6 py-5 space-y-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Цветова палитра</p>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {Object.values(themes).map(theme => {
                            const sel     = activeThemeId === theme.id
                            const primary = (theme.vars as Record<string, string>)['--lex-primary']
                            const bg      = (theme.vars as Record<string, string>)['--lex-bg']
                            const accent  = (theme.vars as Record<string, string>)['--lex-accent']
                            return (
                              <form key={theme.id} action={updateTheme.bind(null, classId, theme.id)}>
                                <button type="submit" title={theme.name}
                                  className={`w-full rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
                                    sel ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                                >
                                  <div className="h-10 w-full flex items-end px-2 pb-1.5 gap-1" style={{ backgroundColor: bg }}>
                                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: primary }} />
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                                    <div className="flex-1 h-1.5 rounded-full opacity-20" style={{ backgroundColor: primary }} />
                                  </div>
                                  <div className="px-2 py-1.5 text-center">
                                    <span className="text-xs font-semibold text-gray-700">{theme.name}</span>
                                  </div>
                                </button>
                              </form>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Фон</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {BG_PATTERN_OPTIONS.map(opt => {
                            const sel = activeBgId === opt.id
                            return (
                              <form key={opt.id} action={updateBgPattern.bind(null, classId, opt.id)}>
                                <button type="submit" title={opt.name}
                                  className={`w-full rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
                                    sel ? 'border-indigo-500 shadow-sm' : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                                >
                                  <div className={`h-10 w-full ${opt.previewClass} flex items-center justify-center`}>
                                    {opt.id === 'school'       && <span className="text-base opacity-70">✏️📐</span>}
                                    {opt.id === 'kindergarten' && <span className="text-base opacity-70">🧸🌈</span>}
                                    {opt.id === 'teens'        && <span className="text-base opacity-70">🎓💻</span>}
                                    {opt.id === 'levski'       && <span className="text-base opacity-70">⚽⭐</span>}
                                    {opt.id === 'none'         && <span className="text-sm opacity-30 font-medium text-gray-400">Аа</span>}
                                  </div>
                                  <div className="px-2 py-1.5 text-center">
                                    <span className="text-xs font-semibold text-gray-700">{opt.name}</span>
                                  </div>
                                </button>
                              </form>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`px-4 sm:px-6 py-3 flex items-center justify-between gap-2 ${
                    isCustomActive ? 'border-t border-indigo-100' : 'border-t border-gray-100'
                  }`}>
                    <span className="text-xs text-gray-400">
                      {isCustomActive ? 'Персонализиран шаблон' : 'Промени нещо, за да активираш'}
                    </span>
                    {isCustomActive && (
                      <Link href={`/moderator/${classId}/preview`} target="_blank"
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Прегледай лексикона
                      </Link>
                    )}
                  </div>
                </div>
              )
            })()}
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
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
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
