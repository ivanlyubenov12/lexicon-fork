import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
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

  const { data: student, error: studentError } = await admin
    .from('students')
    .select('id, class_id, parent_user_id')
    .eq('id', studentId)
    .single()

  if (studentError || !student || student.parent_user_id !== user.id) {
    redirect('/login')
  }

  const { data: question, error: questionError } = await admin
    .from('questions')
    .select('id, text, type, order_index, max_length')
    .eq('id', questionId)
    .single()

  if (questionError || !question) redirect(`/my/${studentId}`)

  const { data: answer } = await admin
    .from('answers')
    .select('id, text_content, media_url, media_type, status, moderator_note')
    .eq('student_id', studentId)
    .eq('question_id', questionId)
    .single()

  // All answerable questions for this class (moderator-defined only)
  const { data: allQuestions } = await admin
    .from('questions')
    .select('id, order_index')
    .eq('class_id', student.class_id)
    .in('type', ['personal', 'superhero', 'better_together', 'video'])
    .order('order_index')

  // Fetch all answers to know which are done
  const { data: allAnswers } = await admin
    .from('answers')
    .select('question_id, status')
    .eq('student_id', studentId)

  const doneSet = new Set(
    (allAnswers ?? [])
      .filter((a) => a.status === 'submitted' || a.status === 'approved')
      .map((a) => a.question_id)
  )

  const questions = allQuestions ?? []
  const currentIndex = questions.findIndex((q) => q.id === questionId)
  const prevQuestionId = currentIndex > 0 ? questions[currentIndex - 1].id : null

  // Next unanswered: search from currentIndex+1 forward, then wrap from start
  const after = questions.slice(currentIndex + 1)
  const before = questions.slice(0, currentIndex)
  const nextUnansweredId =
    after.find((q) => !doneSet.has(q.id))?.id ??
    before.find((q) => !doneSet.has(q.id))?.id ??
    null

  return (
    <AnswerForm
      studentId={studentId}
      question={question}
      answer={answer ?? null}
      prevQuestionId={prevQuestionId}
      nextQuestionId={questions[currentIndex + 1]?.id ?? null}
      nextUnansweredId={nextUnansweredId}
    />
  )
}
