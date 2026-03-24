'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Класът',         icon: 'group',        exact: true,  getHref: (id: string) => `/lexicon/${id}`          },
  { label: 'Учениците',      icon: 'photo_library', exact: false, getHref: (id: string) => `/lexicon/${id}/students` },
  { label: 'Нашите спомени', icon: 'equalizer',     exact: false, getHref: (id: string) => `/lexicon/${id}/memories` },
]

export function LexiconHeaderNav({ classId }: { classId: string }) {
  const pathname = usePathname()
  return (
    <nav className="flex gap-8 w-full border-t border-[#e9e8e7] pt-3 overflow-x-auto hide-scrollbar">
      {NAV_ITEMS.map(item => {
        const href = item.getHref(classId)
        const active = item.exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={item.label}
            href={href}
            className={`pb-1 tracking-tight whitespace-nowrap transition-colors duration-200 ${
              active
                ? 'text-[#3632b7] border-b-2 border-[#855300]'
                : 'text-stone-500 font-medium hover:text-[#855300]'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function LexiconBottomNav({ classId }: { classId: string }) {
  const pathname = usePathname()
  return (
    <>
      {NAV_ITEMS.map(item => {
        const href = item.getHref(classId)
        const active = item.exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={item.label}
            href={href}
            className={`flex flex-col items-center justify-center rounded-2xl px-5 py-2 transition-all duration-150 ${
              active
                ? 'bg-[#3632b7] text-white scale-110 shadow-lg shadow-indigo-200'
                : 'text-stone-500 opacity-70 hover:opacity-100 hover:scale-105'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest mt-1">{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}
