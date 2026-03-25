export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ShowcaseToggle from './ShowcaseToggle'
import PublishToggle from './PublishToggle'

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  draft:             { label: 'Чернова',    color: 'bg-gray-100 text-gray-500' },
  active:            { label: 'Активен',    color: 'bg-blue-100 text-blue-700' },
  ready_for_payment: { label: 'За плащане', color: 'bg-amber-100 text-amber-700' },
  pending_payment:   { label: 'Плащане…',   color: 'bg-orange-100 text-orange-700' },
  published:         { label: 'Публикуван', color: 'bg-green-100 text-green-700' },
}

export default async function AdminClassesPage() {
  noStore()
  const admin = createServiceRoleClient()

  const { data: classes, error: classesError } = await admin
    .from('classes')
    .select('id, name, school_year, status, showcase_order, created_at, moderator_id')
    .order('created_at', { ascending: false })

  if (classesError) console.error('[admin/classes] query error:', classesError.message)

  // Get student counts per class
  const classIds = (classes ?? []).map(c => c.id)
  const studentCountMap: Record<string, number> = {}
  if (classIds.length > 0) {
    const { data: counts } = await admin
      .from('students')
      .select('class_id')
      .in('class_id', classIds)
    for (const row of counts ?? []) {
      studentCountMap[row.class_id] = (studentCountMap[row.class_id] ?? 0) + 1
    }
  }

  // Get moderator emails
  const moderatorIds = [...new Set((classes ?? []).map(c => c.moderator_id))]
  const moderatorEmailMap: Record<string, string> = {}
  if (moderatorIds.length > 0) {
    const { data: users } = await admin.auth.admin.listUsers()
    for (const u of users?.users ?? []) {
      moderatorEmailMap[u.id] = u.email ?? '—'
    }
  }

  const showcaseClasses = (classes ?? [])
    .filter(c => c.showcase_order !== null)
    .sort((a, b) => (a.showcase_order ?? 99) - (b.showcase_order ?? 99))

  const showcaseFull = showcaseClasses.length >= 3

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Администрация</p>
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
          Класове
        </h1>
        <p className="text-sm text-gray-500 mt-2">{(classes ?? []).length} класа общо</p>
      </div>

      {/* Showcase slots */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-indigo-500 text-xl">star</span>
          <h2 className="font-bold text-gray-800">Showcase — публични примери</h2>
          <span className="ml-auto text-xs text-gray-400">{showcaseClasses.length}/3 слота заети</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((slot) => {
            const cls = showcaseClasses.find(c => c.showcase_order === slot)
            return (
              <div key={slot} className={`rounded-xl border-2 p-4 text-sm ${
                cls ? 'border-indigo-200 bg-indigo-50' : 'border-dashed border-gray-200 bg-gray-50'
              }`}>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Позиция {slot}</p>
                {cls ? (
                  <>
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{cls.name}</p>
                    <p className="text-xs text-indigo-500 mt-1">{cls.school_year}</p>
                    {cls.status === 'published' && (
                      <Link href={`/lexicon/${cls.id}`} target="_blank"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-400 hover:text-indigo-600">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
                        Виж
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-xs italic">Свободен слот</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Classes table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Клас</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Модератор</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Статус</th>
              <th className="text-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Деца</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Showcase</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(classes ?? []).map((cls) => {
              const st = STATUS_STYLE[cls.status] ?? { label: cls.status, color: 'bg-gray-100 text-gray-500' }
              const studentCount = studentCountMap[cls.id] ?? 0
              const modEmail = moderatorEmailMap[cls.moderator_id] ?? '—'
              const allSlotsTaken = showcaseFull && cls.showcase_order === null

              return (
                <tr key={cls.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{cls.name}</p>
                    <p className="text-xs text-gray-400">{cls.school_year}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{modEmail}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-700">{studentCount}</td>
                  <td className="px-6 py-4">
                    <ShowcaseToggle
                      classId={cls.id}
                      currentOrder={cls.showcase_order}
                      disabled={allSlotsTaken}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {cls.status === 'published' && (
                        <Link href={`/lexicon/${cls.id}`} target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600 font-semibold">
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
                          Лексикон
                        </Link>
                      )}
                      <PublishToggle classId={cls.id} isPublished={cls.status === 'published'} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(classes ?? []).length === 0 && (
          <div className="px-6 py-16 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl block mb-2 text-gray-200">school</span>
            Все още няма класове.
          </div>
        )}
      </div>
    </div>
  )
}
