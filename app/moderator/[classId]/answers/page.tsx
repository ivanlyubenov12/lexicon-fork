export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import AnswersTable from './AnswersTable'

export default async function AnswersPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const supabase = createServiceRoleClient()

  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .eq('questionnaire_submitted', true)

  const studentIds = (students ?? []).map((s) => s.id)

  let answers: AnswerRow[] = []
  let messages: MessageRow[] = []

  if (studentIds.length > 0) {
    const [answersRes, messagesRes] = await Promise.all([
      supabase
        .from('answers')
        .select('id, status, text_content, media_url, media_type, updated_at, student_id, question_id, students(first_name, last_name), questions(text, order_index)')
        .in('student_id', studentIds)
        .order('updated_at', { ascending: false }),
      supabase
        .from('peer_messages')
        .select('id, content, status, created_at, recipient_student_id, author_student_id, recipient:students!recipient_student_id(first_name, last_name), author:students!author_student_id(first_name, last_name)')
        .in('recipient_student_id', studentIds)
        .order('created_at', { ascending: false }),
    ])
    answers = (answersRes.data ?? []) as unknown as AnswerRow[]
    messages = (messagesRes.data ?? []) as unknown as MessageRow[]
  }

  const { data: voiceAnswersData } = await supabase
    .from('class_voice_answers')
    .select('id, content, question_id, questions(text)')
    .eq('class_id', classId)
    .order('created_at', { ascending: false })
  const voiceAnswers = (voiceAnswersData ?? []) as unknown as VoiceAnswerRow[]

  const [namePart] = classData?.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData?.name ?? '']

  const pendingCount =
    answers.filter((a) => a.status === 'submitted').length +
    messages.filter((m) => m.status === 'pending').length

  const approvedCount =
    answers.filter((a) => a.status === 'approved').length +
    messages.filter((m) => m.status === 'approved').length

  const totalCount = answers.length + messages.length

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData?.school_year ?? null}
        logoUrl={classData?.school_logo_url ?? null}
        active="answers"
      />

      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Преглед на съдържанието
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                За одобрение
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Отговори на въпроси и послания между участници.
              </p>
            </div>
            {pendingCount > 0 && (
              <div className="flex-shrink-0 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <span className="material-symbols-outlined text-amber-500 text-base">pending</span>
                <span className="text-sm font-semibold text-amber-700">{pendingCount} чакащи</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-6">
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-slate-400 text-xl">forum</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Общо</p>
                <p className="text-lg font-bold text-gray-800">{totalCount}</p>
              </div>
            </div>
            <div className="bg-white border border-amber-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-amber-400 text-xl">schedule</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Чакащи</p>
                <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
              </div>
            </div>
            <div className="bg-white border border-green-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Одобрени</p>
                <p className="text-lg font-bold text-green-600">{approvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <AnswersTable answers={answers} messages={messages} voiceAnswers={voiceAnswers} classId={classId} />
      </main>
    </div>
  )
}

interface AnswerRow {
  id: string
  status: string
  text_content: string | null
  media_url: string | null
  media_type: string | null
  updated_at: string
  student_id: string
  question_id: string
  students: { first_name: string; last_name: string }
  questions: { text: string; order_index: number }
}

interface MessageRow {
  id: string
  content: string
  status: string
  created_at: string
  recipient_student_id: string
  author_student_id: string
  recipient: { first_name: string; last_name: string }
  author: { first_name: string; last_name: string }
}

interface VoiceAnswerRow {
  id: string
  content: string
  question_id: string
  questions: { text: string }
}
