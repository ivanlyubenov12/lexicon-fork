'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { Block, PageId } from '@/lib/templates/types'

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

export async function savePageLayout(
  classId: string,
  pageId: PageId,
  blocks: Block[],
  templateId?: string,
): Promise<{ error: string | null }> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в системата.' }

  const admin = createServiceRoleClient()
  const { data: cls } = await admin
    .from('classes')
    .select('id, page_layouts')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()
  if (!cls) return { error: 'Нямате достъп до този клас.' }

  const currentLayouts = (cls.page_layouts as Record<string, unknown>) ?? {}
  const updatedLayouts = { ...currentLayouts, [pageId]: blocks }

  const update: Record<string, unknown> = { page_layouts: updatedLayouts }
  if (pageId === 'group') update.layout = blocks  // backward compat
  if (templateId !== undefined) update.template_id = templateId
  if (pageId === 'group') update.is_customized = true

  const { error } = await admin.from('classes').update(update).eq('id', classId)
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
