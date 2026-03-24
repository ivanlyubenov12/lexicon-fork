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
    <nav className="flex gap-8 w-full pt-3 overflow-x-auto hide-scrollbar" style={{ borderTop: '1px solid color-mix(in srgb, var(--lex-text) 10%, transparent)' }}>
      {NAV_ITEMS.map(item => {
        const href = item.getHref(classId)
        const active = item.exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={item.label}
            href={href}
            className="pb-1 tracking-tight whitespace-nowrap transition-colors duration-200"
            style={{
              color: active ? 'var(--lex-primary)' : 'var(--lex-muted)',
              borderBottom: active ? '2px solid var(--lex-secondary)' : '2px solid transparent',
              fontWeight: active ? 600 : 500,
            }}
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
            className="flex flex-col items-center justify-center rounded-2xl px-5 py-2 transition-all duration-150"
            style={active ? {
              backgroundColor: 'var(--lex-primary)',
              color: 'white',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 20px color-mix(in srgb, var(--lex-primary) 30%, transparent)',
            } : {
              color: 'var(--lex-muted)',
              opacity: 0.7,
            }}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest mt-1">{item.label}</span>
          </Link>
        )
      })}
    </>
  )
}
