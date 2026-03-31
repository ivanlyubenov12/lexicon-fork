'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminSetStatus } from '../actions'

const STATUSES = [
  { value: 'draft',       label: 'Чернова',      color: 'bg-gray-100 text-gray-600' },
  { value: 'filling',     label: 'Непопълнен',   color: 'bg-blue-100 text-blue-700' },
  { value: 'unpublished', label: 'Непубликуван', color: 'bg-amber-100 text-amber-700' },
  { value: 'published',   label: 'Публикуван',   color: 'bg-green-100 text-green-700' },
]

export default function StatusDropdown({ classId, status }: { classId: string; status: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const current = STATUSES.find(s => s.value === status) ?? STATUSES[0]

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    if (next === status) return
    startTransition(async () => {
      await adminSetStatus(classId, next)
      router.refresh()
    })
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`appearance-none text-xs font-semibold px-2.5 py-1 pr-6 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-opacity disabled:opacity-50 ${current.color}`}
      >
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-current opacity-50"
        style={{ fontSize: 12 }}
      >
        ▾
      </span>
    </div>
  )
}
