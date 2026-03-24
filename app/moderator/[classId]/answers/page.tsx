export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import AnswersTable from './AnswersTable'

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

  const studentIds = (students ?? []).map((s) => s.id)

  let answers: AnswerRow[] = []
  if (studentIds.length > 0) {
    const { data } = await supabase
      .from('answers')
      .select(
        'id, status, text_content, media_url, media_type, updated_at, student_id, question_id, students(first_name, last_name), questions(text, order_index)'
      )
      .in('student_id', studentIds)
      .order('updated_at', { ascending: false })
    answers = (data ?? []) as unknown as AnswerRow[]
  }

  const [namePart] = classData?.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData?.name ?? '']

  const pendingCount = answers.filter((a) => a.status === 'submitted').length
  const approvedCount = answers.filter((a) => a.status === 'approved').length

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData?.school_year ?? null}
        logoUrl={classData?.school_logo_url ?? null}
        active="answers"
      />

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="ml-64 flex-1 p-8 lg:p-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Преглед на съдържанието
          </p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1
                className="text-4xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                Отговори за одобрение
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Прегледайте и одобрете подадените отговори на учениците.
              </p>
            </div>
            {pendingCount > 0 && (
              <div className="flex-shrink-0 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <span className="material-symbols-outlined text-amber-500 text-base">pending</span>
                <span className="text-sm font-semibold text-amber-700">{pendingCount} чакащи</span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-6">
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-slate-400 text-xl">forum</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Общо</p>
                <p className="text-lg font-bold text-gray-800">{answers.length}</p>
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

        <AnswersTable answers={answers} classId={classId} />
      </main>
    </div>
  )
}
