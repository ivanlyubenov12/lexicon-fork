'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { registerParent } from './actions'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Създаване...' : 'Създай профил →'}
    </button>
  )
}

interface Props {
  studentId: string
  studentName: string
  parentEmail: string
  /** Allow editing the email (when no pre-set email on the invite) */
  emailEditable?: boolean
}

export default function JoinRegisterForm({ studentId, studentName, parentEmail, emailEditable = false }: Props) {
  const router = useRouter()
  const [state, action] = useFormState(registerParent, { error: null, redirectTo: null })

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo)
  }, [state.redirectTo, router])

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 text-center">
        Здравейте! Поканени сте да попълните профила на{' '}
        <span className="font-semibold text-gray-800">{studentName}</span>.
        Създайте профил с парола — ще можете да влизате по всяко време.
      </p>

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
            readOnly={!emailEditable}
            defaultValue={parentEmail}
            required
            autoFocus={emailEditable}
            placeholder={emailEditable ? 'email@example.com' : undefined}
            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${emailEditable ? '' : 'bg-gray-50 text-gray-500 cursor-not-allowed'}`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Парола</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Поне 6 символа"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Потвърди паролата</label>
          <input
            type="password"
            name="confirm"
            required
            autoComplete="new-password"
            placeholder="Въведете паролата отново"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <SubmitBtn />
      </form>
    </div>
  )
}
