import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import CreateClassForm from './CreateClassForm'
import LogoutButton from '@/app/moderator/[classId]/LogoutButton'

const SETUP_STEPS = [
  { n: 1, label: 'Създай клас',        icon: 'school'           },
  { n: 2, label: 'Въведи спомени',     icon: 'photo_album'      },
  { n: 3, label: 'Избери шаблон',      icon: 'view_quilt'       },
  { n: 4, label: 'Настрой въпросника', icon: 'quiz'             },
  { n: 5, label: 'Покани децата',      icon: 'send'             },
]

export default async function NewClassPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const existingName = (user.user_metadata?.full_name || user.user_metadata?.name || '') as string

  return (
    <div
      className="min-h-screen bg-[#f4f3f2]"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {/* ── Mobile top bar (hidden on lg) ──────────────────────────── */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-black/5 sticky top-0 z-50">
        <Link href="/moderator" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-xl">arrow_back</span>
          <span className="text-sm font-bold text-indigo-900" style={{ fontFamily: 'Noto Serif, serif' }}>
            Малки спомени
          </span>
        </Link>
        <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
          Стъпка 1/{SETUP_STEPS.length}
        </span>
      </header>

      <div className="flex">
        {/* ── Desktop sidebar (hidden on mobile) ────────────────────── */}
        <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-0 h-screen p-4 z-50 border-r border-black/5">

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

          {/* Logged-in user */}
          <div className="flex items-center gap-3 px-2 py-3 bg-white/60 rounded-xl mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-sm text-indigo-500">person</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{user.email}</p>
              <p className="text-xs text-gray-400">Модератор</p>
            </div>
          </div>

          {/* Setup steps */}
          <div className="px-1 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-2">
              Начална настройка
            </p>
            <ul className="space-y-1">
              {SETUP_STEPS.map(step => {
                const active = step.n === 1
                return (
                  <li key={step.n}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-400 opacity-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                          active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {step.n}
                      </div>
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Logout */}
          <div className="mt-auto pt-4 border-t border-black/5">
            <LogoutButton />
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────── */}
        <main className="w-full lg:ml-64 px-4 sm:px-8 lg:px-10 py-8 lg:py-12 max-w-2xl mx-auto lg:mx-0">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2 hidden lg:block">
              Стъпка 1 от {SETUP_STEPS.length}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Създай клас
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Само паралелката и училището са задължителни — всичко останало може да добавите по-късно.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-8">
            <CreateClassForm defaultModeratorName={existingName} />
          </div>
        </main>
      </div>
    </div>
  )
}
