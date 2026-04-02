import Link from 'next/link'
import LogoutButton from './LogoutButton'
import LexiconGroup from './LexiconGroup'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import MobileMenuWrapper from './MobileMenuWrapper'

type ActiveNav =
  | 'dashboard'
  | 'students'
  | 'answers'
  | 'messages'
  | 'questions'
  | 'polls'
  | 'events'
  | 'superhero'
  | 'layout'
  | 'lexicon'
  | 'template'
  | 'finalize'
  | 'seed'
  | 'preview'
  | 'pdf'
  | null

interface Props {
  classId: string
  namePart: string
  schoolYear: string | null
  logoUrl: string | null
  active: ActiveNav
}

export default async function ModeratorSidebar({ classId, namePart, schoolYear, logoUrl, active }: Props) {
  const supabase = createServerClient()
  const admin = createServiceRoleClient()
  const [{ data: { user } }, { data: classRow }] = await Promise.all([
    supabase.auth.getUser(),
    admin.from('classes').select('status').eq('id', classId).single(),
  ])
  const isPublished = classRow?.status === 'published'
  const base = `/moderator/${classId}`

  const lexiconItems = [
    { key: 'lexicon',   icon: 'tune',            label: 'Настройки',   href: `${base}/lexicon` },
    { key: 'events',    icon: 'photo_album',      label: 'Събития',     href: `${base}/events` },
    { key: 'questions', icon: 'quiz',             label: 'Въпросник',   href: `${base}/questions` },
    { key: 'polls',     icon: 'bar_chart',        label: 'Анкети',      href: `${base}/polls` },
    { key: 'messages',  icon: 'forum',            label: 'Послания',    href: `${base}/messages` },
    { key: 'pdf',       icon: 'picture_as_pdf',   label: 'PDF Builder', href: `${base}/pdf` },
  ]

  const primaryItems = [
    { key: 'students', icon: 'group',              label: 'Участници',    sub: '/students' },
    { key: 'answers',  icon: 'volunteer_activism', label: 'За модерация', sub: '/answers' },
  ] as const

  const secondaryItems = [
    { href: '/moderator/profile', icon: 'manage_accounts', label: 'Профил и плащания' },
  ]

  return (
    <MobileMenuWrapper namePart={namePart} finalizeHref={`${base}/finalize`}>
    <aside
      className="w-64 h-screen bg-[#f4f3f2] flex flex-col p-4 overflow-y-auto"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Brand */}
      <div className="px-2 py-4">
        <Link href="/moderator" className="block group">
          <h1
            className="text-indigo-900 text-xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Малки спомени
          </h1>
        </Link>
        <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3 px-2 py-3 bg-white/60 rounded-xl mb-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Лого"
            className="w-10 h-10 rounded-full object-contain bg-white border border-gray-100 p-0.5"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {namePart[0] ?? '?'}
          </div>
        )}
        <div className="overflow-hidden">
          <p className="font-bold text-sm text-indigo-900 truncate">{namePart}</p>
          {schoolYear && <p className="text-xs text-slate-400 truncate">{schoolYear}</p>}
          <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email ?? ''}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">

        {/* Табло */}
        <Link
          href={base}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
            active === 'dashboard'
              ? 'bg-white text-indigo-700 font-semibold shadow-sm'
              : 'text-slate-500 hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          Табло
        </Link>

        {/* Лексикон — разгъваема група */}
        <LexiconGroup active={active} items={lexiconItems} />

        {/* Участници + За модерация */}
        {primaryItems.map(item => (
          <Link
            key={item.key}
            href={`${base}${item.sub}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
              active === item.key
                ? 'bg-white text-indigo-700 font-semibold shadow-sm'
                : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Secondary (pale) */}
      <div className="pt-4 border-t border-black/5 space-y-0.5">
        {secondaryItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm text-slate-400 hover:bg-white/50"
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <a
          href="mailto:support@lexicon.bg"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-white/50 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-xl">help</span>
          Помощен център
        </a>
        <LogoutButton />

        {/* CTA */}
        <div className="pt-2">
          {isPublished ? (
            <Link
              href={`/lexicon/${classId}`}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-center shadow bg-gradient-to-br from-indigo-600 to-indigo-500 text-white hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Към лексикона
            </Link>
          ) : (
            <Link
              href={`${base}/finalize`}
              className={`w-full block py-3 px-4 rounded-xl font-bold text-sm text-center shadow transition-opacity ${
                active === 'finalize'
                  ? 'bg-gradient-to-br from-indigo-700 to-indigo-600 text-white opacity-100'
                  : 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white hover:opacity-90'
              }`}
            >
              Финализирай лексикона
            </Link>
          )}
        </div>
      </div>
    </aside>
    </MobileMenuWrapper>
  )
}
