export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import LogoutButton from '@/app/moderator/[classId]/LogoutButton'
import MobileMenuWrapper from '@/app/moderator/[classId]/MobileMenuWrapper'
import ProfileForm from './ProfileForm'
import { normalisePlan, PLANS } from '@/lib/plans'

export default async function ProfilePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  // Fetch classes with plan info
  const { data: classes } = await admin
    .from('classes')
    .select('id, name, plan, created_at')
    .eq('moderator_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch payment history
  const { data: payments } = await admin
    .from('payments')
    .select('id, class_id, plan, amount_cents, currency, status, stripe_payment_id, created_at')
    .eq('moderator_id', user.id)
    .order('created_at', { ascending: false })

  const classNameMap: Record<string, string> = {}
  for (const cls of classes ?? []) classNameMap[cls.id] = cls.name

  const fullName = (user.user_metadata?.full_name as string) ?? ''

  return (
    <div className="min-h-screen bg-[#f4f3f2] flex" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <MobileMenuWrapper namePart="Профил">
        <aside className="w-64 h-screen bg-[#f4f3f2] flex flex-col p-4 overflow-y-auto border-r border-black/5">
          <div className="px-2 py-4">
            <Link href="/moderator">
              <h1 className="text-indigo-900 text-xl font-bold tracking-tight" style={{ fontFamily: 'Noto Serif, serif' }}>
                Малки спомени
              </h1>
            </Link>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Моите лексикони</p>
          </div>

          <nav className="flex-1 space-y-0.5 mt-2">
            <Link href="/moderator" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-white/50 text-sm transition-colors">
              <span className="material-symbols-outlined text-xl">grid_view</span>
              Моите лексикони
            </Link>
            <Link href="/moderator/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white text-indigo-700 font-semibold shadow-sm text-sm">
              <span className="material-symbols-outlined text-xl">manage_accounts</span>
              Профил и плащания
            </Link>
          </nav>

          <div className="pt-4 space-y-2">
            <LogoutButton />
          </div>
        </aside>
      </MobileMenuWrapper>

      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12 max-w-3xl">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Настройки</p>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>Профил</h1>
        </div>

        {/* Profile form */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Лични данни</h2>
          <ProfileForm email={user.email ?? ''} fullName={fullName} />
        </div>

        {/* Plans per lexicon */}
        {(classes ?? []).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Планове на лексиконите</h2>
            <div className="space-y-2">
              {(classes ?? []).map(cls => {
                const [namePart] = cls.name.includes(' — ') ? cls.name.split(' — ') : [cls.name]
                const plan = normalisePlan(cls.plan)
                const meta = PLANS[plan]
                return (
                  <div key={cls.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700 font-medium">{namePart}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Payment history */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">История на плащанията</h2>
          {(payments ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 italic">Няма плащания.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="text-left pb-3 pr-4">Дата</th>
                    <th className="text-left pb-3 pr-4">Лексикон</th>
                    <th className="text-left pb-3 pr-4">План</th>
                    <th className="text-right pb-3 pr-4">Сума</th>
                    <th className="text-left pb-3">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(payments ?? []).map(p => {
                    const plan = normalisePlan(p.plan)
                    const meta = PLANS[plan]
                    const date = new Date(p.created_at).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })
                    const amount = p.amount_cents ? `${(p.amount_cents / 100).toFixed(2)} ${(p.currency ?? 'bgn').toUpperCase()}` : '—'
                    const statusColors: Record<string, string> = {
                      succeeded: 'bg-green-100 text-green-700',
                      pending:   'bg-amber-100 text-amber-700',
                      failed:    'bg-red-100 text-red-600',
                      refunded:  'bg-gray-100 text-gray-500',
                    }
                    return (
                      <tr key={p.id}>
                        <td className="py-3 pr-4 text-gray-500">{date}</td>
                        <td className="py-3 pr-4 font-medium text-gray-800">
                          {classNameMap[p.class_id]?.split(' — ')[0] ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-gray-800">{amount}</td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
