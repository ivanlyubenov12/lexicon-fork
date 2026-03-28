import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export default async function WizardPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: student } = await admin
    .from('students')
    .select('id, parent_user_id')
    .eq('id', studentId)
    .single()

  if (!student || student.parent_user_id !== user.id) redirect('/login')

  redirect(`/my/${studentId}`)
}
