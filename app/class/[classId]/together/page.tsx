export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BetterTogetherPage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  // better_together questions (system)
  const { data: questions } = await admin
    .from('questions')
    .select('id, text, order_index')
    .is('class_id', null)
    .eq('type', 'better_together')
    .order('order_index')

  // Students in class
  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name')
    .eq('class_id', classId)
    .order('last_name')

  const studentMap = new Map((students ?? []).map((s) => [s.id, s]))
  const studentIds = (students ?? []).map((s) => s.id)
  const questionIds = (questions ?? []).map((q) => q.id)

  const { data: answers } = questionIds.length > 0 && studentIds.length > 0
    ? await admin
        .from('answers')
        .select('question_id, student_id, text_content')
        .eq('status', 'approved')
        .in('question_id', questionIds)
        .in('student_id', studentIds)
        .not('text_content', 'is', null)
    : { data: [] }

  // Group by question
  const byQuestion = new Map<string, Array<{ studentName: string; text: string }>>()
  for (const a of answers ?? []) {
    if (!a.text_content) continue
    const student = studentMap.get(a.student_id)
    if (!student) continue
    const existing = byQuestion.get(a.question_id) ?? []
    byQuestion.set(a.question_id, [
      ...existing,
      { studentName: `${student.first_name} ${student.last_name}`, text: a.text_content },
    ])
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href={`/class/${classId}/home`} className="text-sm text-gray-400 hover:text-gray-600">
            ← {classData.name}
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">По-добри заедно</h1>
          <p className="text-sm text-gray-400 mt-1">Какво са споделили децата</p>
        </div>

        {(questions ?? []).map((q) => {
          const entries = byQuestion.get(q.id) ?? []
          if (entries.length === 0) return null

          return (
            <div key={q.id}>
              <h2 className="text-base font-semibold text-gray-700 mb-4 text-center px-4">{q.text}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {entries.map((entry, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">{entry.text}</p>
                    <p className="text-xs text-indigo-400 text-right">— {entry.studentName}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
