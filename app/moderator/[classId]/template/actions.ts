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

  // Seed questions, polls and wired layout for chosen preset
  const { blocks, error } = await seedDefaultClass(classId, admin, preset)
  if (error) return { error }

  await admin
    .from('classes')
    .update({ layout: blocks, template_id: preset })
    .eq('id', classId)

  redirect(`/moderator/${classId}`)
}
