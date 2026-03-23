'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { publishClass } from '../actions'

interface Props {
  classId: string
  className: string
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
  classStatus,
  totalStudents,
  acceptedStudents,
  approvedAnswers,
  pendingAnswers,
  pendingMessages,
  hasSuperheroImage,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPublished = classStatus === 'published'

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

  async function handlePublish() {
    setLoading(true)
    setError(null)
    const result = await publishClass(classId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/lexicon/${classId}`)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href={`/moderator/${classId}`} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Назад
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Финализирай</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {isPublished && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-green-800 font-semibold text-lg mb-2">Продуктът е публикуван!</p>
            <p className="text-green-700 text-sm mb-4">Родителите вече могат да го разгледат.</p>
            <Link
              href={`/lexicon/${classId}`}
              className="inline-block bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Виж публикувания →
            </Link>
          </div>
        )}

        {/* Class summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Резюме — {className}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-indigo-600">{totalStudents}</p>
              <p className="text-xs text-gray-500 mt-1">Деца в класа</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-indigo-600">{approvedAnswers}</p>
              <p className="text-xs text-gray-500 mt-1">Одобрени отговора</p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Проверка преди публикуване</h2>
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    check.ok ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {check.ok ? '✓' : '!'}
                  </span>
                  <span className="text-sm text-gray-700">{check.label}</span>
                </div>
                <span className={`text-xs font-medium ${check.ok ? 'text-green-600' : 'text-yellow-600'}`}>
                  {check.detail}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Предупрежденията не блокират публикуването. Можеш да публикуваш по всяко време.
          </p>
        </div>

        {/* Publish button */}
        {!isPublished && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}
            <button
              onClick={handlePublish}
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Публикуване...' : 'Публикувай'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              След публикуване продуктът ще бъде достъпен за всички родители.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
