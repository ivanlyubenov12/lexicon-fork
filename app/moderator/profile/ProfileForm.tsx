'use client'

import { useActionState } from 'react'
import { updateProfile } from './actions'

interface Props {
  email: string
  fullName: string
}

export default function ProfileForm({ email, fullName }: Props) {
  const [state, action, isPending] = useActionState(
    async (_prev: { error: string | null; success: boolean }, formData: FormData) => {
      const res = await updateProfile(formData)
      return { ...res, success: !res.error }
    },
    { error: null, success: false }
  )

  return (
    <form action={action} className="space-y-4 max-w-md">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{state.error}</div>
      )}
      {state.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">Профилът е обновен.</div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Имена</label>
        <input
          name="full_name"
          type="text"
          defaultValue={fullName}
          placeholder="Иван Иванов"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Имейл</label>
        <input
          name="email"
          type="email"
          defaultValue={email}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <p className="text-xs text-gray-400 mt-1.5">При смяна на имейл ще получиш потвърждение.</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-indigo-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Запазване...' : 'Запази промените'}
      </button>
    </form>
  )
}
