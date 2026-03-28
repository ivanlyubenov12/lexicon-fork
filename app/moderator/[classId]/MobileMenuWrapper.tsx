'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  children: React.ReactNode
  namePart: string
  finalizeHref: string
}

export default function MobileMenuWrapper({ children, namePart, finalizeHref }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      {/* ── Mobile top bar (hidden on md+) ─────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#f4f3f2] border-b border-black/5 flex items-center justify-between px-4 gap-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors flex-shrink-0"
          aria-label="Меню"
        >
          <span className="material-symbols-outlined text-xl text-slate-600">menu</span>
        </button>

        <span
          className="font-bold text-sm text-indigo-900 truncate flex-1 text-center"
          style={{ fontFamily: 'Noto Serif, serif' }}
        >
          {namePart}
        </span>

        <Link
          href={finalizeHref}
          className="flex-shrink-0 text-xs font-bold bg-indigo-600 text-white px-3 py-2 rounded-xl whitespace-nowrap"
        >
          Финализирай
        </Link>
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
        {/* Close button inside sidebar (mobile only) */}
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="md:hidden absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
          >
            <span className="material-symbols-outlined text-base text-slate-500">close</span>
          </button>
        )}
        {children}
      </div>
    </>
  )
}
