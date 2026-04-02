'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SubItem {
  key: string
  icon: string
  label: string
  href: string
}

interface Props {
  active: string | null
  items: SubItem[]
}

const LEXICON_KEYS = ['lexicon', 'events', 'questions', 'polls', 'messages', 'pdf', 'layout', 'template']

export default function LexiconGroup({ active, items }: Props) {
  const isGroupActive = LEXICON_KEYS.includes(active ?? '')
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
          isGroupActive
            ? 'text-indigo-700 font-semibold'
            : 'text-slate-500 hover:bg-white/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-xl">menu_book</span>
          Лексикон
        </div>
        <span className="material-symbols-outlined text-sm text-slate-400 transition-transform" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="ml-3 border-l-2 border-indigo-100 pl-1.5 space-y-0.5 mb-1">
          {items.map(item => {
            const isActive = active === item.key
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-white text-indigo-700 font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
