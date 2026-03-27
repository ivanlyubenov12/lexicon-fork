export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import QuestionnaireTabView from './QuestionnaireTabView'

export default async function ModeratorQuestionnairePage({
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

  // Verify the current user is the moderator of this class
  const { data: classOwner } = await admin
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()
  if (!classOwner) redirect('/moderator')

  const { data: student } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url, class_id')
    .eq('id', studentId)
    .eq('class_id', classId)
    .single()

  if (!student) notFound()

  // ── Fetch everything in parallel ─────────────────────────────────────────
  const [
    { data: allClassQuestions },
    { data: answers },
    { data: polls },
    { data: pollVotesRaw },
    { data: eventsData },
    { data: eventCommentsData },
    { data: peerMessagesRaw },
  ] = await Promise.all([
    admin.from('questions')
      .select('id, text, order_index, type')
      .eq('class_id', classId)
      .order('order_index'),
    admin.from('answers')
      .select('question_id, status, text_content, media_url, media_type')
      .eq('student_id', studentId),
    admin.from('class_polls')
      .select('id, question, order_index')
      .eq('class_id', classId)
      .order('order_index'),
    admin.from('class_poll_votes')
      .select('poll_id, nominee_student_id, students!class_poll_votes_nominee_student_id_fkey(first_name, last_name, photo_url)')
      .eq('voter_student_id', studentId),
    admin.from('events')
      .select('id, title, event_date, photos')
      .eq('class_id', classId)
      .order('order_index'),
    admin.from('event_comments')
      .select('id, event_id, comment_text')
      .eq('student_id', studentId),
    admin.from('peer_messages')
      .select('id, content, status, recipient_student_id, students!peer_messages_recipient_student_id_fkey(first_name, last_name, photo_url)')
      .eq('author_student_id', studentId),
  ])

  // ── Shape data ────────────────────────────────────────────────────────────

  const questions = allClassQuestions ?? []
  const voiceQuestions = questions.filter(q => q.type === 'class_voice')
  const otherQuestions = questions.filter(q => q.type !== 'class_voice')

  const answerList = answers ?? []
  const answerMap = new Map(answerList.map(a => [a.question_id, a]))

  const pollList = polls ?? []

  const pollVotes = (pollVotesRaw ?? []).map(v => ({
    poll_id: v.poll_id,
    nominee: Array.isArray(v.students) ? v.students[0] ?? null : (v.students as { first_name: string; last_name: string; photo_url: string | null } | null),
  }))

  const commentByEvent: Record<string, { id: string; comment_text: string }> = {}
  for (const c of eventCommentsData ?? []) {
    commentByEvent[(c as { event_id: string; id: string; comment_text: string }).event_id] = c as { id: string; comment_text: string }
  }

  const eventList = (eventsData ?? []).map(e => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date,
    photos: (e.photos as string[]) ?? [],
    myComment: commentByEvent[e.id] ?? null,
  }))

  const peerMessages = (peerMessagesRaw ?? []).map(m => ({
    id: m.id,
    content: m.content,
    status: m.status,
    recipient: Array.isArray(m.students) ? m.students[0] ?? null : (m.students as { first_name: string; last_name: string; photo_url: string | null } | null),
  }))

  // ── Progress totals ───────────────────────────────────────────────────────
  const total    = otherQuestions.length
  const approved = otherQuestions.filter(q => answerMap.get(q.id)?.status === 'approved').length
  const submitted = otherQuestions.filter(q => answerMap.get(q.id)?.status === 'submitted').length

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* Sticky banner */}
      <div className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-300 text-base">assignment</span>
          <span className="text-sm font-semibold">
            {student.first_name} {student.last_name}
          </span>
          <span className="text-xs text-indigo-300 bg-indigo-600 px-2 py-0.5 rounded-full">
            Преглед на модератор
          </span>
        </div>
        <Link
          href={`/moderator/${classId}/students/${studentId}`}
          className="flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Student header */}
        <div className="flex items-center gap-4 mb-6">
          {student.photo_url ? (
            <img src={student.photo_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
              {student.first_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-800">{student.first_name} {student.last_name}</h1>
            <p className="text-sm text-gray-500">Попълнен въпросник</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Въпросник</span>
            <span className="text-xs font-semibold text-indigo-600">{approved} / {total} одобрени</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />{approved} одобрени</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" />{submitted} за преглед</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300" />{total - approved - submitted} без отговор</span>
          </div>
        </div>

        {/* Tabbed content */}
        <QuestionnaireTabView
          allQuestions={otherQuestions}
          answers={answerList}
          polls={pollList}
          pollVotes={pollVotes}
          events={eventList}
          peerMessages={peerMessages}
          voiceQuestions={voiceQuestions}
        />

      </div>
    </div>
  )
}
