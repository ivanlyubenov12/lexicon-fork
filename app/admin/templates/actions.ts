'use server'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function updateTemplateDefault(preset: string, themeId: string, bgPattern: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/login')

  const admin = createServiceRoleClient()
  await admin
    .from('template_defaults')
    .upsert({ preset_id: preset, theme_id: themeId, bg_pattern: bgPattern })

  redirect('/admin/templates')
}
