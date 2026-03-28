'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function castVote(
  pollId: string,
  voterStudentId: string,
  nomineeStudentId: string
) {
  // Verify the current user owns the voter student
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в профила си.' }

  const admin = createServiceRoleClient()
  const { data: student } = await admin
    .from('students')
    .select('parent_user_id')
    .eq('id', voterStudentId)
    .single()

  if (!student || student.parent_user_id !== user.id) {
    return { error: 'Нямате права за това действие.' }
  }

  // Cannot vote for yourself
  if (voterStudentId === nomineeStudentId) {
    return { error: 'Не можете да гласувате за себе си.' }
  }

  // Upsert — updates existing vote if already cast
  const { error } = await admin
    .from('class_poll_votes')
    .upsert(
      { poll_id: pollId, voter_student_id: voterStudentId, nominee_student_id: nomineeStudentId },
      { onConflict: 'poll_id,voter_student_id' }
    )

  await admin.from('students').update({ questionnaire_submitted: false }).eq('id', voterStudentId)
  revalidatePath(`/my/${voterStudentId}`)
  return { error: error?.message ?? null }
}

export async function removeVote(pollId: string, voterStudentId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в профила си.' }

  const admin = createServiceRoleClient()
  const { data: student } = await admin
    .from('students')
    .select('parent_user_id')
    .eq('id', voterStudentId)
    .single()

  if (!student || student.parent_user_id !== user.id) {
    return { error: 'Нямате права за това действие.' }
  }

  const { error } = await admin
    .from('class_poll_votes')
    .delete()
    .eq('poll_id', pollId)
    .eq('voter_student_id', voterStudentId)

  await admin.from('students').update({ questionnaire_submitted: false }).eq('id', voterStudentId)
  revalidatePath(`/my/${voterStudentId}`)
  return { error: error?.message ?? null }
}
