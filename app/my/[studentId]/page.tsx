export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import StudentProfileParent from './StudentProfileParent'

interface Props {
  params: Promise<{ studentId: string }>
}

export default async function MyChildPage({ params }: Props) {
  const { studentId } = await params

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

  // Only fetch questions the moderator explicitly added to this class
  const { data: allClassQuestions } = await admin
    .from('questions')
    .select('id, text, order_index, allows_text, allows_media, type')
    .eq('class_id', student.class_id)
    .order('order_index')

  const personalQuestions = (allClassQuestions ?? []).filter(q => q.type === 'personal')
  const classVoiceQuestions = (allClassQuestions ?? []).filter(q => q.type === 'class_voice')
  const classQuestions = (allClassQuestions ?? []).filter(q =>
    ['superhero', 'better_together', 'video'].includes(q.type)
  )

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

  // Polls for this class
  const { data: polls } = await admin
    .from('class_polls')
    .select('id, question, order_index')
    .eq('class_id', student.class_id)
    .order('order_index')

  // This student's existing votes
  const { data: myVotes } = await admin
    .from('class_poll_votes')
    .select('poll_id, nominee_student_id')
    .eq('voter_student_id', studentId)

  const existingVotes: Record<string, string> = {}
  for (const v of myVotes ?? []) {
    existingVotes[v.poll_id] = v.nominee_student_id
  }

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
      polls={polls ?? []}
      existingVotes={existingVotes}
    />
  )
}
