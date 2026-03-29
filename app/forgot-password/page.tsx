'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/auth/callback?type=recovery`,
    })

    setLoading(false)
    if (error) { setError('Грешка при изпращане. Проверете имейла.'); return }
    setSent(true)
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <span className="material-symbols-outlined text-4xl text-indigo-500 block mb-3">mark_email_read</span>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Проверете имейла си</h2>
            <p className="text-sm text-gray-500 mb-6">
              Изпратихме линк за смяна на парола до <strong>{email}</strong>.
            </p>
            <Link href="/login" className="text-sm text-indigo-600 hover:underline">← Обратно към вход</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Малки спомени</h1>
          <p className="mt-2 text-gray-500 text-sm">Възстановяване на парола</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Забравена парола</h2>
          <p className="text-sm text-gray-500 mb-6">
            Въведете имейла си и ще получите линк за нова парола.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="вашия@имейл.com"
                className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Изпращане...' : 'Изпрати линк'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/login" className="text-indigo-600 hover:underline">← Обратно към вход</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
