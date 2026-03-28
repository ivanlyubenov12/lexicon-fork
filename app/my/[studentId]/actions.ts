'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function submitClassVoiceAnswer(
  classId: string,
  questionId: string,
  content: string
): Promise<{ error: string | null }> {
  if (!content.trim()) return { error: 'Отговорът не може да е празен.' }

  const admin = createServiceRoleClient()
  const { error } = await admin
    .from('class_voice_answers')
    .insert({ class_id: classId, question_id: questionId, content: content.trim() })

  if (error) return { error: 'Изпращането не успя. Опитайте отново.' }
  return { error: null }
}

export async function updateStudentPhoto(
  studentId: string,
  photoUrl: string | null
): Promise<{ error: string | null }> {
  const admin = createServiceRoleClient()

  // Fetch class_id so we can revalidate the moderator students page
  const { data: student } = await admin
    .from('students')
    .select('class_id')
    .eq('id', studentId)
    .single()

  const { error } = await admin
    .from('students')
    .update({ photo_url: photoUrl })
    .eq('id', studentId)

  if (error) return { error: 'Снимката не се запази. Опитайте отново.' }

  await admin.from('students').update({ questionnaire_submitted: false }).eq('id', studentId)
  revalidatePath(`/my/${studentId}`)
  if (student?.class_id) {
    revalidatePath(`/moderator/${student.class_id}/students`)
  }
  return { error: null }
}

export async function submitMessage(
  authorStudentId: string,
  recipientStudentId: string,
  content: string
): Promise<{ error: string | null }> {
  if (!content.trim()) return { error: 'Посланието не може да е празно.' }

  const admin = createServiceRoleClient()

  // Check for existing pending message to this recipient
  const { data: existing } = await admin
    .from('peer_messages')
    .select('id, status')
    .eq('author_student_id', authorStudentId)
    .eq('recipient_student_id', recipientStudentId)
    .eq('status', 'pending')
    .single()

  let error
  if (existing) {
    // Update the pending message
    const { error: updateError } = await admin
      .from('peer_messages')
      .update({ content: content.trim() })
      .eq('id', existing.id)
    error = updateError
  } else {
    // Insert new message
    const { error: insertError } = await admin
      .from('peer_messages')
      .insert({
        author_student_id: authorStudentId,
        recipient_student_id: recipientStudentId,
        content: content.trim(),
        status: 'pending',
      })
    error = insertError
  }

  if (error) return { error: 'Изпращането не успя. Опитайте отново.' }

  await admin.from('students').update({ questionnaire_submitted: false }).eq('id', authorStudentId)
  revalidatePath(`/my/${authorStudentId}`)
  return { error: null }
}

interface ActionResult {
  error: string | null
}

export async function saveDraft(
  studentId: string,
  questionId: string,
  textContent: string
): Promise<ActionResult> {
  const admin = createServiceRoleClient()

  const [answersResult, flagResult] = await Promise.all([
    admin
      .from('answers')
      .upsert(
        {
          student_id: studentId,
          question_id: questionId,
          text_content: textContent,
          status: 'draft',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,question_id' }
      ),
    admin
      .from('students')
      .update({ questionnaire_submitted: false })
      .eq('id', studentId),
  ])

  if (answersResult.error) {
    return { error: 'Записването не успя.' }
  }

  // flagResult error is non-critical — ignore
  revalidatePath(`/my/${studentId}`)
  return { error: null }
}

export async function submitAllDrafts(studentId: string): Promise<ActionResult> {
  const admin = createServiceRoleClient()

  const [answersResult, flagResult] = await Promise.all([
    admin
      .from('answers')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('student_id', studentId)
      .eq('status', 'draft'),
    admin
      .from('students')
      .update({ questionnaire_submitted: true })
      .eq('id', studentId),
  ])

  if (answersResult.error || flagResult.error) return { error: 'Изпращането не успя. Опитайте отново.' }

  revalidatePath(`/my/${studentId}`)
  return { error: null }
}

export async function submitAnswer(
  studentId: string,
  questionId: string,
  data: {
    text_content?: string
    media_url?: string
    media_type?: 'video' | 'audio'
  }
): Promise<ActionResult> {
  const admin = createServiceRoleClient()

  const { error } = await admin
    .from('answers')
    .upsert(
      {
        student_id: studentId,
        question_id: questionId,
        ...data,
        status: 'submitted',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,question_id' }
    )

  if (error) {
    return { error: 'Изпращането не успя. Опитайте отново.' }
  }

  await admin.from('students').update({ questionnaire_submitted: false }).eq('id', studentId)
  revalidatePath(`/my/${studentId}`)

  return { error: null }
}
