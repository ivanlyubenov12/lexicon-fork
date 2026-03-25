export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import WizardClient from './WizardClient'

export default async function WizardPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: student } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url, class_id, parent_user_id')
    .eq('id', studentId)
    .single()

  if (!student || student.parent_user_id !== user.id) redirect('/login')

  // Only personal questions go in the wizard
  const { data: questions } = await admin
    .from('questions')
    .select('id, text, max_length, order_index')
    .eq('class_id', student.class_id)
    .eq('type', 'personal')
    .order('order_index')

  const questionIds = (questions ?? []).map(q => q.id)

  const { data: answers } = questionIds.length > 0
    ? await admin
        .from('answers')
        .select('question_id, text_content, status')
        .eq('student_id', studentId)
        .in('question_id', questionIds)
    : { data: [] }

  const answerMap = new Map(
    (answers ?? []).map(a => [a.question_id, { text: a.text_content ?? '', status: a.status }])
  )

  const wizardQuestions = (questions ?? []).map(q => ({
    id: q.id,
    text: q.text,
    maxLength: q.max_length ?? null,
    existingAnswer: answerMap.get(q.id)?.text ?? '',
    existingStatus: answerMap.get(q.id)?.status ?? null,
  }))

  return (
    <WizardClient
      studentId={student.id}
      firstName={student.first_name}
      lastName={student.last_name}
      photoUrl={student.photo_url ?? null}
      questions={wizardQuestions}
    />
  )
}
