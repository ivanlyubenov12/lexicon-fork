export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import StudentProfileParent from './StudentProfileParent'

interface Props {
  params: { studentId: string }
}

export default async function MyChildPage({ params }: Props) {
  const { studentId } = params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: student, error: studentError } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url, class_id, parent_user_id')
    .eq('id', studentId)
    .single()

  if (studentError || !student || student.parent_user_id !== user.id) {
    redirect('/login')
  }

  const { data: classData } = await admin
    .from('classes')
    .select('id, status')
    .eq('id', student.class_id)
    .single()

  // Personal questions (tab 1)
  const { data: systemPersonal } = await admin
    .from('questions')
    .select('id, text, order_index, allows_text, allows_media, type')
    .is('class_id', null)
    .eq('type', 'personal')
    .order('order_index')

  const { data: classPersonal } = await admin
    .from('questions')
    .select('id, text, order_index, allows_text, allows_media, type')
    .eq('class_id', student.class_id)
    .eq('type', 'personal')
    .order('order_index')

  const personalQuestions = [
    ...(systemPersonal ?? []),
    ...(classPersonal ?? []),
  ].sort((a, b) => a.order_index - b.order_index)

  // Class voice questions — anonymous (tab 3, bottom section)
  const { data: classVoiceQuestions } = await admin
    .from('questions')
    .select('id, text, order_index')
    .is('class_id', null)
    .eq('type', 'class_voice')
    .order('order_index')

  // Class questions — superhero + better_together (tab 3)
  const { data: systemClass } = await admin
    .from('questions')
    .select('id, text, order_index, allows_text, allows_media, type')
    .is('class_id', null)
    .in('type', ['superhero', 'better_together'])
    .order('order_index')

  const { data: classSpecificClass } = await admin
    .from('questions')
    .select('id, text, order_index, allows_text, allows_media, type')
    .eq('class_id', student.class_id)
    .in('type', ['superhero', 'better_together'])
    .order('order_index')

  const classQuestions = [
    ...(systemClass ?? []),
    ...(classSpecificClass ?? []),
  ].sort((a, b) => a.order_index - b.order_index)

  // All answers for this student
  const { data: answers } = await admin
    .from('answers')
    .select('question_id, status')
    .eq('student_id', studentId)

  // Classmates (tab 2)
  const { data: classmates } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', student.class_id)
    .neq('id', studentId)
    .order('last_name')

  // Sent messages (tab 2)
  const { data: sentMessages } = await admin
    .from('peer_messages')
    .select('recipient_student_id, status, content')
    .eq('author_student_id', studentId)

  return (
    <StudentProfileParent
      student={student}
      personalQuestions={personalQuestions}
      classQuestions={classQuestions}
      classVoiceQuestions={classVoiceQuestions ?? []}
      answers={answers ?? []}
      classStatus={classData?.status ?? 'draft'}
      classId={student.class_id}
      classmates={classmates ?? []}
      sentMessages={sentMessages ?? []}
    />
  )
}
