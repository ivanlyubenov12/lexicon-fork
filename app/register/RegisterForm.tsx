'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { registerUser } from './actions'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Моля изчакайте...' : label}
    </button>
  )
}

export default function RegisterForm() {
  const router = useRouter()
  const [state, action] = useFormState(registerUser, { error: null, redirectTo: null })
  const [role, setRole] = useState<'moderator' | 'student' | null>(null)

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  return (
    <div className="space-y-6">
      {/* Role selector */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Вие сте:</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('moderator')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === 'moderator'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">school</span>
            <span className="text-sm font-semibold leading-tight text-center">Учител / Модератор</span>
            <span className="text-xs text-center opacity-70">Създавате лексикон за клас</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === 'student'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">family_restroom</span>
            <span className="text-sm font-semibold leading-tight text-center">Родител / Ученик</span>
            <span className="text-xs text-center opacity-70">Попълвате анкета за дете</span>
          </button>
        </div>
      </div>

      {/* Moderator registration form */}
      {role === 'moderator' && (
        <form action={action} className="space-y-4">
          <input type="hidden" name="role" value="moderator" />

          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
            <input
              id="email" name="email" type="email" required
              placeholder="your@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Задайте парола</label>
            <input
              id="password" name="password" type="password" required minLength={6}
              placeholder="Поне 6 символа"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-start gap-3">
            <input id="tos" name="tos" type="checkbox" required
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="tos" className="text-sm text-gray-600">
              Приемам{' '}
              <span className="text-indigo-600 underline">условията за ползване</span>
              {' '}и давам съгласие за обработка на лични данни на деца съгласно GDPR.
            </label>
          </div>

          <SubmitButton label="Създайте акаунт" />
        </form>
      )}

      {/* Student / parent info */}
      {role === 'student' && (
        <form action={action} className="space-y-4">
          <input type="hidden" name="role" value="student" />

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">info</span>
              Нужна е покана от учителя
            </p>
            <p className="text-xs leading-relaxed">
              Родителите и учениците обикновено влизат чрез личен линк от имейла на покана.
              Ако нямате линк, можете да се регистрирате тук и да въведете кода по-късно.
            </p>
          </div>

          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email-s" className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
            <input
              id="email-s" name="email" type="email" required
              placeholder="your@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password-s" className="block text-sm font-medium text-gray-700 mb-1">Задайте парола</label>
            <input
              id="password-s" name="password" type="password" required minLength={6}
              placeholder="Поне 6 символа"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <SubmitButton label="Регистрирайте се" />
        </form>
      )}

      <p className="text-center text-sm text-gray-500">
        Вече имате акаунт?{' '}
        <a href="/login" className="text-indigo-600 hover:underline">Влезте тук</a>
      </p>
    </div>
  )
}
