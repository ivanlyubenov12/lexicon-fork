'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function createEvent(
  classId: string,
  data: { title: string; event_date: string | null; note: string | null; order_index: number }
): Promise<{ error: string | null; id: string | null }> {
  const supabase = createServiceRoleClient()

  const { data: inserted, error } = await supabase.from('events').insert({
    class_id: classId,
    title: data.title,
    event_date: data.event_date || null,
    note: data.note || null,
    order_index: data.order_index,
    photos: [],
  }).select('id').single()

  if (error) {
    console.error('[createEvent]', error.message)
    return { error: 'Грешка при създаване на събитието.', id: null }
  }

  revalidatePath(`/moderator/${classId}/events`)
  return { error: null, id: inserted.id }
}

export async function updateEvent(
  classId: string,
  eventId: string,
  data: { title: string; event_date: string | null; note: string | null; photos?: string[] }
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const update: Record<string, unknown> = {
    title: data.title,
    event_date: data.event_date || null,
    note: data.note || null,
  }
  if (data.photos !== undefined) update.photos = data.photos

  const { error } = await supabase
    .from('events')
    .update(update)
    .eq('id', eventId)
    .eq('class_id', classId)

  if (error) {
    console.error('[updateEvent]', error.message)
    return { error: 'Грешка при запазване.' }
  }

  revalidatePath(`/moderator/${classId}/events`)
  return { error: null }
}

export async function reorderEvents(
  classId: string,
  updates: Array<{ id: string; order_index: number }>
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()
  for (const { id, order_index } of updates) {
    await supabase.from('events').update({ order_index }).eq('id', id).eq('class_id', classId)
  }
  revalidatePath(`/moderator/${classId}/events`)
  return { error: null }
}

export async function deleteEvent(
  classId: string,
  eventId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('class_id', classId)

  if (error) {
    console.error('[deleteEvent]', error.message)
    return { error: 'Грешка при изтриване.' }
  }

  revalidatePath(`/moderator/${classId}/events`)
  return { error: null }
}
