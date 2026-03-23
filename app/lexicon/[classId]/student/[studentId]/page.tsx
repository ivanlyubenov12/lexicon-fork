export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import StudentLexiconView from './StudentLexiconView'

export default async function LexiconStudentPage({
  params,
}: {
  params: { classId: string; studentId: string }
}) {
  noStore()
  const { classId, studentId } = params
  const admin = createServiceRoleClient()

  // Verify class is published
  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  // Fetch student
  const { data: student } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url, class_id')
    .eq('id', studentId)
    .eq('class_id', classId)
    .single()

  if (!student) notFound()

  // All questions (personal + class tab types)
  const { data: systemPersonal } = await admin
    .from('questions')
    .select('id, text, order_index, type')
    .is('class_id', null)
    .eq('type', 'personal')
    .order('order_index')

  const { data: classPersonal } = await admin
    .from('questions')
    .select('id, text, order_index, type')
    .eq('class_id', classId)
    .eq('type', 'personal')
    .order('order_index')

  const { data: systemClass } = await admin
    .from('questions')
    .select('id, text, order_index, type')
    .is('class_id', null)
    .in('type', ['superhero', 'better_together'])
    .order('order_index')

  const { data: classSpecificClass } = await admin
    .from('questions')
    .select('id, text, order_index, type')
    .eq('class_id', classId)
    .in('type', ['superhero', 'better_together'])
    .order('order_index')

  const allQuestions = [
    ...(systemPersonal ?? []),
    ...(classPersonal ?? []),
    ...(systemClass ?? []),
    ...(classSpecificClass ?? []),
  ].sort((a, b) => a.order_index - b.order_index)

  // Approved answers for this student
  const { data: answers } = await admin
    .from('answers')
    .select('question_id, text_content, media_url, media_type')
    .eq('student_id', studentId)
    .eq('status', 'approved')

  // Approved peer messages received
  const { data: receivedMessages } = await admin
    .from('peer_messages')
    .select('id, content, author_student_id')
    .eq('recipient_student_id', studentId)
    .eq('status', 'approved')

  // Author names for messages
  const authorIds = [...new Set((receivedMessages ?? []).map((m) => m.author_student_id))]
  const { data: authors } = authorIds.length > 0
    ? await admin
        .from('students')
        .select('id, first_name, last_name')
        .in('id', authorIds)
    : { data: [] }

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]))

  const messagesWithAuthors = (receivedMessages ?? []).map((m) => {
    const author = authorMap.get(m.author_student_id)
    return {
      id: m.id,
      content: m.content,
      authorName: author ? `${author.first_name} ${author.last_name}` : 'Съученик',
    }
  })

  // Build prev/next student navigation
  const { data: allStudents } = await admin
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .order('last_name')

  const studentList = allStudents ?? []
  const currentIndex = studentList.findIndex((s) => s.id === studentId)
  const prevStudentId = currentIndex > 0 ? studentList[currentIndex - 1].id : null
  const nextStudentId = currentIndex < studentList.length - 1 ? studentList[currentIndex + 1].id : null

  return (
    <StudentLexiconView
      classId={classId}
      className={classData.name}
      student={student}
      questions={allQuestions}
      answers={answers ?? []}
      messages={messagesWithAuthors}
      prevStudentId={prevStudentId}
      nextStudentId={nextStudentId}
    />
  )
}
