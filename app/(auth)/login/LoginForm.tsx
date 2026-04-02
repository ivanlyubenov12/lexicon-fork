'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginModerator } from './actions'

function SubmitButton({ frozen }: { frozen: boolean }) {
  const { pending } = useFormStatus()
  const loading = pending || frozen
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Влизане...' : 'Влез'}
    </button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(loginModerator, { error: null, redirectTo: null })
  const [frozen, setFrozen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (state.redirectTo) {
      setFrozen(true)
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  return (
    <form action={formAction} className="space-y-4">
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
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={frozen}
          placeholder="вашия@имейл.com"
          className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full disabled:opacity-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Парола
          </label>
          <a href="/forgot-password" className="text-xs text-indigo-500 hover:underline">
            Забравена парола?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={frozen}
          placeholder="Вашата парола"
          className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full disabled:opacity-50"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          defaultChecked
          disabled={frozen}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
          Запомни ме
        </label>
      </div>

      <SubmitButton frozen={frozen} />

      <p className="text-center text-sm text-gray-500">
        Нямате акаунт?{' '}
        <a href="/register" className="text-indigo-600 hover:underline">
          Регистрирайте се
        </a>
      </p>
    </form>
  )
}
