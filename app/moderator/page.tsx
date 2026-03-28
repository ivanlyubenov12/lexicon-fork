export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import LogoutButton from '@/app/moderator/[classId]/LogoutButton'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Настройка',   color: 'bg-gray-100 text-gray-600' },
  filling:   { label: 'Попълва се',  color: 'bg-amber-100 text-amber-700' },
  published: { label: 'Публикуван',  color: 'bg-emerald-100 text-emerald-700' },
}

export default async function ModeratorIndexPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: classes } = await admin
    .from('classes')
    .select('id, name, school_year, status, school_logo_url, created_at')
    .eq('moderator_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch student counts per class
  const classIds = (classes ?? []).map(c => c.id)
  const studentCounts: Record<string, number> = {}
  if (classIds.length > 0) {
    const { data: counts } = await admin
      .from('students')
      .select('class_id')
      .in('class_id', classIds)
    for (const row of counts ?? []) {
      studentCounts[row.class_id] = (studentCounts[row.class_id] ?? 0) + 1
    }
  }

  const classList = classes ?? []

  return (
    <div className="min-h-screen bg-[#f4f3f2] flex" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#f4f3f2] flex flex-col p-4 z-50 border-r border-black/5">
        <div className="px-2 py-4">
          <h1 className="text-indigo-900 text-xl font-bold tracking-tight" style={{ fontFamily: 'Noto Serif, serif' }}>
            Един неразделен клас
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <div className="flex items-center gap-3 px-2 py-3 bg-white/60 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-indigo-900 truncate">Моите класове</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="pt-4 space-y-2">
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-64 flex-1 p-4 pt-20 md:p-8 lg:p-12">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <nav className="flex gap-2 text-xs text-slate-400 uppercase tracking-widest mb-2">
              <span className="text-indigo-600 font-bold">Всички класове</span>
            </nav>
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
              Моите класове
            </h2>
          </div>
          <Link
            href="/moderator/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Нов клас
          </Link>
        </header>

        {classList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-200 block mb-4">school</span>
            <h3 className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Noto Serif, serif' }}>
              Нямате класове още
            </h3>
            <p className="text-sm text-slate-400 mb-6">Създайте първия си лексикон за да започнете.</p>
            <Link
              href="/moderator/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Създай клас
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classList.map(cls => {
              const [namePart, schoolPart] = cls.name.includes(' — ')
                ? cls.name.split(' — ')
                : [cls.name, null]
              const status = STATUS_LABELS[cls.status] ?? STATUS_LABELS.draft
              const count = studentCounts[cls.id] ?? 0
              return (
                <Link
                  key={cls.id}
                  href={`/moderator/${cls.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    {cls.school_logo_url ? (
                      <img src={cls.school_logo_url} alt="Лого" className="w-12 h-12 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {namePart[0]}
                      </div>
                    )}
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Noto Serif, serif' }}>
                      {namePart}
                    </h3>
                    {schoolPart && <p className="text-sm text-slate-400 mt-0.5">{schoolPart}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <span className="material-symbols-outlined text-base">group</span>
                      {count} {count === 1 ? 'ученик' : 'ученика'}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <span>{cls.school_year}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
