'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reorderStudents(
  classId: string,
  orderedIds: string[],
): Promise<{ error: string | null }> {
  const admin = createServiceRoleClient()
  const updates = orderedIds.map((id, i) =>
    admin.from('students').update({ sort_order: i + 1 }).eq('id', id).eq('class_id', classId)
  )
  const results = await Promise.all(updates)
  const err = results.find(r => r.error)
  if (err?.error) return { error: err.error.message }
  revalidatePath(`/moderator/${classId}/students`)
  revalidatePath(`/lexicon/${classId}`)
  revalidatePath(`/lexicon/${classId}/students`)
  return { error: null }
}

export async function deleteStudents(
  classId: string,
  studentIds: string[],
): Promise<{ error: string | null }> {
  if (studentIds.length === 0) return { error: null }
  const admin = createServiceRoleClient()

  // Students cascade → answers, peer_messages, class_poll_votes, event_comments
  const { error } = await admin
    .from('students')
    .delete()
    .in('id', studentIds)
    .eq('class_id', classId) // safety: only delete students belonging to this class

  if (error) return { error: error.message }
  revalidatePath(`/moderator/${classId}/students`)
  return { error: null }
}
