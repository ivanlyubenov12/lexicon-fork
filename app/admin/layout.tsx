import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[admin] user email:', user?.email)
  console.log('[admin] ADMIN_EMAIL:', process.env.ADMIN_EMAIL)

  if (!user) redirect('/login')

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || user.email !== adminEmail) redirect('/')

  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
  const rawDate = process.env.VERCEL_GIT_COMMIT_DATE
  const builtAt = rawDate
    ? new Date(rawDate).toLocaleString('bg-BG', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Europe/Sofia',
      })
    : undefined

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <AdminSidebar commit={commit} builtAt={builtAt} />
      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">
        {children}
      </main>
    </div>
  )
}
