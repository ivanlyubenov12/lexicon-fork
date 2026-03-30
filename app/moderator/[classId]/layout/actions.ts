'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Block } from '@/lib/templates/types'

export async function saveLayout(
  classId: string,
  blocks: Block[],
  templateId?: string,
): Promise<{ error: string | null }> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в системата.' }

  const admin = createServiceRoleClient()

  // Verify ownership
  const { data: cls } = await admin
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!cls) return { error: 'Нямате достъп до този клас.' }

  const update: Record<string, unknown> = { layout: blocks, is_customized: true }
  if (templateId !== undefined) update.template_id = templateId

  const { error } = await admin
    .from('classes')
    .update(update)
    .eq('id', classId)

  return { error: error?.message ?? null }
}

export async function updateCoverImage(
  classId: string,
  coverImageUrl: string,
): Promise<{ error: string | null }> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в системата.' }

  const admin = createServiceRoleClient()
  const { data: cls } = await admin
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!cls) return { error: 'Нямате достъп до този клас.' }

  const { error } = await admin
    .from('classes')
    .update({ cover_image_url: coverImageUrl })
    .eq('id', classId)

  return { error: error?.message ?? null }
}
