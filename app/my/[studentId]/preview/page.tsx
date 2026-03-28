export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import StudentLexiconView from '@/app/lexicon/[classId]/student/[studentId]/StudentLexiconView'

export default async function ParentPreviewPage({
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

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_logo_url')
    .eq('id', student.class_id)
    .single()

  if (!classData) redirect('/login')

  const { data: allQuestions } = await admin
    .from('questions')
    .select('id, text, order_index, type')
    .eq('class_id', student.class_id)
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

  const authorIds = [...new Set((receivedMessages ?? []).map(m => m.author_student_id))]
  const { data: authors } = authorIds.length > 0
    ? await admin.from('students').select('id, first_name, last_name').in('id', authorIds)
    : { data: [] }

  const authorMap = new Map((authors ?? []).map(a => [a.id, a]))
  const messages = (receivedMessages ?? []).map(m => {
    const a = authorMap.get(m.author_student_id)
    return { id: m.id, content: m.content, authorName: a ? `${a.first_name} ${a.last_name}` : 'Съученик' }
  })

  return (
    <>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white flex items-center justify-between px-5 py-2.5 text-sm shadow-lg">
        <Link
          href={`/my/${studentId}/wizard`}
          className="flex items-center gap-1.5 text-amber-100 hover:text-white transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Редактирай
        </Link>

        <span className="font-semibold text-xs uppercase tracking-wider text-amber-100">
          Така ще изглежда страницата на {student.first_name}
        </span>

        <Link
          href={`/my/${studentId}`}
          className="flex items-center gap-1.5 text-amber-100 hover:text-white transition-colors font-medium"
        >
          Готово
          <span className="material-symbols-outlined text-base">check</span>
        </Link>
      </div>

      <div className="pt-10">
        <StudentLexiconView
          classId={student.class_id}
          className={classData.name}
          schoolLogoUrl={classData.school_logo_url ?? null}
          student={student}
          questions={allQuestions ?? []}
          answers={answers ?? []}
          messages={messages}
          prevStudentId={null}
          nextStudentId={null}
          isPremium={true}
        />
      </div>
    </>
  )
}
