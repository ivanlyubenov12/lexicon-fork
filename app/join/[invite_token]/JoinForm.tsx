'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  studentId: string
  studentName: string
  parentEmail: string
}

export default function JoinForm({ studentId, studentName, parentEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const redirectTo =
      `${window.location.origin}/auth/callback?studentId=${studentId}`

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: parentEmail,
      options: { emailRedirectTo: redirectTo },
    })

    if (otpError) {
      setError('Изпращането не успя. Опитайте отново.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">✉️</div>
        <p className="font-semibold text-gray-800">Проверете имейла си</p>
        <p className="text-sm text-gray-500">
          Изпратихме линк за вход на{' '}
          <span className="font-medium text-gray-700">{parentEmail}</span>.
          Кликнете върху него, за да влезете.
        </p>
        <p className="text-xs text-gray-400">Линкът е валиден 1 час.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 text-center">
        Здравейте! Поканени сте да попълните профила на{' '}
        <span className="font-semibold text-gray-800">{studentName}</span>{' '}
        в Един неразделен клас.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
        <input
          type="email"
          readOnly
          value={parentEmail}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Изпращане...' : 'Изпрати линк за вход'}
      </button>
    </div>
  )
}
