// Route: /moderator/[classId]/answers — M5: Answer approval queue
export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
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

export default async function AnswersPage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params
  const supabase = createServiceRoleClient()

  // Fetch student IDs for this class
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href={`/moderator/${classId}`}
        className="text-sm text-gray-500 hover:text-gray-700 inline-block mb-6"
      >
        ← Към dashboard
      </Link>

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Отговори за одобрение</h1>

      {/* Table with filter tabs */}
      <AnswersTable answers={answers} classId={classId} />
    </div>
  )
}
