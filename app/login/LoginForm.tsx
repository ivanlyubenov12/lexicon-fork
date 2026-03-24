'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginModerator } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Влизане...' : 'Влез'}
    </button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, action] = useActionState(loginModerator, { error: null, redirectTo: null })

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo)
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
          className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
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
          placeholder="Вашата парола"
          className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
        />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-gray-500">
        Нямате акаунт?{' '}
        <a href="/register" className="text-indigo-600 hover:underline">
          Регистрирайте се
        </a>
      </p>
    </form>
  )
}
