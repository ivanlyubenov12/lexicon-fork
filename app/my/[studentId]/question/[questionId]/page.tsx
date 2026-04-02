import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { buildSeq, seqUrl } from '../../sequence'
import AnswerForm from './AnswerForm'

interface Props {
  params: Promise<{ studentId: string; questionId: string }>
}

export default async function AnswerQuestionPage({ params }: Props) {
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
    .select('id, text, description, type, order_index, max_length, allows_text')
    .eq('id', questionId)
    .single()
  if (!question) redirect(`/my/${studentId}`)

  const { data: answer } = await admin
    .from('answers')
    .select('id, text_content, media_url, media_type, status, moderator_note')
    .eq('student_id', studentId)
    .eq('question_id', questionId)
    .single()

  // Build global sequence for cross-type navigation
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
  const idx = seq.findIndex(item => item.id === questionId && item.kind === 'question')

  const prevUrl = idx > 0 ? seqUrl(seq[idx - 1], studentId) : null

  // Fetch all answered question/poll ids for this student
  const [{ data: answeredQs }, { data: answeredPolls }] = await Promise.all([
    admin.from('answers')
      .select('question_id, status')
      .eq('student_id', studentId)
      .in('status', ['submitted', 'approved']),
    admin.from('class_poll_votes')
      .select('poll_id')
      .eq('student_id', studentId),
  ])
  const answeredQIds = new Set((answeredQs ?? []).map(a => a.question_id))
  const answeredPollIds = new Set((answeredPolls ?? []).map(v => v.poll_id))

  // Next unanswered item after current position (skip already submitted/approved)
  const nextUnanswered = seq.slice(idx + 1).find(item =>
    item.kind === 'question' ? !answeredQIds.has(item.id) : !answeredPollIds.has(item.id)
  )
  // Fall back to the literal next item if all remaining are answered
  const nextUrl = nextUnanswered
    ? seqUrl(nextUnanswered, studentId)
    : (idx < seq.length - 1 ? seqUrl(seq[idx + 1], studentId) : null)

  return (
    <AnswerForm
      studentId={studentId}
      question={question}
      answer={answer ?? null}
      prevUrl={prevUrl}
      nextUrl={nextUrl}
      questionNumber={idx + 1}
      totalQuestions={seq.length}
    />
  )
}
