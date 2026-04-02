export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import StudentLexiconView from './StudentLexiconView'

export default async function LexiconStudentPage({
  params,
}: {
  params: Promise<{ classId: string; studentId: string }>
}) {
  noStore()
  const { classId, studentId } = await params
  const admin = createServiceRoleClient()

  // Verify class is published
  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status, plan, school_logo_url, template_id, group_label')
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

  // Only personal/video/etc questions — class_voice are class-wide, not per-student
  const { data: allQuestions } = await admin
    .from('questions')
    .select('id, text, order_index, type, is_featured')
    .eq('class_id', classId)
    .neq('type', 'survey')
    .order('order_index')

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

  // Events where this student left a comment
  const { data: eventComments } = await admin
    .from('event_comments')
    .select('event_id, comment_text')
    .eq('student_id', studentId)

  const commentedEventIds = [...new Set((eventComments ?? []).map(c => c.event_id))]

  const { data: commentedEvents } = commentedEventIds.length > 0
    ? await admin
        .from('events')
        .select('id, title, event_date, photos')
        .in('id', commentedEventIds)
        .eq('class_id', classId)
        .order('order_index')
    : { data: [] }

  const studentEvents = (commentedEvents ?? []).map(ev => ({
    id: ev.id,
    title: ev.title,
    event_date: ev.event_date ?? null,
    firstPhoto: (ev.photos as string[] | null)?.[0] ?? null,
    comment: (eventComments ?? []).find(c => c.event_id === ev.id)?.comment_text ?? '',
  }))

  // Build prev/next student navigation
  const { data: allStudents } = await admin
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('last_name')

  const studentList = allStudents ?? []
  const currentIndex = studentList.findIndex((s) => s.id === studentId)
  const prevStudentId = currentIndex > 0 ? studentList[currentIndex - 1].id : null
  const nextStudentId = currentIndex < studentList.length - 1 ? studentList[currentIndex + 1].id : null

  return (
    <StudentLexiconView
      classId={classId}
      className={classData.name}
      schoolLogoUrl={classData.school_logo_url ?? null}
      student={student}
      questions={allQuestions ?? []}
      answers={answers ?? []}
      messages={messagesWithAuthors}
      studentEvents={studentEvents}
      prevStudentId={prevStudentId}
      nextStudentId={nextStudentId}
      isPremium={classData.plan === 'premium'}
      themeId={classData.template_id}
      groupLabel={(classData as any).group_label ?? null}
      embedded
    />
  )
}
