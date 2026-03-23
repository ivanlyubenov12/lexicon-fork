'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendParentInviteEmail, sendLexiconPublishedEmail } from '@/lib/resend'

export async function updateClassInfo(
  classId: string,
  data: { name: string; school_year: string; school_logo_url?: string }
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const update: Record<string, string> = { name: data.name, school_year: data.school_year }
  if (data.school_logo_url !== undefined) update.school_logo_url = data.school_logo_url

  const { error } = await supabase
    .from('classes')
    .update(update)
    .eq('id', classId)

  if (error) {
    return { error: 'Неуспешно запазване на класа. Опитайте отново.' }
  }

  return { error: null }
}

export async function addStudents(
  classId: string,
  students: Array<{ first_name: string; last_name: string; parent_email: string }>
): Promise<{ error: string | null; count: number }> {
  if (students.length === 0) {
    return { error: null, count: 0 }
  }

  const supabase = createServiceRoleClient()

  const rows = students.map((s) => ({
    class_id: classId,
    first_name: s.first_name,
    last_name: s.last_name,
    parent_email: s.parent_email,
  }))

  const { data, error } = await supabase.from('students').insert(rows).select('id')

  if (error) {
    return { error: 'Неуспешно добавяне на децата. Опитайте отново.', count: 0 }
  }

  return { error: null, count: data?.length ?? 0 }
}

export async function sendInvites(classId: string): Promise<{ error: string | null; sent: number }> {
  const supabase = createServiceRoleClient()

  // Fetch students who haven't accepted the invite yet
  const { data: students, error: fetchError } = await supabase
    .from('students')
    .select('id, first_name, last_name, parent_email, invite_token')
    .eq('class_id', classId)
    .is('invite_accepted_at', null)

  if (fetchError) {
    return { error: 'Грешка при зареждане на учениците.', sent: 0 }
  }

  if (!students || students.length === 0) {
    // No pending invites — still mark class as active
    await supabase.from('classes').update({ status: 'active' }).eq('id', classId)
    return { error: null, sent: 0 }
  }

  let sent = 0

  for (const student of students) {
    if (!student.parent_email) continue

    try {
      await sendParentInviteEmail(
        student.parent_email,
        `${student.first_name} ${student.last_name}`,
        student.invite_token
      )
      sent++
    } catch {
      // Continue sending to remaining parents even if one fails
    }
  }

  // Mark class as active now that invites have been sent
  await supabase.from('classes').update({ status: 'active' }).eq('id', classId)

  revalidatePath(`/moderator/${classId}/students`)
  revalidatePath(`/moderator/${classId}`)

  return { error: null, sent }
}

export async function sendAllInvites(classId: string): Promise<{ error: string | null; sent: number }> {
  return sendInvites(classId)
}

export async function saveSuperhero(
  classId: string,
  prompt: string,
  imageUrl: string
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('classes')
    .update({ superhero_prompt: prompt, superhero_image_url: imageUrl })
    .eq('id', classId)

  if (error) return { error: 'Записването не успя. Опитайте отново.' }
  revalidatePath(`/moderator/${classId}`)
  return { error: null }
}

export async function completeSetup(classId: string): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('classes')
    .update({ status: 'active' })
    .eq('id', classId)

  if (error) {
    return { error: 'Неуспешно финализиране на настройките.' }
  }

  return { error: null }
}

export async function publishClass(classId: string): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  // Fetch class name before publishing
  const { data: classData } = await supabase
    .from('classes')
    .select('name')
    .eq('id', classId)
    .single()

  const { error } = await supabase
    .from('classes')
    .update({ status: 'published', finalized_at: new Date().toISOString() })
    .eq('id', classId)

  if (error) {
    return { error: 'Неуспешно публикуване.' }
  }

  revalidatePath(`/moderator/${classId}`)
  revalidatePath(`/moderator/${classId}/finalize`)
  revalidatePath(`/lexicon/${classId}`)

  // Send published notification to all parents
  if (classData?.name) {
    const { data: students } = await supabase
      .from('students')
      .select('first_name, last_name, parent_email')
      .eq('class_id', classId)
      .not('parent_email', 'is', null)

    const recipients = (students ?? [])
      .filter((s) => s.parent_email)
      .map((s) => ({
        email: s.parent_email!,
        studentName: `${s.first_name} ${s.last_name}`,
      }))

    if (recipients.length > 0) {
      // Fire-and-forget — don't block the response on email delivery
      sendLexiconPublishedEmail(recipients, classId, classData.name).catch(() => {})
    }
  }

  return { error: null }
}

