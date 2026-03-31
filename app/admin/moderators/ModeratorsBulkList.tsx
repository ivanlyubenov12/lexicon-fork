'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminDeleteModerators, adminUpdateUserName, adminUpdateUserFull } from '../actions'

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
  { key: 'all',       label: 'Всички',     icon: 'group' },
  { key: 'admin',     label: 'Админи',     icon: 'shield_person' },
  { key: 'moderator', label: 'Модератори', icon: 'school' },
  { key: 'student',   label: 'Участници',  icon: 'family_restroom' },
]

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  admin:     { label: 'Админ',     color: 'bg-purple-100 text-purple-700' },
  moderator: { label: 'Модератор', color: 'bg-indigo-100 text-indigo-700' },
  student:   { label: 'Участник',  color: 'bg-teal-100 text-teal-700' },
}

// ── Inline name editor (in expanded panel) ─────────────────────────────────────
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
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setValue(saved); setEditing(false) } }}
          className="border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 min-w-0"
          placeholder="Пълно име"
        />
        <button onClick={handleSave} disabled={isPending}
          className="text-xs bg-indigo-600 text-white px-2 py-1.5 rounded-lg disabled:opacity-50 flex-shrink-0">
          {isPending ? '...' : 'Запази'}
        </button>
        <button onClick={() => { setValue(saved); setEditing(false) }} className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0">Отказ</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => { setValue(saved); setEditing(true) }}
      className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors group"
    >
      <span className="material-symbols-outlined text-sm">edit</span>
      {saved
        ? <span className="font-medium">{saved}</span>
        : <span className="italic text-gray-400">Вземи име</span>
      }
    </button>
  )
}

// ── Edit modal ──────────────────────────────────────────────────────────────────
function EditModal({ user, onClose }: { user: ModeratorRowData; onClose: () => void }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    startTransition(async () => {
      const result = await adminUpdateUserFull(user.id, {
        fullName,
        email: email !== user.email ? email : undefined,
        password: password || undefined,
      })
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[51] bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Редактирай потребител</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Пълно име</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Пълно име"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Имейл</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Нова парола</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Оставете празно за без промяна"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button onClick={onClose}
            className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Отказ
          </button>
          <button onClick={handleSave} disabled={isPending}
            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors disabled:opacity-50">
            {isPending ? 'Запазване...' : 'Запази'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main component ──────────────────────────────────────────────────────────────
export default function ModeratorsBulkList({ moderators }: { moderators: ModeratorRowData[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterRole>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [confirm, setConfirm] = useState<string[] | null>(null)
  const [editUser, setEditUser] = useState<ModeratorRowData | null>(null)
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

  function toggleSelect(id: string) {
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
      <div className="flex items-center gap-3 px-1 py-1 mb-2">
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

      {/* User rows */}
      <div className="space-y-1.5">
        {visible.map((user) => {
          const isSelected = selected.has(user.id)
          const isExpanded = expanded.has(user.id)
          const initials = (user.fullName ?? user.email ?? '?')[0].toUpperCase()

          return (
            <div
              key={user.id}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                isSelected ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-100'
              }`}
            >
              {/* Compact row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(user.id)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer flex-shrink-0"
                />
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                    {user.fullName ?? user.email}
                  </p>
                  {user.fullName && (
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  )}
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ROLE_BADGE[user.role]?.color}`}>
                  {ROLE_BADGE[user.role]?.label}
                </span>
                <button
                  onClick={() => setEditUser(user)}
                  title="Редактирай"
                  className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button
                  onClick={() => toggleExpand(user.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <span className={`material-symbols-outlined text-base transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                  {/* Dates + stats */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                    <span>Регистриран: <span className="font-medium text-gray-700">{new Date(user.createdAt).toLocaleDateString('bg-BG')}</span></span>
                    {user.lastSignIn && (
                      <span>Последен вход: <span className="font-medium text-gray-700">{new Date(user.lastSignIn).toLocaleDateString('bg-BG')}</span></span>
                    )}
                    <span><span className="font-bold text-gray-800">{user.classes.length}</span> класа</span>
                    <span><span className="font-bold text-gray-800">{user.totalStudents}</span> деца</span>
                    <span><span className="font-bold text-green-600">{user.publishedCount}</span> публ.</span>
                  </div>

                  {/* Classes list */}
                  {user.classes.length > 0 && (
                    <div className="space-y-1">
                      {user.classes.map(cls => (
                        <div key={cls.id} className="flex items-center gap-3 py-1.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{cls.name}</p>
                            <p className="text-xs text-gray-400">{cls.school_year}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[cls.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {STATUS_LABEL[cls.status] ?? cls.status}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{cls.studentCount} деца</span>
                          <Link href={`/admin/classes/${cls.id}/preview`}
                            className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold flex-shrink-0">
                            Превю
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Name editor + delete */}
                  <div className="flex items-center justify-between pt-1">
                    <NameEditor userId={user.id} initialName={user.fullName} />
                    <button
                      onClick={() => setConfirm([user.id])}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                      Изтрий
                    </button>
                  </div>
                </div>
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

      {/* Edit modal */}
      {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} />}

      {/* Confirm delete modal */}
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
