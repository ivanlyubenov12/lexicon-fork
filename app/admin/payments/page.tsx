export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPaymentsPage() {
  noStore()
  const admin = createServiceRoleClient()

  // Published classes = completed payments (currently no Stripe data tracked)
  const { data: publishedClasses } = await admin
    .from('classes')
    .select('id, name, school_year, finalized_at, moderator_id, stripe_payment_id')
    .eq('status', 'published')
    .order('finalized_at', { ascending: false })

  const { data: pendingClasses } = await admin
    .from('classes')
    .select('id, name, school_year, moderator_id')
    .eq('status', 'unpublished')
    .order('created_at', { ascending: false })

  // Moderator emails
  const { data: usersData } = await admin.auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  for (const u of usersData?.users ?? []) {
    emailMap[u.id] = u.email ?? '—'
  }

  const PRICE = 69.99
  const totalRevenue = (publishedClasses ?? []).length * PRICE

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Администрация</p>
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
          Плащания
        </h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-3xl font-bold text-green-600">{totalRevenue.toFixed(2)} €</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">Общ приход</p>
          <p className="text-xs text-gray-400 mt-0.5">{(publishedClasses ?? []).length} × {PRICE} €</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-3xl font-bold text-gray-900">{(publishedClasses ?? []).length}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">Публикувани лексикона</p>
          <p className="text-xs text-gray-400 mt-0.5">платени поръчки</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-3xl font-bold text-amber-500">{(pendingClasses ?? []).length}</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">Чакат плащане</p>
          <p className="text-xs text-gray-400 mt-0.5">в процес</p>
        </div>
      </div>

      {/* Pending payments */}
      {(pendingClasses ?? []).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-amber-200">
            <h2 className="font-bold text-amber-800 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 18 }}>pending</span>
              Чакат плащане
            </h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {(pendingClasses ?? []).map((cls) => (
                <tr key={cls.id} className="border-b border-amber-100 last:border-0">
                  <td className="px-6 py-3 font-medium text-gray-800">{cls.name}</td>
                  <td className="px-6 py-3 text-gray-500">{cls.school_year}</td>
                  <td className="px-6 py-3 text-xs text-gray-400">{emailMap[cls.moderator_id] ?? '—'}</td>
                  <td className="px-6 py-3 font-bold text-amber-700 text-right">{PRICE} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Published / paid */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800 text-sm">Платени лексикони</h2>
        </div>
        {(publishedClasses ?? []).length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Клас</th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Модератор</th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Дата</th>
                <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Stripe ID</th>
                <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Сума</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(publishedClasses ?? []).map((cls) => (
                <tr key={cls.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <div>{cls.name}</div>
                    <div className="text-xs text-gray-400">{cls.school_year}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{emailMap[cls.moderator_id] ?? '—'}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {cls.finalized_at
                      ? new Date(cls.finalized_at).toLocaleDateString('bg-BG')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {cls.stripe_payment_id ?? '—'}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600 text-right">{PRICE} €</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/lexicon/${cls.id}`} target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600">
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-green-50">
                <td colSpan={4} className="px-6 py-3 text-sm font-bold text-gray-700">Общо</td>
                <td className="px-6 py-3 font-bold text-green-700 text-right">{totalRevenue.toFixed(2)} €</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="px-6 py-16 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl block mb-2 text-gray-200">payments</span>
            Все още няма завършени плащания.
          </div>
        )}
      </div>
    </div>
  )
}
