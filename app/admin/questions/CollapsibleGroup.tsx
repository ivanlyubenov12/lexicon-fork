'use client'

import { useState } from 'react'

export default function CollapsibleGroup({
  icon,
  color,
  label,
  count,
  children,
  defaultOpen = false,
}: {
  icon: string
  color: string
  label: string
  count: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-6 py-4 border-b border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors text-left"
      >
        <span className={`material-symbols-outlined ${color}`} style={{ fontSize: 18 }}>{icon}</span>
        <h2 className="font-bold text-gray-800 text-sm">{label}</h2>
        <span className="ml-auto text-xs text-gray-400 mr-2">{count} въпроса</span>
        <span
          className="material-symbols-outlined text-gray-400 transition-transform duration-200"
          style={{ fontSize: 18, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          expand_more
        </span>
      </button>
      {open && children}
    </div>
  )
}
