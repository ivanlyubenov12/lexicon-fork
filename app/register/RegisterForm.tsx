'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { registerModerator } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Моля изчакайте...' : 'Създай акаунт'}
    </button>
  )
}

export default function RegisterForm() {
  const router = useRouter()
  const [state, action] = useFormState(registerModerator, { error: null, redirectTo: null })

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Имейл
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="вашия@имейл.com"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Парола
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Поне 6 символа"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="tos"
          name="tos"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
        <label htmlFor="tos" className="text-sm text-gray-600">
          Приемам{' '}
          <span className="text-indigo-600 underline">условията за ползване</span>
          {' '}и давам съгласие за обработка на лични данни на деца съгласно GDPR.
        </label>
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-gray-500">
        Вече имате акаунт?{' '}
        <a href="/login" className="text-indigo-600 hover:underline">
          Влезте тук
        </a>
      </p>
    </form>
  )
}
