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
    .select('id, first_name, last_name, photo_url, class_id, parent_user_id, questionnaire_submitted')
    .eq('id', studentId)
    .single()

  if (studentError || !student || student.parent_user_id !== user.id) {
    redirect('/login')
  }

  const { data: classData } = await admin
    .from('classes')
    .select('id, status, teacher_name, deadline, moderator_id')
    .eq('id', student.class_id)
    .single()

  let moderatorName: string | null = classData?.teacher_name ?? null
  if (classData?.moderator_id) {
    const { data: modUser } = await admin.auth.admin.getUserById(classData.moderator_id)
    const meta = modUser?.user?.user_metadata
    moderatorName = (meta?.full_name || meta?.name || null) as string | null
  }

  // Only fetch questions the moderator explicitly added to this class
  const { data: allClassQuestions } = await admin
    .from('questions')
    .select('id, text, order_index, allows_text, allows_media, type, poll_options, is_anonymous')
    .eq('class_id', student.class_id)
    .order('order_index')

  const personalQuestions = (allClassQuestions ?? []).filter(q => q.type === 'personal')
  const classVoiceQuestions = (allClassQuestions ?? []).filter(q => q.type === 'survey')
  const classQuestions = (allClassQuestions ?? []).filter(q =>
    ['superhero', 'better_together', 'video', 'photo'].includes(q.type)
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
    .order('sort_order', { ascending: true, nullsFirst: false })
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

  // All voice answers for this student (both anonymous and non-anonymous)
  const allVoiceIds = (allClassQuestions ?? [])
    .filter(q => q.type === 'survey')
    .map(q => q.id)
  const existingVoiceAnswers: Record<string, string> = {}
  if (allVoiceIds.length > 0) {
    const { data: voiceAnswers } = await admin
      .from('class_voice_answers')
      .select('question_id, content')
      .eq('student_id', studentId)
      .in('question_id', allVoiceIds)
    for (const a of voiceAnswers ?? []) {
      existingVoiceAnswers[a.question_id] = a.content
    }
  }

  // Events (memories) for this class
  const { data: eventsData } = await admin
    .from('events')
    .select('id, title, event_date, photos')
    .eq('class_id', student.class_id)
    .order('order_index')

  // This student's existing event comments
  const { data: myComments } = await admin
    .from('event_comments')
    .select('id, event_id, comment_text, created_at')
    .eq('student_id', studentId)

  const commentByEvent: Record<string, { id: string; comment_text: string; created_at: string }> = {}
  for (const c of myComments ?? []) {
    commentByEvent[c.event_id] = c
  }

  const events = (eventsData ?? []).map(e => ({
    ...e,
    photos: (e.photos as string[]) ?? [],
    myComment: commentByEvent[e.id] ?? null,
  }))

  return (
    <StudentProfileParent
      questionnaireSubmitted={
        (student.questionnaire_submitted ?? false) &&
        !(answers ?? []).some(a => a.status === 'draft')
      }
      student={student}
      personalQuestions={personalQuestions}
      classQuestions={classQuestions}
      classVoiceQuestions={classVoiceQuestions ?? []}
      answers={answers ?? []}
      classId={student.class_id}
      studentId={studentId}
      classmates={classmates ?? []}
      sentMessages={sentMessages ?? []}
      polls={polls ?? []}
      existingVotes={existingVotes}
      existingVoiceAnswers={existingVoiceAnswers}
      events={events}
      moderatorName={moderatorName}
      deadline={classData?.deadline ?? null}
    />
  )
}
