'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData): Promise<{ error: string | null }> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const email    = (formData.get('email') as string)?.trim()
  const fullName = (formData.get('full_name') as string)?.trim()

  const admin = createServiceRoleClient()

  const updates: Record<string, unknown> = {}
  if (fullName) updates.data = { full_name: fullName }

  if (email && email !== user.email) {
    const { error } = await admin.auth.admin.updateUserById(user.id, { email, user_metadata: { full_name: fullName } })
    if (error) return { error: error.message }
  } else if (fullName) {
    const { error } = await admin.auth.admin.updateUserById(user.id, { user_metadata: { full_name: fullName } })
    if (error) return { error: error.message }
  }

  revalidatePath('/moderator/profile')
  return { error: null }
}
