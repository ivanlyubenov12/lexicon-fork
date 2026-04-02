export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { buildSeq, seqUrl } from '../../sequence'
import VoiceAnswerPage from './VoiceAnswerPage'

export default async function VoiceAnswerRoute({
  params,
}: {
  params: Promise<{ studentId: string; questionId: string }>
}) {
  const { studentId, questionId } = await params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()

  const { data: student } = await admin
    .from('students')
    .select('id, class_id, parent_user_id')
    .eq('id', studentId)
    .single()
  if (!student || student.parent_user_id !== user.id) redirect('/login')

  const { data: question } = await admin
    .from('questions')
    .select('id, text, description, type, poll_options, is_anonymous, max_length')
    .eq('id', questionId)
    .single()
  if (!question || (question.type !== 'class_voice' && question.type !== 'survey')) {
    redirect(`/my/${studentId}`)
  }

  const [{ data: allQs }, { data: allPolls }] = await Promise.all([
    admin.from('questions')
      .select('id, text, type, order_index, is_anonymous')
      .eq('class_id', student.class_id)
      .order('order_index'),
    admin.from('class_polls')
      .select('id, question, order_index')
      .eq('class_id', student.class_id)
      .order('order_index'),
  ])

  const seq = buildSeq(allQs ?? [], allPolls ?? [])
  const idx = seq.findIndex(item => item.id === questionId && item.kind === 'voice')

  const prevUrl = idx > 0 ? seqUrl(seq[idx - 1], studentId) : null
  const nextUrl = idx < seq.length - 1 ? seqUrl(seq[idx + 1], studentId) : null

  // Always fetch existing answer by student_id (anonymous = display only, not DB)
  const { data: va } = await admin
    .from('class_voice_answers')
    .select('content')
    .eq('question_id', questionId)
    .eq('student_id', studentId)
    .maybeSingle()
  const existingAnswer: string | null = va?.content ?? null

  // Fetch classmates if this is a student-picker survey
  let classmates: Array<{ id: string; first_name: string; last_name: string; photo_url: string | null }> = []
  const isStudentPoll = question.type === 'survey' && (question.poll_options as string[] | null)?.[0] === '__students__'
  if (isStudentPoll) {
    const { data: cls } = await admin
      .from('students')
      .select('id, first_name, last_name, photo_url')
      .eq('class_id', student.class_id)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('last_name')
    classmates = (cls ?? []).filter(c => c.id !== studentId)
  }

  return (
    <VoiceAnswerPage
      studentId={studentId}
      classId={student.class_id}
      question={question}
      existingAnswer={existingAnswer}
      prevUrl={prevUrl}
      nextUrl={nextUrl}
      questionNumber={idx + 1}
      totalQuestions={seq.length}
      classmates={classmates}
    />
  )
}
