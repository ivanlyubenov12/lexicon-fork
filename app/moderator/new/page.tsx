import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import CreateClassForm from './CreateClassForm'
import LogoutButton from '@/app/moderator/[classId]/LogoutButton'

const VALID_PRESETS = ['primary', 'teens', 'kindergarten', 'sports', 'friends'] as const
type Preset = typeof VALID_PRESETS[number]

const PRESET_LABELS: Record<Preset, string> = {
  primary:      '1–4 клас',
  teens:        'Горен курс (5–12 клас)',
  kindergarten: 'Детска градина',
  sports:       'Спортен отбор',
  friends:      'Приятелска група',
}

const SETUP_STEPS = [
  { n: 1, label: 'Избери тип лексикон', icon: 'category' },
  { n: 2, label: 'Попълни данните',     icon: 'edit_note' },
  { n: 3, label: 'Покани членовете',    icon: 'send'      },
]

export default async function NewClassPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { type } = await searchParams
  const preset = VALID_PRESETS.includes(type as Preset) ? (type as Preset) : null
  const showSchoolSub = type === 'school'
  const step = preset || showSchoolSub ? 2 : 1

  const existingName = (user.user_metadata?.full_name || user.user_metadata?.name || '') as string

  const sidebar = (
    <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-0 h-screen p-4 z-50 border-r border-black/5">
      <div className="px-2 py-4">
        <Link href="/moderator" className="block group">
          <h1 className="text-indigo-900 text-xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors" style={{ fontFamily: 'Noto Serif, serif' }}>
            Малки спомени
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-3 px-2 py-3 bg-white/60 rounded-xl mb-6">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-sm text-indigo-500">person</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-700 truncate">{user.email}</p>
        </div>
      </div>

      <div className="px-1 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-2">Нов лексикон</p>
        <ul className="space-y-1">
          {SETUP_STEPS.map(s => {
            const active = s.n === step
            const done = s.n < step
            return (
              <li key={s.n}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  active ? 'bg-indigo-600 text-white shadow-sm' : done ? 'text-indigo-400' : 'text-gray-400 opacity-50'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                    active ? 'bg-white/20 text-white' : done ? 'bg-indigo-100 text-indigo-500' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {done ? '✓' : s.n}
                  </div>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-auto pt-4 border-t border-black/5">
        <LogoutButton />
      </div>
    </aside>
  )

  // ── Step 1a: school sub-choice (primary vs teens) ──────────────────────
  if (showSchoolSub) {
    return (
      <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
        <MobileHeader step={`${step}/${SETUP_STEPS.length}`} />
        <div className="flex">
          {sidebar}
          <main className="w-full lg:ml-64 px-4 sm:px-8 lg:px-10 py-8 lg:py-12 max-w-2xl mx-auto lg:mx-0">
            <Link href="/moderator/new" className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-700 mb-6">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Назад
            </Link>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Стъпка 1 от {SETUP_STEPS.length}</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noto Serif, serif' }}>
              Кой клас?
            </h2>
            <p className="text-sm text-gray-500 mb-8">Изберете нивото на класа.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['primary', 'teens'] as const).map(p => (
                <Link
                  key={p}
                  href={`/moderator/new?type=${p}`}
                  className="bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-400 p-6 flex flex-col gap-3 transition-all hover:shadow-md group"
                >
                  <span className="text-3xl">{p === 'primary' ? '📚' : '🎓'}</span>
                  <div>
                    <p className="font-bold text-gray-900">{PRESET_LABELS[p]}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{p === 'primary' ? 'Начален курс' : '5 до 12 клас'}</p>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-400 transition-colors self-end">arrow_forward</span>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  // ── Step 2: form ───────────────────────────────────────────────────────
  if (preset) {
    return (
      <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
        <MobileHeader step={`${step}/${SETUP_STEPS.length}`} />
        <div className="flex">
          {sidebar}
          <main className="w-full lg:ml-64 px-4 sm:px-8 lg:px-10 py-8 lg:py-12 max-w-2xl mx-auto lg:mx-0">
            <Link
              href={preset === 'primary' || preset === 'teens' ? '/moderator/new?type=school' : '/moderator/new'}
              className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-700 mb-6"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Назад
            </Link>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2 hidden lg:block">
              Стъпка {step} от {SETUP_STEPS.length}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-1" style={{ fontFamily: 'Noto Serif, serif' }}>
              Попълни данните
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Тип: <span className="font-semibold text-indigo-600">{PRESET_LABELS[preset]}</span>
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-8">
              <CreateClassForm defaultModeratorName={existingName} lexiconType={preset} />
            </div>
          </main>
        </div>
      </div>
    )
  }

  // ── Step 1: type picker ────────────────────────────────────────────────
  const TYPE_OPTIONS = [
    { type: 'school',       emoji: '🏫', label: 'Училищен клас',    desc: 'Начален или горен курс',    sub: true },
    { type: 'kindergarten', emoji: '🧸', label: 'Детска градина',   desc: 'Група в детска градина',    sub: false },
    { type: 'sports',       emoji: '⚽', label: 'Спортен отбор',    desc: 'Футбол, баскетбол и др.',   sub: false },
    { type: 'friends',      emoji: '👥', label: 'Приятелска група', desc: 'Приятели, колеги и др.',    sub: false },
  ]

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <MobileHeader step={`1/${SETUP_STEPS.length}`} />
      <div className="flex">
        {sidebar}
        <main className="w-full lg:ml-64 px-4 sm:px-8 lg:px-10 py-8 lg:py-12 max-w-2xl mx-auto lg:mx-0">
          <Link href="/moderator" className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-700 mb-6">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Моите лексикони
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Стъпка 1 от {SETUP_STEPS.length}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noto Serif, serif' }}>
            Вашият лексикон ще бъде за:
          </h2>
          <p className="text-sm text-gray-500 mb-8">Изберете типа на лексикона, за да настроим подходящите въпроси и оформление.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TYPE_OPTIONS.map(opt => (
              <Link
                key={opt.type}
                href={`/moderator/new?type=${opt.type}`}
                className="bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-400 p-6 flex flex-col gap-3 transition-all hover:shadow-md group"
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{opt.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
                <div className="flex items-center justify-between">
                  {opt.sub && (
                    <span className="text-xs text-indigo-400 font-medium">Изберете ниво →</span>
                  )}
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-400 transition-colors ml-auto">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function MobileHeader({ step }: { step: string }) {
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-black/5 sticky top-0 z-50">
      <Link href="/moderator" className="flex items-center gap-2">
        <span className="material-symbols-outlined text-indigo-600 text-xl">arrow_back</span>
        <span className="text-sm font-bold text-indigo-900" style={{ fontFamily: 'Noto Serif, serif' }}>Малки спомени</span>
      </Link>
      <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
        Стъпка {step}
      </span>
    </header>
  )
}
