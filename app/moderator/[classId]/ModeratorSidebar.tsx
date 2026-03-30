import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { createServerClient } from '@/lib/supabase/server'
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
  | null

interface Props {
  classId: string
  namePart: string
  schoolYear: string | null
  logoUrl: string | null
  active: ActiveNav
}

const NAV_ITEMS = [
  { key: 'dashboard', icon: 'dashboard',    label: 'Табло',    sub: '' },
  { key: 'students',  icon: 'group',         label: 'Участници', sub: '/students' },
  { key: 'answers',   icon: 'volunteer_activism', label: 'Отговори', sub: '/answers' },
  { key: 'lexicon',   icon: 'view_quilt',    label: 'Лексикон', sub: '/lexicon' },
  { key: 'events',    icon: 'photo_album',   label: 'Събития',  sub: '/events' },
  { key: 'preview',   icon: 'visibility',    label: 'Превю',    sub: '/preview' },
] as const

export default async function ModeratorSidebar({ classId, namePart, schoolYear, logoUrl, active }: Props) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const base = `/moderator/${classId}`

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
        {NAV_ITEMS.map((item) => {
          const lexiconActive = item.key === 'lexicon' &&
            ['lexicon', 'questions', 'polls', 'messages', 'layout', 'template'].includes(active ?? '')
          const isActive = active === item.key || lexiconActive
          return (
            <Link
              key={item.key}
              href={`${base}${item.sub}`}
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
      <div className="pt-4 space-y-2">
        <Link
          href={`${base}/seed`}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
            active === 'seed'
              ? 'bg-amber-50 text-amber-700 font-semibold'
              : 'text-slate-400 hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-xl">science</span>
          Тест данни
        </Link>
        <a
          href={`/api/pdf/${classId}`}
          download
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm text-slate-400 hover:bg-white/50"
        >
          <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
          Изтегли PDF
        </a>
        <Link
          href="/moderator/profile"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
            active === null && false ? '' : 'text-slate-400 hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-xl">manage_accounts</span>
          Профил и плащания
        </Link>
        <LogoutButton />
        <a
          href="mailto:support@lexicon.bg"
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-white/50 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-xl">help</span>
          Помощен център
        </a>
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
      </div>
    </aside>
    </MobileMenuWrapper>
  )
}
