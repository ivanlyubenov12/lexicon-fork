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

  const { data: questions } = await admin
    .from('questions')
    .select('id, text, type, max_length, order_index')
    .eq('class_id', student.class_id)
    .in('type', ['video', 'personal', 'superhero'])
    .order('order_index')

  const questionIds = (questions ?? []).map(q => q.id)

  const { data: answers } = questionIds.length > 0
    ? await admin
        .from('answers')
        .select('question_id, text_content, media_url, status')
        .eq('student_id', studentId)
        .in('question_id', questionIds)
    : { data: [] }

  const answerMap = new Map(
    (answers ?? []).map(a => [a.question_id, { text: a.text_content ?? '', mediaUrl: a.media_url ?? null, status: a.status }])
  )

  const wizardQuestions = (questions ?? []).map(q => ({
    id: q.id,
    text: q.text,
    type: q.type as 'video' | 'personal' | 'superhero',
    maxLength: q.max_length ?? null,
    existingAnswer: answerMap.get(q.id)?.text ?? '',
    existingMediaUrl: answerMap.get(q.id)?.mediaUrl ?? null,
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
