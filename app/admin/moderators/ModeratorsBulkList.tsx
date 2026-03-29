'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminDeleteModerators, adminUpdateUserName } from '../actions'

interface ModeratorClass {
  id: string
  name: string
  school_year: string | null
  status: string
  studentCount: number
}

export interface ModeratorRowData {
  id: string
  email: string
  fullName: string | null
  createdAt: string
  lastSignIn: string | null
  role: 'admin' | 'moderator' | 'student'
  classes: ModeratorClass[]
  totalStudents: number
  publishedCount: number
}

const STATUS_COLOR: Record<string, string> = {
  draft:       'bg-gray-100 text-gray-500',
  filling:     'bg-blue-100 text-blue-700',
  unpublished: 'bg-amber-100 text-amber-700',
  published:   'bg-green-100 text-green-700',
}
const STATUS_LABEL: Record<string, string> = {
  draft: 'Чернова', filling: 'Непопълнен', unpublished: 'Непубликуван', published: 'Публикуван',
}

type FilterRole = 'all' | 'admin' | 'moderator' | 'student'

const FILTER_TABS: { key: FilterRole; label: string; icon: string }[] = [
  { key: 'all',       label: 'Всички',    icon: 'group' },
  { key: 'admin',     label: 'Админи',    icon: 'shield_person' },
  { key: 'moderator', label: 'Модератори', icon: 'school' },
  { key: 'student',   label: 'Участници',  icon: 'family_restroom' },
]

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  admin:     { label: 'Админ',     color: 'bg-purple-100 text-purple-700' },
  moderator: { label: 'Модератор', color: 'bg-indigo-100 text-indigo-700' },
  student:   { label: 'Участник',   color: 'bg-teal-100 text-teal-700' },
}

function NameEditor({ userId, initialName }: { userId: string; initialName: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialName ?? '')
  const [saved, setSaved] = useState(initialName ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await adminUpdateUserName(userId, value)
      setSaved(value)
      setEditing(false)
    })
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setValue(saved); setEditing(false) } }}
          className="border border-indigo-300 rounded-lg px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48"
          placeholder="Пълно име"
        />
        <button onClick={handleSave} disabled={isPending}
          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg disabled:opacity-50">
          {isPending ? '...' : 'Запази'}
        </button>
        <button onClick={() => { setValue(saved); setEditing(false) }} className="text-xs text-gray-400 hover:text-gray-600">Отказ</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors group"
    >
      <span className="material-symbols-outlined text-sm">edit</span>
      {saved ? <span className="font-medium text-gray-600 group-hover:text-indigo-600">{saved}</span> : <span className="italic">Добави ime</span>}
    </button>
  )
}

export default function ModeratorsBulkList({ moderators }: { moderators: ModeratorRowData[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterRole>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirm, setConfirm] = useState<string[] | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const visible = filter === 'all' ? moderators : moderators.filter(m => m.role === filter)
  const allSelected = visible.length > 0 && visible.every(m => selected.has(m.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => { const next = new Set(prev); visible.forEach(m => next.delete(m.id)); return next })
    } else {
      setSelected(prev => new Set([...prev, ...visible.map(m => m.id)]))
    }
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function confirmDelete() {
    if (!confirm) return
    const ids = confirm
    startTransition(async () => {
      const result = await adminDeleteModerators(ids)
      if (result.error) {
        setError(result.error)
      } else {
        setSelected(new Set())
        router.refresh()
      }
      setConfirm(null)
    })
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all' ? moderators.length : moderators.filter(m => m.role === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => { setFilter(tab.key); setSelected(new Set()) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Select-all row */}
      <div className="flex items-center gap-3 px-1 py-1 mb-1">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
        />
        <span className="text-xs text-gray-400 font-medium">
          {selected.size > 0 ? `${selected.size} избрани` : 'Избери всички'}
        </span>
      </div>

      <div className="space-y-4">
        {visible.map((user) => {
          const isSelected = selected.has(user.id)
          const initials = (user.email ?? '?')[0].toUpperCase()

          return (
            <div
              key={user.id}
              className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${
                isSelected ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-100'
              }`}
            >
              {/* User header */}
              <div className="flex items-start gap-3 px-4 py-4 border-b border-gray-50">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(user.id)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer flex-shrink-0 mt-1"
                />
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm break-all leading-tight">{user.email}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ROLE_BADGE[user.role]?.color}`}>
                      {ROLE_BADGE[user.role]?.label}
                    </span>
                  </div>
                  <NameEditor userId={user.id} initialName={user.fullName} />
                  <p className="text-xs text-gray-400 mt-1">
                    Регистриран: {new Date(user.createdAt).toLocaleDateString('bg-BG')}
                  </p>
                  {user.lastSignIn && (
                    <p className="text-xs text-gray-400">
                      Последен вход: {new Date(user.lastSignIn).toLocaleDateString('bg-BG')}
                    </p>
                  )}
                  {/* Stats row */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-gray-500"><span className="font-bold text-gray-800">{user.classes.length}</span> класа</span>
                    <span className="text-xs text-gray-500"><span className="font-bold text-gray-800">{user.totalStudents}</span> деца</span>
                    <span className="text-xs text-gray-500"><span className="font-bold text-green-600">{user.publishedCount}</span> публ.</span>
                    <button
                      onClick={() => setConfirm([user.id])}
                      title={`Изтрий ${user.email}`}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                      Изтрий
                    </button>
                  </div>
                </div>
              </div>

              {/* Classes */}
              {user.classes.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {user.classes.map((cls) => (
                    <div key={cls.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{cls.name}</p>
                        <p className="text-xs text-gray-400">{cls.school_year}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[cls.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABEL[cls.status] ?? cls.status}
                      </span>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {cls.studentCount} деца
                      </span>
                      <Link href={`/admin/classes/${cls.id}/preview`}
                        className="text-xs text-gray-400 hover:text-indigo-600 font-semibold">
                        Превю
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-6 py-4 text-xs text-gray-400 italic">Няма създадени класове.</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl">
          <span className="text-sm font-semibold">{selected.size} {selected.size === 1 ? 'избран' : 'избрани'}</span>
          <div className="w-px h-5 bg-white/20" />
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Откажи
          </button>
          <button
            onClick={() => setConfirm([...selected])}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Изтрий {selected.size === 1 ? 'потребителя' : `${selected.size} потребители`}
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => { setConfirm(null); setError(null) }} />
          <div className="fixed inset-x-0 bottom-0 z-[51] bg-white rounded-t-3xl shadow-2xl p-6 max-w-sm mx-auto">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-2xl mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-xl">delete_forever</span>
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">
              {confirm.length === 1 ? 'Изтрий потребителя?' : `Изтрий ${confirm.length} потребители?`}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Всички класове, деца и отговори ще бъдат изтрити. Действието не може да се отмени.
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
