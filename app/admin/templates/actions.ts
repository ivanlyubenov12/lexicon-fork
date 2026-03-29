'use server'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function updateTemplateDefault(
  preset: string,
  themeId: string,
  bgPattern: string,
  memberLabel?: string,
  groupLabel?: string,
  memoriesLabel?: string,
) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/login')

  const admin = createServiceRoleClient()
  await admin.from('template_defaults').upsert({
    preset_id: preset,
    theme_id: themeId,
    bg_pattern: bgPattern,
    ...(memberLabel !== undefined ? { member_label: memberLabel } : {}),
    ...(groupLabel !== undefined ? { group_label: groupLabel } : {}),
    ...(memoriesLabel !== undefined ? { memories_label: memoriesLabel } : {}),
  })

  redirect('/admin/templates')
}

export async function updateTemplateLabels(
  preset: string,
  memberLabel: string,
  groupLabel: string,
  memoriesLabel: string,
) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/login')

  const admin = createServiceRoleClient()
  await admin
    .from('template_defaults')
    .update({ member_label: memberLabel, group_label: groupLabel, memories_label: memoriesLabel })
    .eq('preset_id', preset)

  redirect('/admin/templates')
}