export async function addSingleStudent(
  classId: string,
  data: { first_name: string; last_name: string; parent_email: string }
): Promise<{ error: string | null; studentId: string | null }> {
  const supabase = createServiceRoleClient()

  const { data: inserted, error } = await supabase
    .from('students')
    .insert({
      class_id: classId,
      first_name: data.first_name,
      last_name: data.last_name,
      parent_email: data.parent_email,
    })
    .select('id')
    .single()

  if (error) {
    return { error: 'Неуспешно добавяне на детето. Опитайте отново.', studentId: null }
  }

  revalidatePath(`/moderator/${classId}/students`)

  return { error: null, studentId: inserted.id }
}

export async function bulkApproveAnswers(
  answerIds: string[],
  classId: string
): Promise<{ error: string | null }> {
  if (answerIds.length === 0) return { error: null }
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('answers')
    .update({ status: 'approved', moderator_note: null })
    .in('id', answerIds)

  if (error) {
    return { error: 'Неуспешно одобряване. Опитайте отново.' }
  }

  revalidatePath(`/moderator/${classId}/answers`)
  revalidatePath(`/moderator/${classId}`)
  return { error: null }
}

export async function approveAnswer(
  answerId: string,
  classId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  // Fetch student_id so we can revalidate the parent's page
  const { data: answer } = await supabase
    .from('answers')
    .select('student_id')
    .eq('id', answerId)
    .single()

  const { error } = await supabase
    .from('answers')
    .update({ status: 'approved', moderator_note: null })
    .eq('id', answerId)

  if (error) {
    return { error: 'Неуспешно одобряване на отговора. Опитайте отново.' }
  }

  revalidatePath(`/moderator/${classId}/answers`)
  revalidatePath(`/moderator/${classId}`)
  if (answer?.student_id) revalidatePath(`/my/${answer.student_id}`)

  return { error: null }
}

export async function returnAnswer(
  answerId: string,
  note: string,
  classId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { data: answer } = await supabase
    .from('answers')
    .select('student_id')
    .eq('id', answerId)
    .single()

  const { error } = await supabase
    .from('answers')
    .update({ status: 'draft', moderator_note: note || null })
    .eq('id', answerId)

  if (error) {
    return { error: 'Неуспешно връщане на отговора. Опитайте отново.' }
  }

  revalidatePath(`/moderator/${classId}/answers`)
  if (answer?.student_id) revalidatePath(`/my/${answer.student_id}`)

  return { error: null }
}

export async function approveMessage(
  messageId: string,
  classId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('peer_messages')
    .update({ status: 'approved' })
    .eq('id', messageId)

  if (error) {
    return { error: 'Неуспешно одобряване на посланието. Опитайте отново.' }
  }

  revalidatePath(`/moderator/${classId}/messages`)
  revalidatePath(`/moderator/${classId}`)

  return { error: null }
}

export async function rejectMessage(
  messageId: string,
  classId: string
): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('peer_messages')
    .update({ status: 'rejected' })
    .eq('id', messageId)

  if (error) {
    return { error: 'Неуспешно отхвърляне на посланието. Опитайте отново.' }
  }

  revalidatePath(`/moderator/${classId}/messages`)
  revalidatePath(`/moderator/${classId}`)

  return { error: null }
}

export async function resendInvite(studentId: string): Promise<{ error: string | null }> {
  const supabase = createServiceRoleClient()

  const { data: student, error: fetchError } = await supabase
    .from('students')
    .select('id, first_name, last_name, parent_email, invite_token')
    .eq('id', studentId)
    .single()

  if (fetchError || !student) {
    return { error: 'Ученикът не е намерен.' }
  }

  if (!student.parent_email) {
    return { error: 'Няма имейл на родителя.' }
  }

  try {
    await sendParentInviteEmail(
      student.parent_email,
      `${student.first_name} ${student.last_name}`,
      student.invite_token
    )
  } catch {
    return { error: 'Грешка при изпращане на имейла. Опитайте отново.' }
  }

  return { error: null }
}
