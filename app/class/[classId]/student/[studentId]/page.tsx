export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import StudentReaderView from './StudentReaderView'

export default async function StudentProfilePage({
  params,
}: {
  params: { classId: string; studentId: string }
}) {
  noStore()
  const { classId, studentId } = params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  const { data: student } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('id', studentId)
    .eq('class_id', classId)
    .single()

  if (!student) notFound()

  // All question types shown in student profile
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

  const allQuestions = [
    ...(systemPersonal ?? []),
    ...(classPersonal ?? []),
  ].sort((a, b) => a.order_index - b.order_index)

  // Approved answers
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

  const authorIds = [...new Set((receivedMessages ?? []).map((m) => m.author_student_id))]
  const { data: authors } = authorIds.length > 0
    ? await admin.from('students').select('id, first_name, last_name').in('id', authorIds)
    : { data: [] }

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]))
  const messages = (receivedMessages ?? []).map((m) => {
    const author = authorMap.get(m.author_student_id)
    return {
      id: m.id,
      content: m.content,
      authorName: author ? `${author.first_name} ${author.last_name}` : 'Съученик',
    }
  })

  // Prev/next navigation
  const { data: allStudents } = await admin
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .order('last_name')

  const list = allStudents ?? []
  const idx = list.findIndex((s) => s.id === studentId)
  const prevId = idx > 0 ? list[idx - 1].id : null
  const nextId = idx < list.length - 1 ? list[idx + 1].id : null

  return (
    <StudentReaderView
      classId={classId}
      className={classData.name}
      student={student}
      questions={allQuestions}
      answers={answers ?? []}
      messages={messages}
      prevStudentId={prevId}
      nextStudentId={nextId}
    />
  )
}
