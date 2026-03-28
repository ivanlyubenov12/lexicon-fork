'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPoll(classId: string, question: string, orderIndex: number) {
  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from('class_polls')
    .insert({ class_id: classId, question, order_index: orderIndex })
    .select('id')
    .single()
  revalidatePath(`/moderator/${classId}/polls`)
  return { error: error?.message ?? null, id: data?.id ?? null }
}

export async function deletePoll(classId: string, pollId: string) {
  const admin = createServiceRoleClient()
  const { error } = await admin
    .from('class_polls')
    .delete()
    .eq('id', pollId)
    .eq('class_id', classId)
  revalidatePath(`/moderator/${classId}/polls`)
  return { error: error?.message ?? null }
}

export async function reorderPolls(classId: string, orderedIds: string[]) {
  const admin = createServiceRoleClient()
  await Promise.all(
    orderedIds.map((id, i) =>
      admin
        .from('class_polls')
        .update({ order_index: i + 1 })
        .eq('id', id)
        .eq('class_id', classId)
    )
  )
  revalidatePath(`/moderator/${classId}/polls`)
  return { error: null }
}
