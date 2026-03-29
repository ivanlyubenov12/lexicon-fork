'use server'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTheme(classId: string, themeId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: cls } = await admin
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()
  if (!cls) redirect('/moderator')

  await admin
    .from('classes')
    .update({ theme_id: themeId })
    .eq('id', classId)

  revalidatePath(`/moderator/${classId}/lexicon`)
  revalidatePath(`/lexicon/${classId}`)
}
