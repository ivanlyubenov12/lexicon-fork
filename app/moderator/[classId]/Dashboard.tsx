'use client'

import Link from 'next/link'
import ModeratorWizard from './ModeratorWizard'

interface Contribution {
  id: string
  text_content: string | null
  media_url: string | null
  media_type: string | null
  updated_at: string
  student_id: string
  questions: { text: string } | null
  students: { first_name: string; last_name: string; photo_url: string | null } | null
}

interface Props {
  classData: { id: string; name: string; school_year: string; status: string; school_logo_url: string | null; plan?: string | null; template_id?: string | null; memberLabel?: string | null; groupLabel?: string | null }
  moderatorEmail: string | null
  deadline: string | null
  students: Array<{ id: string; first_name: string; last_name: string; invite_accepted_at: string | null; questionnaire_submitted: boolean }>
  awaitingApproval: Array<{ id: string; first_name: string; last_name: string; invite_accepted_at: string | null; questionnaire_submitted: boolean }>
  pendingAnswers: number
  pendingMessages: number
  approvedAnswers: number
  hasQuestionnaire: boolean
  hasLayout: boolean
  events: Array<{ id: string; title: string; event_date: string | null }>
  recentContributions: Contribution[]
}

function deadlineInfo(deadline: string | null): { label: string; color: string } | null {
  if (!deadline) return null
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return { label: 'Срокът изтече', color: 'bg-red-100 text-red-700' }
  if (days === 0) return { label: 'Днес е крайният срок!', color: 'bg-red-100 text-red-700' }
  if (days <= 7) return { label: `${days} дни до края`, color: 'bg-red-100 text-red-700' }
  if (days <= 14) return { label: `${days} дни до края`, color: 'bg-amber-100 text-amber-700' }
  return { label: `${days} дни до края`, color: 'bg-gray-100 text-gray-600' }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `преди ${mins} мин.`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `преди ${hours} ч.`
  const days = Math.floor(hours / 24)
  return `преди ${days} дни`
}

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>
}

export default function Dashboard({
  classData, deadline, students, awaitingApproval,
  approvedAnswers, hasQuestionnaire, hasLayout, events, recentContributions,
}: Props) {
  const totalStudents = students.length
  const submittedStudents = students.filter((s) => s.questionnaire_submitted).length
  const progressPercent = totalStudents > 0 ? Math.round((submittedStudents / totalStudents) * 100) : 0
  const remaining = totalStudents - submittedStudents

  const base = `/moderator/${classData.id}`

  return (
    <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">

      {/* Header */}
      <header className="mb-10">
        <nav className="flex gap-2 text-xs text-slate-400 uppercase tracking-widest mb-2">
          <span>Admin Panel</span>
          <span>/</span>
          <span className="text-indigo-600 font-bold">Табло</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 break-words" style={{ fontFamily: 'Noto Serif, serif' }}>
            {classData.name}
          </h2>
          {classData.status === 'published' && (
            <Link
              href={`/lexicon/${classData.id}`}
              target="_blank"
              className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Към публикувания лексикон
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <div className="bg-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-100">
            <Icon name="calendar_today" className="text-amber-600 text-sm" />
            <span className="text-sm font-semibold text-gray-700">{classData.school_year}</span>
          </div>
          {(() => {
            const info = deadlineInfo(deadline)
            return info ? (
              <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-semibold ${info.color}`}>
                <Icon name="timer" className="text-sm" />
                {info.label}
              </div>
            ) : (
              <Link
                href={`${base}/lexicon`}
                className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors text-sm"
              >
                <Icon name="timer" className="text-sm" />
                Краен срок
              </Link>
            )
          })()}
        </div>
      </header>

      {/* Wizard */}
      <ModeratorWizard
        classId={classData.id}
        hasEvents={events.length > 0}
        hasLayout={hasLayout}
        hasQuestionnaire={hasQuestionnaire}
        hasStudents={students.length > 0}
        classStatus={classData.status}
      />

      {/* Stats row */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden group border border-gray-100">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-700">Прогрес на попълване</h3>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5">
                <Icon name="verified" className="text-emerald-600 text-sm" />
                <span className="text-sm font-bold text-emerald-700">{approvedAnswers}</span>
                <span className="text-xs text-emerald-600">одобрени</span>
              </div>
            </div>
            <div className="flex items-end justify-between mb-3 gap-3">
              <span className="text-4xl md:text-5xl font-bold text-indigo-600">{progressPercent}%</span>
              {remaining > 0 && (
                <span className="text-xs text-slate-400 uppercase tracking-tight text-right">
                  Остават {remaining} профила
                </span>
              )}
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-100 opacity-40 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
        </div>
      </section>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-8">
        {/* Awaiting approval list */}
        <div className="col-span-12 lg:col-span-8">
          <h3 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: 'Noto Serif, serif' }}>
            Очакващи одобрение
          </h3>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {awaitingApproval.length === 0 ? (
              <div className="p-10 text-center">
                <Icon name="check_circle" className="text-4xl text-gray-200 block mb-3" />
                <p className="text-slate-400 text-sm font-medium">Няма попълнени лексикони за одобрение</p>
              </div>
            ) : (
              awaitingApproval.slice(0, 6).map((student, i) => (
                <div
                  key={student.id}
                  onClick={() => window.location.href = `${base}/answers`}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer ${i > 0 ? 'border-t border-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                      {student.first_name?.[0] ?? ''}{student.last_name?.[0] ?? ''}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{student.first_name} {student.last_name}</p>
                      <p className="text-xs text-slate-400">Попълнен лексикон</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <Link
                      href={`${base}/students/${student.id}/preview`}
                      className="text-xs font-semibold text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Icon name="visibility" className="text-sm" />
                      <span className="hidden sm:inline">Прегледай</span>
                    </Link>
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700">
                      Чака
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent contributions */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
            Най-нови отговори
          </h3>

          {recentContributions.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-slate-400 text-sm">
              Все още няма одобрени отговори.
            </div>
          ) : (
            recentContributions.map((c) => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                    {c.students?.first_name?.[0]}{c.students?.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {c.students?.first_name} {c.students?.last_name}
                      <span className="text-slate-400 font-normal ml-1">
                        {c.media_type === 'video' ? 'добави видео' : c.media_type === 'audio' ? 'добави аудио' : 'отговори'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">{timeAgo(c.updated_at)}</p>
                  </div>
                </div>

                {c.media_url && c.media_type === 'video' ? (
                  <div className="rounded-lg overflow-hidden h-32 mb-3 bg-gray-100">
                    <video src={c.media_url} className="w-full h-full object-cover" />
                  </div>
                ) : c.media_url && !c.media_type ? (
                  <div className="rounded-lg overflow-hidden h-32 mb-3 bg-gray-100">
                    <img src={c.media_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                {c.text_content && (
                  <p className="text-sm italic text-indigo-900 leading-relaxed" style={{ fontFamily: 'Noto Serif, serif' }}>
                    „{c.text_content.slice(0, 120)}{c.text_content.length > 120 ? '…' : ''}"
                  </p>
                )}

                {c.questions?.text && (
                  <p className="text-xs text-slate-400 mt-2">{c.questions.text}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
