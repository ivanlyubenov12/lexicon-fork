export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect, notFound } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import StudentLexiconView from '@/app/lexicon/[classId]/student/[studentId]/StudentLexiconView'

export default async function PreviewStudentPage({
  params,
}: {
  params: Promise<{ classId: string; studentId: string }>
}) {
  noStore()
  const { classId, studentId } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: classData } = await admin
    .from('classes')
    .select('id, name, plan, school_logo_url')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!classData) redirect('/moderator')

  const { data: student } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url, class_id')
    .eq('id', studentId)
    .eq('class_id', classId)
    .single()

  if (!student) notFound()

  const { data: allQuestions } = await admin
    .from('questions')
    .select('id, text, order_index, type, is_featured')
    .eq('class_id', classId)
    .neq('type', 'survey')
    .order('order_index')

  const { data: answers } = await admin
    .from('answers')
    .select('question_id, text_content, media_url, media_type')
    .eq('student_id', studentId)

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
  const messagesWithAuthors = (receivedMessages ?? []).map((m) => ({
    id: m.id,
    content: m.content,
    authorName: (() => { const a = authorMap.get(m.author_student_id); return a ? `${a.first_name} ${a.last_name}` : 'Съученик' })(),
  }))

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

  const { data: allStudents } = await admin
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('last_name')

  const studentList = allStudents ?? []
  const currentIndex = studentList.findIndex((s) => s.id === studentId)
  const prevId = currentIndex > 0 ? studentList[currentIndex - 1].id : null
  const nextId = currentIndex < studentList.length - 1 ? studentList[currentIndex + 1].id : null
  const base = `/moderator/${classId}/preview`

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
      prevStudentId={prevId}
      nextStudentId={nextId}
      prevHref={prevId ? `${base}/student/${prevId}` : null}
      nextHref={nextId ? `${base}/student/${nextId}` : null}
      backHref={`${base}/students`}
      basePath={base}
      isPremium={true /* moderator preview always shows all content */}
      embedded
    />
  )
}
