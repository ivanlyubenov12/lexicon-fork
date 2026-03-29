'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import StudentActions from './StudentActions'
import { deleteStudents } from './actions'

export interface StudentRowData {
  id: string
  first_name: string
  last_name: string
  parent_email: string | null
  registered_email: string | null
  photo_url: string | null
  invite_accepted_at: string | null
  invite_token: string
  approved: number
  messages: number
  total: number
  initials: string
  allDone: boolean
  statusBadge: 'registered' | 'invited' | 'none'
}

export default function StudentsBulkList({
  classId,
  students,
}: {
  classId: string
  students: StudentRowData[]
}) {
  const router = useRouter()
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [expanded, setExpanded]       = useState<Set<string>>(new Set())
  const [confirm, setConfirm]         = useState<string[] | null>(null)
  const [isPending, startTransition]  = useTransition()
  const [error, setError]             = useState<string | null>(null)

  const allSelected = students.length > 0 && selected.size === students.length

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(students.map(s => s.id)))
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleDeleteSelected() { setConfirm([...selected]) }
  function handleDeleteOne(id: string) { setConfirm([id]) }

  function downloadCsv() {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const noEmail = students.filter(s => !s.parent_email && !s.invite_accepted_at)
    if (noEmail.length === 0) return
    const rows = [
      ['Име', 'Фамилия', 'Линк за регистрация'],
      ...noEmail.map(s => [s.first_name, s.last_name, `${base}/join/${s.invite_token}`]),
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'деца-без-имейл.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function confirmDelete() {
    if (!confirm) return
    const ids = confirm
    startTransition(async () => {
      const result = await deleteStudents(classId, ids)
      if (result.error) {
        setError(result.error)
      } else {
        setSelected(new Set())
        router.refresh()
      }
      setConfirm(null)
    })
  }

  const noEmailCount = students.filter(s => !s.parent_email && !s.invite_accepted_at).length

  return (
    <>
      {/* ── List ──────────────────────────────────────────────────────── */}
      <div className="space-y-2">

        {/* Select-all row */}
        <div className="flex items-center gap-3 px-3 py-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
          />
          <span className="text-xs text-gray-400 font-medium flex-1">
            {selected.size > 0 ? `${selected.size} избрани` : 'Избери всички'}
          </span>
          {noEmailCount > 0 && (
            <button
              onClick={downloadCsv}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
              CSV с линкове ({noEmailCount})
            </button>
          )}
        </div>

        {students.map(student => {
          const progress = student.total > 0 ? Math.round((student.approved / student.total) * 100) : 0
          const isSelected = selected.has(student.id)
          const isExpanded = expanded.has(student.id)

          const checks = [
            { icon: 'photo_camera', ok: !!student.photo_url,    label: 'Снимка' },
            { icon: 'edit_note',    ok: student.approved >= 2,  label: student.approved >= 2 ? `${student.approved} отговора` : `${student.approved}/2 отговора` },
            { icon: 'chat',         ok: student.messages >= 1,  label: student.messages >= 1 ? `${student.messages} послания` : 'Без послание' },
          ]

          const statusBadge = student.statusBadge === 'registered' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>how_to_reg</span>
              Регистриран
            </span>
          ) : student.statusBadge === 'invited' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>mail</span>
              Поканен
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              Без покана
            </span>
          )

          return (
            <div
              key={student.id}
              className={`bg-white border rounded-2xl shadow-sm transition-all overflow-hidden ${
                isSelected
                  ? 'border-indigo-300 ring-1 ring-indigo-200'
                  : 'border-gray-100'
              }`}
            >
              {/* ── Header row (always visible) ────────────────────────── */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(student.id)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer flex-shrink-0"
                />

                {/* Avatar */}
                {student.photo_url ? (
                  <img
                    src={student.photo_url}
                    alt={`${student.first_name} ${student.last_name}`}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                    {student.initials}
                  </div>
                )}

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {student.first_name} {student.last_name}
                  </p>
                  <div className="mt-0.5">{statusBadge}</div>
                </div>

                {/* Check dots */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {checks.map(c => (
                    <span
                      key={c.icon}
                      title={c.label}
                      className={`flex items-center justify-center w-6 h-6 rounded-full ${c.ok ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {c.ok ? 'check' : c.icon}
                      </span>
                    </span>
                  ))}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpand(student.id)}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <span className={`material-symbols-outlined text-base transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
              </div>

              {/* ── Expanded details ────────────────────────────────────── */}
              {isExpanded && (
                <div className="border-t border-gray-50 px-4 py-3 bg-gray-50/50 space-y-3">
                  {/* Email */}
                  <div className="space-y-1">
                    {student.registered_email && (
                      <p className="text-xs text-gray-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-green-500" style={{ fontSize: 14 }}>how_to_reg</span>
                        {student.registered_email}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-gray-300" style={{ fontSize: 14 }}>mail</span>
                      {student.parent_email ?? <span className="italic text-gray-400">Без имейл на родителя</span>}
                    </p>
                  </div>

                  {/* Progress bar */}
                  {student.total > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Отговори</span>
                        <span className="text-xs font-semibold text-gray-600">{student.approved}/{student.total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center justify-between gap-2">
                    <StudentActions
                      studentId={student.id}
                      parentEmail={student.parent_email}
                      inviteAccepted={!!student.invite_accepted_at}
                      allDone={student.allDone}
                      classId={classId}
                      inviteToken={student.invite_token}
                    />
                    <button
                      onClick={() => handleDeleteOne(student.id)}
                      title="Изтрий"
                      className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Floating bulk action bar ───────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl">
          <span className="text-sm font-semibold">{selected.size} {selected.size === 1 ? 'избрано' : 'избрани'}</span>
          <div className="w-px h-5 bg-white/20" />
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Откажи
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Изтрий {selected.size === 1 ? 'детето' : `${selected.size} деца`}
          </button>
        </div>
      )}

      {/* ── Confirm modal ─────────────────────────────────────────────── */}
      {confirm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="fixed inset-x-0 bottom-0 z-[51] bg-white rounded-t-3xl shadow-2xl p-6 max-w-sm mx-auto">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-2xl mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-xl">delete_forever</span>
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">
              {confirm.length === 1 ? 'Изтрий детето?' : `Изтрий ${confirm.length} деца?`}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Всички отговори, послания и гласове ще бъдат изтрити. Действието не може да се отмени.
            </p>
            {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setConfirm(null); setError(null) }}
                className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Отказ
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isPending ? 'Изтриване...' : 'Изтрий'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
