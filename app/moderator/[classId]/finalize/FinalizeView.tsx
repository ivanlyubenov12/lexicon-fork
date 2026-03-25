'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PLANS, type Plan } from '@/lib/stripe'

interface Props {
  classId: string
  className: string
  classPlan: Plan | null
  classStatus: string
  totalStudents: number
  acceptedStudents: number
  approvedAnswers: number
  pendingAnswers: number
  pendingMessages: number
  hasSuperheroImage: boolean
}

export default function FinalizeView({
  classId,
  className,
  classPlan,
  classStatus,
  totalStudents,
  acceptedStudents,
  approvedAnswers,
  pendingAnswers,
  pendingMessages,
  hasSuperheroImage,
}: Props) {
  const [selected, setSelected] = useState<Plan>(classPlan === 'basic' ? 'premium' : 'basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPublished = classStatus === 'published'
  const isUpgrade   = classPlan === 'basic' && selected === 'premium'
  const price       = isUpgrade
    ? (PLANS.premium.price - PLANS.basic.price).toFixed(2)
    : PLANS[selected].price.toFixed(2)

  const checks = [
    {
      label: 'Всички деца са приели поканата',
      ok: acceptedStudents === totalStudents && totalStudents > 0,
      detail: `${acceptedStudents} от ${totalStudents}`,
    },
    {
      label: 'Няма чакащи отговори за одобрение',
      ok: pendingAnswers === 0,
      detail: pendingAnswers > 0 ? `${pendingAnswers} чакат` : 'OK',
    },
    {
      label: 'Няма чакащи послания за одобрение',
      ok: pendingMessages === 0,
      detail: pendingMessages > 0 ? `${pendingMessages} чакат` : 'OK',
    },
    {
      label: 'Супергерой образът е генериран',
      ok: hasSuperheroImage,
      detail: hasSuperheroImage ? 'OK' : 'Не е генериран',
    },
  ]

  async function handlePay() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, plan: selected }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Грешка'); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError('Грешка при свързване. Опитайте отново.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">

      {/* Published banner */}
      {isPublished && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-3xl text-green-500">celebration</span>
            <div>
              <p className="text-green-800 font-bold text-lg">Лексиконът е публикуван!</p>
              <p className="text-green-700 text-sm">
                План: <span className="font-semibold">{classPlan ? PLANS[classPlan].label : '—'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/lexicon/${classId}`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Виж публикувания
            </Link>
            {classPlan === 'premium' && (
              <a
                href={`/api/pdf/${classId}`}
                download
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                Изтегли PDF
              </a>
            )}
          </div>
        </div>
      )}

      {/* Upgrade banner (published but basic) */}
      {isPublished && classPlan === 'basic' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <p className="text-indigo-800 font-semibold text-sm mb-1">Искаш PDF и видео отговори?</p>
          <p className="text-indigo-600 text-sm mb-3">
            Надградете до Premium за допълнителни €{(PLANS.premium.price - PLANS.basic.price).toFixed(2)}.
          </p>
          <button
            onClick={handlePay}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-base">upgrade</span>
            {loading ? 'Зареждане...' : 'Надгради до Premium — €30.00'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Резюме — {className}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#faf9f8] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{totalStudents}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Деца в класа</p>
          </div>
          <div className="bg-[#faf9f8] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-indigo-600">{approvedAnswers}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Одобрени отговора</p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
          Проверка преди публикуване
        </p>
        <div className="space-y-1">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${check.ok ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <span className={`material-symbols-outlined text-sm ${check.ok ? 'text-green-600' : 'text-amber-600'}`}>
                    {check.ok ? 'check' : 'warning'}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{check.label}</span>
              </div>
              <span className={`text-xs font-semibold ${check.ok ? 'text-green-600' : 'text-amber-600'}`}>
                {check.detail}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Предупрежденията не блокират публикуването. Можеш да публикуваш по всяко време.
        </p>
      </div>

      {/* Plan selector + payment (only when not yet published) */}
      {!isPublished && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Избери план</p>

          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][]).map(([key, plan]) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selected === key
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-gray-900">{plan.label}</p>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    selected === key ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                  }`}>
                    {selected === key && (
                      <span className="material-symbols-outlined text-white text-xs flex items-center justify-center h-full">check</span>
                    )}
                  </div>
                </div>
                <p className="text-xl font-bold text-indigo-600 mb-3">€{plan.price.toFixed(2)}</p>
                <ul className="space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-white font-bold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow text-sm"
          >
            {loading
              ? 'Зареждане...'
              : `Плати €${price} и публикувай`}
          </button>
          <p className="text-xs text-gray-400 text-center">
            След плащане лексиконът се публикува автоматично.
          </p>
        </div>
      )}
    </div>
  )
}
