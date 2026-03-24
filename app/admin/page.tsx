export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function AdminDashboard() {
  noStore()
  const admin = createServiceRoleClient()

  const [
    { count: totalClasses },
    { count: draftClasses },
    { count: activeClasses },
    { count: publishedClasses },
    { count: totalStudents },
    { count: totalAnswers },
    { count: pendingAnswers },
    { count: totalMessages },
    { count: pendingMessages },
  ] = await Promise.all([
    admin.from('classes').select('id', { count: 'exact', head: true }),
    admin.from('classes').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    admin.from('classes').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('classes').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    admin.from('students').select('id', { count: 'exact', head: true }),
    admin.from('answers').select('id', { count: 'exact', head: true }),
    admin.from('answers').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    admin.from('peer_messages').select('id', { count: 'exact', head: true }),
    admin.from('peer_messages').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const revenue = (publishedClasses ?? 0) * 69.99

  // Recent classes
  const { data: recentClasses } = await admin
    .from('classes')
    .select('id, name, school_year, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const statusLabel: Record<string, { label: string; color: string }> = {
    draft:            { label: 'Чернова',     color: 'bg-gray-100 text-gray-500' },
    active:           { label: 'Активен',     color: 'bg-blue-100 text-blue-700' },
    ready_for_payment:{ label: 'За плащане',  color: 'bg-amber-100 text-amber-700' },
    pending_payment:  { label: 'Плащане...',  color: 'bg-orange-100 text-orange-700' },
    published:        { label: 'Публикуван',  color: 'bg-green-100 text-green-700' },
  }

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Администрация</p>
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
          Табло
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="school" label="Общо класа" value={totalClasses ?? 0}
          sub={`${draftClasses ?? 0} чернови · ${activeClasses ?? 0} активни`}
          color="bg-indigo-50 text-indigo-500" />
        <StatCard icon="check_circle" label="Публикувани" value={publishedClasses ?? 0}
          sub="готови лексикони"
          color="bg-green-50 text-green-500" />
        <StatCard icon="group" label="Деца" value={totalStudents ?? 0}
          color="bg-blue-50 text-blue-500" />
        <StatCard icon="payments" label="Прогнозен приход" value={`${revenue.toFixed(2)} €`}
          sub={`${publishedClasses ?? 0} × 69.99 €`}
          color="bg-amber-50 text-amber-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="volunteer_activism" label="Всички отговори" value={totalAnswers ?? 0}
          color="bg-purple-50 text-purple-500" />
        <StatCard icon="pending" label="Чакат модерация" value={pendingAnswers ?? 0}
          sub="отговори за преглед"
          color={`${(pendingAnswers ?? 0) > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`} />
        <StatCard icon="forum" label="Послания" value={totalMessages ?? 0}
          color="bg-teal-50 text-teal-500" />
        <StatCard icon="mark_chat_unread" label="Чакат одобрение" value={pendingMessages ?? 0}
          color={`${(pendingMessages ?? 0) > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`} />
      </div>

      {/* Recent classes */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800">Последни класове</h2>
          <Link href="/admin/classes" className="text-xs text-indigo-500 font-semibold hover:underline">
            Виж всички →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Клас</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Година</th>
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Статус</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(recentClasses ?? []).map((cls) => {
              const st = statusLabel[cls.status] ?? { label: cls.status, color: 'bg-gray-100 text-gray-500' }
              return (
                <tr key={cls.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{cls.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cls.school_year}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/classes`}
                      className="text-xs text-indigo-400 hover:text-indigo-600 font-semibold">
                      Детайли
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
