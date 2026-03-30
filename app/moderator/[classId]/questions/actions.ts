'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { seedDefaultClass } from '@/lib/templates/defaultSeed'

export async function reseedDefaultQuestions(classId: string, preset = 'primary'): Promise<{ error: string | null }> {
  const admin = createServiceRoleClient()

  // Only seed if no custom questions exist yet
  const { count } = await admin
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)
    .eq('is_system', false)

  if (count && count > 0) return { error: null } // already seeded

  const { blocks, error } = await seedDefaultClass(classId, admin, preset)
  if (error) return { error }

  // Save the wired-up layout so the lexicon editor shows the default template
  await admin.from('classes').update({ layout: blocks }).eq('id', classId)

  revalidatePath(`/moderator/${classId}/questions`)
  revalidatePath(`/moderator/${classId}/layout`)
  return { error: null }
}

export async function createQuestion(
  classId: string,
  data: {
    text: string
    description?: string | null
    type: 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video' | 'photo' | 'survey'
    allows_text: boolean
    allows_media: boolean
    max_length: number | null
    order_index: number
    voice_display?: 'wordcloud' | 'barchart'
    poll_options?: string[] | null
  }
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase.from('questions').insert({
    class_id: classId,
    text: data.text,
    description: data.description ?? null,
    type: data.type,
    is_system: false,
    allows_text: data.allows_text,
    allows_media: data.allows_media,
    max_length: data.max_length,
    order_index: data.order_index,
    voice_display: data.type === 'survey' ? 'barchart' : (data.voice_display ?? 'wordcloud'),
    poll_options: data.poll_options ?? null,
  })

  if (error) {
    console.error('[createQuestion]', error.message)
    return { error: 'Грешка при създаване на въпроса.' }
  }

  await supabase.from('classes').update({ is_customized: true }).eq('id', classId)
  revalidatePath(`/moderator/${classId}/questions`)
  return { error: null }
}

export async function updateQuestion(
  classId: string,
  questionId: string,
  data: {
    text: string
    description?: string | null
    type: 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video' | 'photo' | 'survey'
    allows_text: boolean
    allows_media: boolean
    max_length: number | null
    order_index: number
    voice_display?: 'wordcloud' | 'barchart'
    poll_options?: string[] | null
  }
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('questions')
    .update({
      text: data.text,
      description: data.description ?? null,
      type: data.type,
      allows_text: data.allows_text,
      allows_media: data.allows_media,
      max_length: data.max_length,
      order_index: data.order_index,
      voice_display: data.type === 'survey' ? 'barchart' : (data.voice_display ?? 'wordcloud'),
      poll_options: data.poll_options ?? null,
    })
    .eq('id', questionId)
    .eq('class_id', classId) // safety: only update own questions

  if (error) {
    console.error('[updateQuestion]', error.message)
    return { error: error.message }
  }

  await supabase.from('classes').update({ is_customized: true }).eq('id', classId)
  revalidatePath(`/moderator/${classId}/questions`)
  return { error: null }
}

export async function deleteQuestion(
  classId: string,
  questionId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  // Delete dependent rows first (no ON DELETE CASCADE on question_id FK)
  await supabase.from('answers').delete().eq('question_id', questionId)
  await supabase.from('class_voice_answers').delete().eq('question_id', questionId)

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    .eq('class_id', classId)

  if (error) {
    console.error('[deleteQuestion]', error.message)
    return { error: 'Грешка при изтриване на въпроса.' }
  }

  await supabase.from('classes').update({ is_customized: true }).eq('id', classId)
  revalidatePath(`/moderator/${classId}/questions`)
  return { error: null }
}

export async function toggleFeaturedQuestion(
  classId: string,
  questionId: string,
  isFeatured: boolean
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('questions')
    .update({ is_featured: isFeatured })
    .eq('id', questionId)
    .eq('class_id', classId)

  if (error) {
    console.error('[toggleFeaturedQuestion]', error.message)
    return { error: 'Грешка при запазване.' }
  }

  revalidatePath(`/moderator/${classId}/questions`)
  return { error: null }
}

export async function bulkDeleteQuestions(
  classId: string,
  ids: string[]
): Promise<{ error: string | null }> {
  if (ids.length === 0) return { error: null }
  const supabase = createServiceRoleClient()

  await supabase.from('answers').delete().in('question_id', ids)
  await supabase.from('class_voice_answers').delete().in('question_id', ids)

  const { error } = await supabase
    .from('questions')
    .delete()
    .in('id', ids)
    .eq('class_id', classId)

  if (error) {
    console.error('[bulkDeleteQuestions]', error.message)
    return { error: 'Грешка при изтриване на въпросите.' }
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
