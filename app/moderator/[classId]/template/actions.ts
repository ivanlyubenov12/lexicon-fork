'use server'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { seedDefaultClass, type QuestionPreset } from '@/lib/templates/defaultSeed'

export async function applyTemplate(classId: string, preset: QuestionPreset) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  // Verify ownership
  const { data: cls } = await admin
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()
  if (!cls) redirect('/moderator')

  // Clear existing questions and polls (safe — no student answers yet at this wizard step)
  await Promise.all([
    admin.from('questions').delete().eq('class_id', classId).eq('is_system', false),
    admin.from('class_polls').delete().eq('class_id', classId),
  ])

  // Read default theme + bg_pattern for this preset
  const { data: templateDefault } = await admin
    .from('template_defaults')
    .select('theme_id, bg_pattern')
    .eq('preset_id', preset)
    .single()

  // Seed questions, polls and wired layout for chosen preset
  const { blocks } = await seedDefaultClass(classId, admin, preset)

  if (blocks.length > 0) {
    await admin
      .from('classes')
      .update({
        layout: blocks,
        template_id: preset,
        is_customized: false,
        ...(templateDefault ? {
          theme_id: templateDefault.theme_id,
          bg_pattern: templateDefault.bg_pattern,
        } : {}),
      })
      .eq('id', classId)
  }

  redirect(`/moderator/${classId}/lexicon?tab=template`)
}
