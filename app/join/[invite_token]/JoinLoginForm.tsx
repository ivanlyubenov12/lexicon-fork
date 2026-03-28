'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { loginFromJoin } from './actions'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Влизане...' : 'Влез →'}
    </button>
  )
}

interface Props {
  studentId: string
  studentName: string
  parentEmail: string
  reason?: 'already_accepted' | 'account_exists'
}

export default function JoinLoginForm({ studentId, studentName, parentEmail, reason }: Props) {
  const router = useRouter()
  const [state, action] = useFormState(loginFromJoin, { error: null, redirectTo: null })

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo)
  }, [state.redirectTo, router])

  const message = reason === 'account_exists'
    ? <>Имейлът <span className="font-semibold text-gray-800">{parentEmail}</span> вече е регистриран. Влезте с паролата си, за да свържете профила на <span className="font-semibold text-gray-800">{studentName}</span>.</>
    : <>Добре дошли обратно! Влезте с паролата си, за да видите профила на <span className="font-semibold text-gray-800">{studentName}</span>.</>

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 text-center">{message}</p>

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-3">
        <input type="hidden" name="studentId" value={studentId} />

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Имейл</label>
          <input
            type="email"
            name="email"
            readOnly
            value={parentEmail}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Парола</label>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Вашата парола"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <SubmitBtn />
      </form>
    </div>
  )
}
