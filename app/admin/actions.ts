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

// ── Publish / Unpublish ───────────────────────────────────────────────────────

export async function adminUnpublishClass(classId: string): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()
  const { error } = await admin
    .from('classes')
    .update({ status: 'filling', finalized_at: null })
    .eq('id', classId)
  if (error) return { error: 'Грешка при запазване.' }
  revalidatePath('/admin/classes')
  revalidatePath(`/lexicon/${classId}`)
  return { error: null }
}

export async function adminPublishClass(classId: string): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()
  const { error } = await admin
    .from('classes')
    .update({ status: 'published', finalized_at: new Date().toISOString() })
    .eq('id', classId)
  if (error) return { error: 'Грешка при запазване.' }
  revalidatePath('/admin/classes')
  revalidatePath(`/lexicon/${classId}`)
  return { error: null }
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

// ── Delete class ─────────────────────────────────────────────────────────────

export async function adminDeleteClass(classId: string): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  // Delete in dependency order (cascade may not be set up)
  const { data: students } = await admin.from('students').select('id').eq('class_id', classId)
  const studentIds = (students ?? []).map(s => s.id)

  if (studentIds.length > 0) {
    await admin.from('answers').delete().in('student_id', studentIds)
    await admin.from('peer_messages').delete().in('author_student_id', studentIds)
    await admin.from('peer_messages').delete().in('recipient_student_id', studentIds)
    await admin.from('students').delete().in('id', studentIds)
  }

  await admin.from('questions').delete().eq('class_id', classId)
  await admin.from('events').delete().eq('class_id', classId)
  await admin.from('class_voice_answers').delete().eq('class_id', classId)

  const { data: polls } = await admin.from('class_polls').select('id').eq('class_id', classId)
  const pollIds = (polls ?? []).map(p => p.id)
  if (pollIds.length > 0) await admin.from('class_poll_votes').delete().in('poll_id', pollIds)
  await admin.from('class_polls').delete().eq('class_id', classId)

  const { error } = await admin.from('classes').delete().eq('id', classId)
  if (error) return { error: 'Грешка при изтриване на класа.' }

  revalidatePath('/admin/classes')
  revalidatePath('/admin/moderators')
  return { error: null }
}

// ── Delete moderator ──────────────────────────────────────────────────────────

export async function adminDeleteModerator(userId: string): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  // Delete all classes owned by this user
  const { data: classes } = await admin.from('classes').select('id').eq('moderator_id', userId)
  for (const cls of classes ?? []) {
    const result = await adminDeleteClass(cls.id)
    if (result.error) return result
  }

  // Delete the auth user
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: 'Грешка при изтриване на потребителя.' }

  revalidatePath('/admin/moderators')
  return { error: null }
}

export async function adminDeleteModerators(userIds: string[]): Promise<{ error: string | null }> {
  for (const id of userIds) {
    const result = await adminDeleteModerator(id)
    if (result.error) return result
  }
  return { error: null }
}

export async function adminUpdateUserName(userId: string, fullName: string): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { full_name: fullName.trim() || null },
  })
  revalidatePath('/admin/moderators')
  return { error: error?.message ?? null }
}

// ── System questions ──────────────────────────────────────────────────────────

// ── Archive system questions ───────────────────────────────────────────────────

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

// ── Preset questionnaire questions ─────────────────────────────────────────────

type QuestionType = 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video'

export async function updatePresetQuestion(
  id: string,
  data: {
    text: string
    description: string | null
    type: QuestionType
    voice_display: 'wordcloud' | 'barchart' | null
    is_featured: boolean
  }
): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  const { error } = await admin
    .from('questions')
    .update({
      text: data.text,
      description: data.description,
      type: data.type,
      allows_text: data.type !== 'video',
      allows_media: data.type === 'video',
      voice_display: data.voice_display,
      is_featured: data.is_featured,
    })
    .eq('id', id)
    .eq('is_system', true)
    .is('class_id', null)

  if (error) return { error: 'Грешка при редакция.' }

  revalidatePath('/admin/questions')
  return { error: null }
}

export async function addPresetQuestion(data: {
  preset: string
  text: string
  description: string | null
  type: QuestionType
  voice_display: 'wordcloud' | 'barchart' | null
  is_featured: boolean
  order_index: number
}): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  const { error } = await admin.from('questions').insert({
    text: data.text,
    description: data.description,
    type: data.type,
    is_system: true,
    preset: data.preset,
    allows_text: data.type !== 'video',
    allows_media: data.type === 'video',
    voice_display: data.voice_display,
    is_featured: data.is_featured,
    order_index: data.order_index,
    class_id: null,
  })

  if (error) return { error: 'Грешка при добавяне.' }

  revalidatePath('/admin/questions')
  return { error: null }
}

export async function reorderPresetQuestions(
  updates: Array<{ id: string; order_index: number }>
): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  for (const { id, order_index } of updates) {
    await admin.from('questions').update({ order_index }).eq('id', id).eq('is_system', true)
  }

  revalidatePath('/admin/questions')
  return { error: null }
}

export async function deletePresetQuestion(id: string): Promise<{ error: string | null }> {
  await assertAdmin()
  const admin = createServiceRoleClient()

  const { error } = await admin
    .from('questions')
    .delete()
    .eq('id', id)
    .eq('is_system', true)
    .is('class_id', null)

  if (error) return { error: 'Грешка при изтриване.' }

  revalidatePath('/admin/questions')
  return { error: null }
}
