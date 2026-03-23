import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import QuestionsEditor from './QuestionsEditor'

export default async function QuestionsPage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData) notFound()

  const { data: systemQuestions } = await admin
    .from('questions')
    .select('id, text, type, allows_text, allows_media, max_length, order_index')
    .is('class_id', null)
    .eq('is_system', true)
    .order('order_index')

  const { data: customQuestions } = await admin
    .from('questions')
    .select('id, text, type, allows_text, allows_media, max_length, order_index')
    .eq('class_id', classId)
    .eq('is_system', false)
    .order('order_index')

  const [namePart] = classData.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name ?? '']

  const base = `/moderator/${classId}`

  const navItems = [
    { icon: 'dashboard', label: 'Табло', href: base },
    { icon: 'group', label: 'Деца', href: `${base}/students` },
    { icon: 'volunteer_activism', label: 'Отговори', href: `${base}/answers` },
    { icon: 'quiz', label: 'Въпросник', href: `${base}/questions`, active: true },
    { icon: 'calendar_month', label: 'Събития', href: `${base}/events` },
  ]

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#f4f3f2] flex flex-col p-4 z-50">
        <div className="px-2 py-4">
          <h1
            className="text-indigo-900 text-xl font-bold tracking-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Един неразделен клас
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <div className="flex items-center gap-3 px-2 py-3 bg-white/60 rounded-xl mb-4">
          {classData.school_logo_url ? (
            <img
              src={classData.school_logo_url}
              alt="Лого"
              className="w-10 h-10 rounded-full object-contain bg-white border border-gray-100 p-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {namePart[0]}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-indigo-900 truncate">{namePart}</p>
            <p className="text-xs text-slate-400 truncate">{classData.school_year}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                item.active
                  ? 'bg-white text-indigo-700 font-semibold shadow-sm'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pt-4 space-y-2">
          <Link
            href={`${base}`}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-white/50 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-xl">help</span>
            Помощен център
          </Link>
          <Link
            href={`${base}/finalize`}
            className="w-full block bg-gradient-to-br from-indigo-600 to-indigo-500 text-white py-3 px-4 rounded-xl font-bold text-sm text-center shadow hover:opacity-90 transition-opacity"
          >
            Финализирай лексикона
          </Link>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="ml-64 flex-1 p-8 lg:p-12">
        <QuestionsEditor
          classId={classId}
          systemQuestions={systemQuestions ?? []}
          customQuestions={customQuestions ?? []}
        />
      </main>
    </div>
  )
}
