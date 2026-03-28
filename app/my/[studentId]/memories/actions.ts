'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function addEventComment(
  eventId: string,
  studentId: string,
  commentText: string
): Promise<{ error: string | null }> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в профила си.' }

  const admin = createServiceRoleClient()

  // Verify this student belongs to the logged-in parent
  const { data: student } = await admin
    .from('students')
    .select('id, class_id')
    .eq('id', studentId)
    .eq('parent_user_id', user.id)
    .single()

  if (!student) return { error: 'Нямате право да коментирате.' }

  const text = commentText.trim()
  if (!text) return { error: 'Коментарът не може да е празен.' }
  if (text.length > 300) return { error: 'Коментарът е прекалено дълъг (макс. 300 знака).' }

  const { error } = await admin.from('event_comments').insert({
    event_id: eventId,
    student_id: studentId,
    comment_text: text,
  })

  if (error) {
    console.error('[addEventComment]', error.message)
    return { error: 'Грешка при запазване на коментара.' }
  }

  await admin.from('students').update({ questionnaire_submitted: false }).eq('id', studentId)
  revalidatePath(`/my/${studentId}`)
  revalidatePath(`/lexicon/${student.class_id}/memories`)
  return { error: null }
}

export async function deleteEventComment(
  commentId: string,
  studentId: string
): Promise<{ error: string | null }> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Не сте влезли в профила си.' }

  const admin = createServiceRoleClient()

  // Verify ownership
  const { data: student } = await admin
    .from('students')
    .select('id, class_id')
    .eq('id', studentId)
    .eq('parent_user_id', user.id)
    .single()

  if (!student) return { error: 'Нямате право.' }

  const { error } = await admin
    .from('event_comments')
    .delete()
    .eq('id', commentId)
    .eq('student_id', studentId)

  if (error) return { error: 'Грешка при изтриване.' }

  await admin.from('students').update({ questionnaire_submitted: false }).eq('id', studentId)
  revalidatePath(`/my/${studentId}`)
  revalidatePath(`/lexicon/${student.class_id}/memories`)
  return { error: null }
}
