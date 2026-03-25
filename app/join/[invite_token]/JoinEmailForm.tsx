'use client'

import { useState } from 'react'
import { sendJoinMagicLink } from './actions'

interface Props {
  inviteToken: string
  parentEmail: string
  studentFirstName: string
}

export default function JoinEmailForm({ inviteToken, parentEmail, studentFirstName }: Props) {
  const [email, setEmail]     = useState(parentEmail)
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const result = await sendJoinMagicLink(inviteToken, email.trim())
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-2">
        <span className="material-symbols-outlined text-5xl text-indigo-400 block mb-4">mark_email_read</span>
        <p className="font-bold text-gray-900 text-lg mb-2">Проверете имейла си</p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Изпратихме линк за достъп до{' '}
          <span className="font-semibold text-gray-700">{email}</span>.
          <br />
          Кликнете го, за да попълните страницата на {studentFirstName}.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Не виждате имейл? Проверете папката Спам.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 text-center mb-2">
        Ще получите имейл с бутон за директен достъп — без парола.
      </p>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
          Вашият имейл адрес
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="email@example.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm shadow-sm"
      >
        {loading ? 'Изпраща се...' : 'Изпрати ми линк за достъп'}
      </button>
    </form>
  )
}
