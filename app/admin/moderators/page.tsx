export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'

export default async function AdminModeratorsPage() {
  noStore()
  const admin = createServiceRoleClient()

  // List all auth users
  const { data: usersData } = await admin.auth.admin.listUsers()
  const allUsers = usersData?.users ?? []

  // Get classes per moderator
  const { data: classes } = await admin
    .from('classes')
    .select('id, name, school_year, status, moderator_id')
    .order('created_at', { ascending: false })

  const classesByModerator = new Map<string, typeof classes>()
  for (const cls of classes ?? []) {
    const existing = classesByModerator.get(cls.moderator_id) ?? []
    classesByModerator.set(cls.moderator_id, [...existing, cls])
  }

  // Get student counts per class
  const { data: students } = await admin
    .from('students')
    .select('class_id')
  const studentsByClass: Record<string, number> = {}
  for (const s of students ?? []) {
    studentsByClass[s.class_id] = (studentsByClass[s.class_id] ?? 0) + 1
  }

  const STATUS_COLOR: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-500',
    active: 'bg-blue-100 text-blue-700',
    ready_for_payment: 'bg-amber-100 text-amber-700',
    pending_payment: 'bg-orange-100 text-orange-700',
    published: 'bg-green-100 text-green-700',
  }
  const STATUS_LABEL: Record<string, string> = {
    draft: 'Чернова', active: 'Активен', ready_for_payment: 'За плащане',
    pending_payment: 'Плащане…', published: 'Публикуван',
  }

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Администрация</p>
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
          Модератори
        </h1>
        <p className="text-sm text-gray-500 mt-2">{allUsers.length} регистрирани потребители</p>
      </div>

      <div className="space-y-4">
        {allUsers.map((user) => {
          const userClasses = classesByModerator.get(user.id) ?? []
          const totalStudents = userClasses.reduce((sum, c) => sum + (studentsByClass[c.id] ?? 0), 0)
          const publishedCount = userClasses.filter(c => c.status === 'published').length
          const initials = (user.email ?? '?')[0].toUpperCase()

          return (
            <div key={user.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* User header */}
              <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Регистриран: {new Date(user.created_at).toLocaleDateString('bg-BG')}
                    {user.last_sign_in_at && (
                      <> · Последен вход: {new Date(user.last_sign_in_at).toLocaleDateString('bg-BG')}</>
                    )}
                  </p>
                </div>
                <div className="flex gap-4 text-center flex-shrink-0">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{userClasses.length}</p>
                    <p className="text-xs text-gray-400">класа</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{totalStudents}</p>
                    <p className="text-xs text-gray-400">деца</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{publishedCount}</p>
                    <p className="text-xs text-gray-400">публ.</p>
                  </div>
                </div>
              </div>

              {/* Classes */}
              {userClasses.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {userClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{cls.name}</p>
                        <p className="text-xs text-gray-400">{cls.school_year}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[cls.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABEL[cls.status] ?? cls.status}
                      </span>
                      <span className="text-xs text-gray-500 w-16 text-right">
                        {studentsByClass[cls.id] ?? 0} деца
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-6 py-4 text-xs text-gray-400 italic">Няма създадени класове.</p>
              )}
            </div>
          )
        })}

        {allUsers.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl block mb-2 text-gray-200">manage_accounts</span>
            Няма регистрирани потребители.
          </div>
        )}
      </div>
    </div>
  )
}
