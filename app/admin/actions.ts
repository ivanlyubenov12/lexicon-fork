'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

// ── Guard ─────────────────────────────────────────────────────────────────────

async function assertAdmin() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) {
    throw new Error('Unauthorized')
  }
}

// ── Showcase ──────────────────────────────────────────────────────────────────

export async function setShowcaseOrder(
  classId: string,
  order: 1 | 2 | 3 | null
): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  // Clear the target slot if taken by another class
  if (order !== null) {
    await admin
      .from('classes')
      .update({ showcase_order: null })
      .eq('showcase_order', order)
      .neq('id', classId)
  }

  const { error } = await admin
    .from('classes')
    .update({ showcase_order: order })
    .eq('id', classId)

  if (error) return { error: 'Грешка при запазване.' }

  revalidatePath('/admin/classes')
  revalidatePath('/showcase')
  return { error: null }
}

// ── System questions ──────────────────────────────────────────────────────────

export async function updateSystemQuestion(
  id: string,
  text: string
): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  const { error } = await admin
    .from('questions')
    .update({ text })
    .eq('id', id)
    .is('class_id', null)

  if (error) return { error: 'Грешка при редакция.' }

  revalidatePath('/admin/questions')
  return { error: null }
}

export async function addSystemQuestion(data: {
  text: string
  type: 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video'
  order_index: number
}): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  const { error } = await admin.from('questions').insert({
    text: data.text,
    type: data.type,
    is_system: true,
    allows_text: data.type !== 'video',
    allows_media: data.type === 'video',
    order_index: data.order_index,
    class_id: null,
  })

  if (error) return { error: 'Грешка при добавяне.' }

  revalidatePath('/admin/questions')
  return { error: null }
}

export async function deleteSystemQuestion(id: string): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  const { error } = await admin
    .from('questions')
    .delete()
    .eq('id', id)
    .is('class_id', null)

  if (error) return { error: 'Грешка при изтриване.' }

  revalidatePath('/admin/questions')
  return { error: null }
}
