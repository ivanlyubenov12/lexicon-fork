'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminLogoutButton from './AdminLogoutButton'

const NAV_ITEMS = [
  { key: 'dashboard',  icon: 'dashboard',      label: 'Табло',       href: '/admin' },
  { key: 'moderators', icon: 'manage_accounts', label: 'Модератори',  href: '/admin/moderators' },
  { key: 'classes',    icon: 'school',          label: 'Класове',     href: '/admin/classes' },
  { key: 'questions',  icon: 'quiz',            label: 'Въпроси',     href: '/admin/questions' },
  { key: 'payments',   icon: 'payments',        label: 'Плащания',    href: '/admin/payments' },
] as const

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  const sidebarContent = (
    <aside
      className="w-64 h-screen bg-[#f4f3f2] flex flex-col p-4 overflow-y-auto"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Brand */}
      <div className="px-2 py-4">
        <h1
          className="text-indigo-900 text-xl font-bold tracking-tight"
          style={{ fontFamily: 'Noto Serif, serif' }}
        >
          Малки спомени
        </h1>
        <span className="inline-block mt-1 text-xs font-bold uppercase tracking-widest text-white bg-indigo-500 px-2 py-0.5 rounded">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 mt-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : !!pathname?.startsWith(item.href)
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                isActive
                  ? 'bg-white text-indigo-700 font-semibold shadow-sm'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="pt-4 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-white/50 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-xl">open_in_new</span>
          Публична страница
        </Link>
        <AdminLogoutButton />
      </div>
    </aside>
  )

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#f4f3f2] border-b border-black/5 flex items-center justify-between px-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl text-slate-600">menu</span>
        </button>
        <span className="font-bold text-sm text-indigo-900" style={{ fontFamily: 'Noto Serif, serif' }}>
          Admin Panel
        </span>
        <div className="w-10" />
      </div>

      {/* ── Backdrop ───────────────────────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────────────────── */}
      <div
        className={`fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0`}
      >
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="md:hidden absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-slate-500">close</span>
          </button>
        )}
        {sidebarContent}
      </div>
    </>
  )
}
