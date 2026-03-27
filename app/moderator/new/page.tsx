import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import CreateClassForm from './CreateClassForm'

export default async function NewClassPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const existingName = (user.user_metadata?.full_name || user.user_metadata?.name || '') as string

  return (
    <div
      className="min-h-screen bg-[#faf9f8] px-6 py-12"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <Link
          href="/moderator"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Нов лексикон
          </p>
          <h1
            className="text-3xl font-bold text-gray-900 leading-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Създай клас
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Само паралелката и училището са задължителни — всичко останало може да добавите по-късно.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <CreateClassForm defaultModeratorName={existingName} />
        </div>
      </div>
    </div>
  )
}
