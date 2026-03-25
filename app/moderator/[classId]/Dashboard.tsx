'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { updateClassInfo, setDeadline } from './actions'

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
  classData: { id: string; name: string; school_year: string; status: string; school_logo_url: string | null }
  deadline: string | null
  students: Array<{ id: string; first_name: string; last_name: string; invite_accepted_at: string | null }>
  pendingAnswers: number
  pendingMessages: number
  approvedAnswers: number
  hasQuestionnaire: boolean
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
  classData, deadline, students, pendingAnswers, pendingMessages,
  approvedAnswers, hasQuestionnaire, events, recentContributions,
}: Props) {
  const totalStudents = students.length
  const acceptedStudents = students.filter((s) => s.invite_accepted_at !== null).length
  const progressPercent = totalStudents > 0 ? Math.round((acceptedStudents / totalStudents) * 100) : 0
  const remaining = totalStudents - acceptedStudents

  const base = `/moderator/${classData.id}`

  const [namePart, schoolPart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name, '']

  const [editingSettings, setEditingSettings] = useState(false)
  const [className, setClassName] = useState(namePart)
  const [school, setSchool] = useState(schoolPart)
  const [schoolYear, setSchoolYear] = useState(classData.school_year)
  const [logoUrl, setLogoUrl] = useState<string | null>(classData.school_logo_url)
  const [logoUploading, setLogoUploading] = useState(false)
  const [deadlineStr, setDeadlineStr] = useState<string>(
    deadline ? new Date(deadline).toISOString().split('T')[0] : ''
  )
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setLogoUrl(data.url)
    } finally {
      setLogoUploading(false)
    }
  }

  function handleSaveSettings() {
    if (!className.trim() || !school.trim() || !schoolYear.trim()) {
      setSaveError('Моля попълнете всички полета.')
      return
    }
    setSaveError(null)
    startTransition(async () => {
      const [infoResult, deadlineResult] = await Promise.all([
        updateClassInfo(classData.id, {
          name: `${className.trim()} — ${school.trim()}`,
          school_year: schoolYear.trim(),
          school_logo_url: logoUrl ?? undefined,
        }),
        setDeadline(classData.id, deadlineStr ? new Date(deadlineStr).toISOString() : null),
      ])
      const err = infoResult.error || deadlineResult.error
      if (err) setSaveError(err)
      else setEditingSettings(false)
    })
  }

  const navItems = [
    { icon: 'dashboard', label: 'Табло', href: base, active: true },
    { icon: 'group', label: 'Деца', href: `${base}/students` },
    { icon: 'volunteer_activism', label: 'Отговори', href: `${base}/answers` },
    { icon: 'quiz', label: 'Въпросник', href: `${base}/questions` },
    { icon: 'calendar_month', label: 'Събития', href: `${base}/events` },
    { icon: 'view_quilt', label: 'Лексикон', href: `${base}/layout` },
    { icon: 'settings', label: 'Настройки', href: '#', onClick: () => setEditingSettings(true) },
  ]

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#f4f3f2] flex flex-col p-4 z-50">
        {/* Brand */}
        <div className="px-2 py-4">
          <h1 className="text-indigo-900 text-xl font-bold tracking-tight" style={{ fontFamily: 'Noto Serif, serif' }}>
            Един неразделен клас
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 px-2 py-3 bg-white/60 rounded-xl mb-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Лого" className="w-10 h-10 rounded-full object-contain bg-white border border-gray-100 p-0.5" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {namePart[0]}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-indigo-900 truncate">{namePart}</p>
            <p className="text-xs text-slate-400 truncate">{classData.school_year}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) =>
            item.onClick ? (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-white/50 rounded-lg transition-colors text-left"
              >
                <Icon name={item.icon} className="text-xl" />
                <span className="text-sm">{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                  item.active
                    ? 'bg-white text-indigo-700 font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                <Icon name={item.icon} className="text-xl" />
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Bottom */}
        <div className="pt-4 space-y-2">
          <Link
            href={`${base}/preview`}
            className="w-full flex items-center justify-center gap-2 border border-indigo-200 text-indigo-600 py-2.5 px-4 rounded-xl font-semibold text-sm text-center hover:bg-indigo-50 transition-colors"
          >
            <Icon name="preview" className="text-base" />
            Превю
          </Link>
          <Link
            href={`${base}/finalize`}
            className="w-full block bg-gradient-to-br from-indigo-600 to-indigo-500 text-white py-3 px-4 rounded-xl font-bold text-sm text-center shadow hover:opacity-90 transition-opacity"
          >
            Финализирай лексикона
          </Link>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="ml-64 flex-1 p-8 lg:p-12">

        {/* Header */}
        <header className="mb-10 flex justify-between items-end">
          <div>
            <nav className="flex gap-2 text-xs text-slate-400 uppercase tracking-widest mb-2">
              <span>Admin Panel</span>
              <span>/</span>
              <span className="text-indigo-600 font-bold">Табло</span>
            </nav>
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
              {classData.name}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-100">
              <Icon name="calendar_today" className="text-amber-600 text-base" />
              <span className="text-sm font-semibold text-gray-700">{classData.school_year}</span>
            </div>
            {(() => {
              const info = deadlineInfo(deadline)
              return info ? (
                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold ${info.color}`}>
                  <Icon name="timer" className="text-base" />
                  {info.label}
                </div>
              ) : (
                <button
                  onClick={() => setEditingSettings(true)}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors text-sm"
                >
                  <Icon name="timer" className="text-base" />
                  Добави краен срок
                </button>
              )
            })()}
            <button
              onClick={() => setEditingSettings(true)}
              className="bg-white px-3 py-2 rounded-lg border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors text-sm flex items-center gap-1.5"
            >
              <Icon name="edit" className="text-base" />
              Редактирай
            </button>
          </div>
        </header>

        {/* Settings inline edit */}
        {editingSettings && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 mb-8 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Настройки на класа</h3>
            {saveError && <p className="text-red-600 text-sm mb-3">{saveError}</p>}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Клас</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Училище</label>
                <input value={school} onChange={(e) => setSchool(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Учебна година</label>
                <input value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Краен срок</label>
                <input type="date" value={deadlineStr} onChange={(e) => setDeadlineStr(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {logoUrl && <img src={logoUrl} alt="Лого" className="w-10 h-10 rounded-lg object-contain border border-gray-100 bg-white p-1" />}
                <label className="cursor-pointer border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                  {logoUploading ? 'Качване...' : logoUrl ? 'Смени лого' : 'Качи лого'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} disabled={logoUploading} />
                </label>
                {logoUrl && <button onClick={() => setLogoUrl(null)} className="text-xs text-gray-400 hover:text-red-500">Премахни</button>}
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => { setEditingSettings(false); setSaveError(null) }}
                  className="text-sm text-gray-400 hover:text-gray-600 px-4 py-2">Отказ</button>
                <button onClick={handleSaveSettings} disabled={isPending || logoUploading}
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {isPending ? 'Запазване...' : 'Запази'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <section className="grid grid-cols-12 gap-5 mb-10">
          {/* Progress */}
          <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden group border border-gray-100">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-800 mb-5" style={{ fontFamily: 'Noto Serif, serif' }}>
                Прогрес на випуска
              </h3>
              <div className="flex items-end justify-between mb-3">
                <span className="text-6xl font-bold text-indigo-600">{progressPercent}%</span>
                {remaining > 0 && (
                  <span className="text-sm text-slate-400 uppercase tracking-tight">
                    Остават {remaining} профила
                  </span>
                )}
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-100 opacity-40 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
          </div>

          {/* Quick stats */}
          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
            <Link href={`${base}/answers`}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <Icon name="pending_actions" className="text-indigo-600 text-2xl mb-3" />
              <div>
                <p className="text-3xl font-bold text-gray-900">{pendingAnswers}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 mt-1">Чакащи приноси</p>
              </div>
            </Link>
            <div className="bg-emerald-400 rounded-2xl p-6 flex flex-col justify-between">
              <Icon name="verified" className="text-emerald-900 text-2xl mb-3" />
              <div>
                <p className="text-3xl font-bold text-emerald-900">{approvedAnswers}</p>
                <p className="text-xs uppercase tracking-widest text-emerald-800 mt-1">Одобрени истории</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Student list */}
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
                Деца в класа
              </h3>
              <Link href={`${base}/students`}
                className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                Виж всички <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {students.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">
                  Все още няма добавени деца.
                </div>
              ) : (
                students.slice(0, 6).map((student, i) => (
                  <div key={student.id}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-slate-400">
                          {student.invite_accepted_at ? 'Прие поканата' : 'Покана изпратена'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        student.invite_accepted_at
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {student.invite_accepted_at ? 'Активен' : 'Pending'}
                      </span>
                      <div className="flex gap-1">
                        <Link href={`${base}/answers`}
                          className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Icon name="visibility" className="text-base" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick links row */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Link href={`${base}/questions`}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-3">
                <Icon name="quiz" className="text-indigo-400 text-xl" />
                <div>
                  <p className="text-xs font-bold text-gray-700">Въпросник</p>
                  <p className="text-xs text-slate-400">{hasQuestionnaire ? 'Конфигуриран' : 'Не е готов'}</p>
                </div>
              </Link>
              <Link href={`${base}/messages`}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-3">
                <Icon name="mail" className="text-indigo-400 text-xl" />
                <div>
                  <p className="text-xs font-bold text-gray-700">Послания</p>
                  <p className="text-xs text-slate-400">{pendingMessages > 0 ? `${pendingMessages} нови` : 'Няма нови'}</p>
                </div>
              </Link>
              <Link href={`${base}/events`}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-3">
                <Icon name="calendar_month" className="text-indigo-400 text-xl" />
                <div>
                  <p className="text-xs font-bold text-gray-700">Събития</p>
                  <p className="text-xs text-slate-400">{events.length > 0 ? `${events.length} добавени` : 'Няма'}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent contributions */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
              Последни приноси
            </h3>

            {recentContributions.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-slate-400 text-sm">
                Все още няма одобрени отговори.
              </div>
            ) : (
              recentContributions.map((c) => (
                <div key={c.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
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

            {/* Superhero link */}
            <Link href={`${base}/superhero`}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between group hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3">
                <Icon name="auto_awesome" className="text-indigo-500 group-hover:text-white text-xl" />
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-white">Супергерой</p>
                  <p className="text-xs text-slate-400 group-hover:text-indigo-200">AI образ на класната</p>
                </div>
              </div>
              <Icon name="arrow_forward" className="text-slate-300 group-hover:text-white text-base" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
