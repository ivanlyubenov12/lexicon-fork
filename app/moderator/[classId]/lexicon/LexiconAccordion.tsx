'use client'

import { useState } from 'react'

export default function LexiconAccordion({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-xl text-indigo-600">{icon}</span>
          <span className="font-bold text-gray-800 text-base">{title}</span>
        </div>
        <span
          className="material-symbols-outlined text-slate-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          expand_more
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-6 py-6">
          {children}
        </div>
      )}
    </div>
  )
}
