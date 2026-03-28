'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function getNavItems(themeId?: string | null) {
  const isKinder = themeId === 'kindergarten'
  return [
    { label: isKinder ? 'Групата'  : 'Класът',         icon: 'auto_stories', exact: true,  path: ''          },
    { label: 'Учениците',                               icon: 'people',       exact: false, path: '/students' },
    { label: 'Нашите събития',                          icon: 'photo_album',  exact: false, path: '/memories' },
  ]
}

export function LexiconHeaderNav({ classId, basePath, themeId }: { classId: string; basePath?: string; themeId?: string | null }) {
  const pathname = usePathname()
  const base = basePath ?? `/lexicon/${classId}`
  const navItems = getNavItems(themeId)
  return (
    <nav className="flex gap-8 w-full pt-2 overflow-x-auto hide-scrollbar">
      {navItems.map(item => {
        const href = `${base}${item.path}`
        const active = item.exact ? pathname === href : !!pathname?.startsWith(href)
        return (
          <Link
            key={item.label}
            href={href}
            className="pb-2 tracking-wide whitespace-nowrap transition-colors duration-200 font-label text-sm"
            style={{
              color: active ? 'var(--lex-primary)' : 'var(--lex-muted)',
              borderBottom: active ? '2px solid var(--lex-primary)' : '2px solid transparent',
              fontWeight: active ? 700 : 500,
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function LexiconBottomNav({ classId, basePath, themeId }: { classId: string; basePath?: string; themeId?: string | null }) {
  const pathname = usePathname()
  const base = basePath ?? `/lexicon/${classId}`
  const navItems = getNavItems(themeId)
  return (
    <>
      {navItems.map(item => {
        const href = `${base}${item.path}`
        const active = item.exact ? pathname === href : !!pathname?.startsWith(href)
        return (
          <Link
            key={item.label}
            href={href}
            aria-label={item.label}
            className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200"
            style={active ? {
              backgroundColor: 'var(--lex-primary)',
              color: 'white',
              boxShadow: '0 4px 16px color-mix(in srgb, var(--lex-primary) 35%, transparent)',
            } : {
              color: 'var(--lex-muted)',
              opacity: 0.5,
            }}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
          </Link>
        )
      })}
    </>
  )
}
