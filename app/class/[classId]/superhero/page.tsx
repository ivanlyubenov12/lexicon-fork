export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SuperheroReaderPage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status, superhero_prompt, superhero_image_url')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  // Fetch the superhero question answers with student names
  const { data: superheroQuestion } = await admin
    .from('questions')
    .select('id')
    .is('class_id', null)
    .eq('type', 'superhero')
    .single()

  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name')
    .eq('class_id', classId)
    .order('last_name')

  const studentMap = new Map((students ?? []).map((s) => [s.id, s]))
  const studentIds = (students ?? []).map((s) => s.id)

  const { data: answers } = superheroQuestion && studentIds.length > 0
    ? await admin
        .from('answers')
        .select('student_id, text_content')
        .eq('question_id', superheroQuestion.id)
        .eq('status', 'approved')
        .in('student_id', studentIds)
        .not('text_content', 'is', null)
    : { data: [] }

  const answersWithNames = (answers ?? [])
    .filter((a) => a.text_content)
    .map((a) => {
      const student = studentMap.get(a.student_id)
      return {
        studentName: student ? `${student.first_name} ${student.last_name}` : '',
        text: a.text_content!,
      }
    })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-3">
          <Link href={`/class/${classId}/home`} className="text-sm text-gray-400 hover:text-gray-600">
            ← {classData.name}
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Супергероят на класа</h1>
          <p className="text-sm text-gray-400 mt-1">Така децата описаха своята учителка</p>
        </div>

        {classData.superhero_image_url ? (
          <div className="flex flex-col items-center">
            <img
              src={classData.superhero_image_url}
              alt="Супергерой"
              className="w-full max-w-sm rounded-3xl shadow-xl"
            />
            {classData.superhero_prompt && (
              <p className="text-sm text-gray-500 mt-4 italic leading-relaxed text-center max-w-sm">
                {classData.superhero_prompt}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">Изображението все още не е генерирано.</p>
          </div>
        )}

        {answersWithNames.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Какво казаха децата</h2>
            <div className="space-y-3">
              {answersWithNames.map((a, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800">{a.text}</p>
                    <p className="text-xs text-indigo-400 mt-0.5">— {a.studentName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
