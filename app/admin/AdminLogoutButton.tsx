'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function AdminLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-white/50 hover:text-red-500 transition-colors text-sm"
    >
      <span className="material-symbols-outlined text-xl">logout</span>
      Изход
    </button>
  )
}
