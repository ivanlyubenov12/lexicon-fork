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
    .select('id, template_id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()
  if (!cls) redirect('/moderator')

  // If the chosen theme matches the template's natural theme, clear it (revert to default)
  const effectiveThemeId = themeId === (cls as any).template_id ? null : themeId

  await admin
    .from('classes')
    .update({ theme_id: effectiveThemeId, is_customized: true })
    .eq('id', classId)

  revalidatePath(`/moderator/${classId}/lexicon`)
  revalidatePath(`/lexicon/${classId}`)
}

export async function updateLabels(classId: string, data: {
  member_label?: string
  group_label?: string
  memories_label?: string
  stars_label?: string
}) {
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
    .update({ ...data, is_customized: true })
    .eq('id', classId)

  revalidatePath(`/moderator/${classId}/lexicon`)
  revalidatePath(`/lexicon/${classId}`)
}
