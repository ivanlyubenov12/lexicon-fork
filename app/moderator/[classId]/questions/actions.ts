'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function createQuestion(
  classId: string,
  data: {
    text: string
    type: 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video'
    allows_text: boolean
    allows_media: boolean
    max_length: number | null
    order_index: number
  }
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase.from('questions').insert({
    class_id: classId,
    text: data.text,
    type: data.type,
    is_system: false,
    allows_text: data.allows_text,
    allows_media: data.allows_media,
    max_length: data.max_length,
    order_index: data.order_index,
  })

  if (error) {
    console.error('[createQuestion]', error.message)
    return { error: 'Грешка при създаване на въпроса.' }
  }

  revalidatePath(`/moderator/${classId}/questions`)
  return { error: null }
}

export async function updateQuestion(
  classId: string,
  questionId: string,
  data: {
    text: string
    type: 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video'
    allows_text: boolean
    allows_media: boolean
    max_length: number | null
    order_index: number
  }
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('questions')
    .update({
      text: data.text,
      type: data.type,
      allows_text: data.allows_text,
      allows_media: data.allows_media,
      max_length: data.max_length,
      order_index: data.order_index,
    })
    .eq('id', questionId)
    .eq('class_id', classId) // safety: only update own questions

  if (error) {
    console.error('[updateQuestion]', error.message)
    return { error: 'Грешка при запазване на въпроса.' }
  }

  revalidatePath(`/moderator/${classId}/questions`)
  return { error: null }
}

export async function deleteQuestion(
  classId: string,
  questionId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    .eq('class_id', classId) // safety: only delete own questions

  if (error) {
    console.error('[deleteQuestion]', error.message)
    return { error: 'Грешка при изтриване на въпроса.' }
  }

  revalidatePath(`/moderator/${classId}/questions`)
  return { error: null }
}

export async function reorderQuestions(
  classId: string,
  updates: Array<{ id: string; order_index: number }>
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  for (const { id, order_index } of updates) {
    await supabase
      .from('questions')
      .update({ order_index })
      .eq('id', id)
      .eq('class_id', classId)
  }

  revalidatePath(`/moderator/${classId}/questions`)
  return { error: null }
}
