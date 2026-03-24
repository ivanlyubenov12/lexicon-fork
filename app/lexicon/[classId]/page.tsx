export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LexiconCoverPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, status, superhero_prompt, superhero_image_url, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  // Fetch class voice questions + answers
  const { data: voiceQuestions } = await admin
    .from('questions')
    .select('id, text, order_index')
    .is('class_id', null)
    .eq('type', 'class_voice')
    .order('order_index')

  const voiceQuestionIds = (voiceQuestions ?? []).map((q) => q.id)

  const { data: voiceAnswers } = voiceQuestionIds.length > 0
    ? await admin
        .from('class_voice_answers')
        .select('question_id, content')
        .eq('class_id', classId)
        .in('question_id', voiceQuestionIds)
    : { data: [] }

  // Group answers by question
  const answersByQuestion = new Map<string, string[]>()
  for (const a of voiceAnswers ?? []) {
    const existing = answersByQuestion.get(a.question_id) ?? []
    answersByQuestion.set(a.question_id, [...existing, a.content])
  }

  const { count: studentCount } = await admin
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">Един неразделен клас</p>
        <div className="flex items-center justify-center gap-4 mb-2">
          {classData.school_logo_url && (
            <img
              src={classData.school_logo_url}
              alt="Лого"
              className="w-14 h-14 object-contain rounded-lg bg-white shadow-sm p-1 border border-gray-100"
            />
          )}
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{classData.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Учебна година {classData.school_year}</p>
          </div>
        </div>

        {classData.superhero_image_url && (
          <div className="mt-8 mx-auto max-w-xs">
            <img
              src={classData.superhero_image_url}
              alt="Супергерой"
              className="w-full rounded-3xl shadow-xl"
            />
            {classData.superhero_prompt && (
              <p className="text-xs text-gray-400 mt-3 italic leading-relaxed">
                {classData.superhero_prompt}
              </p>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`/lexicon/${classId}/students`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Виж {studentCount ?? 0} деца в класа →
          </Link>
        </div>
      </div>

      {/* Class voice section */}
      {(voiceQuestions ?? []).length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pb-16 space-y-8 mt-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">Гласът на класа</h2>
            <p className="text-sm text-gray-400 mt-1">Анонимни отговори от децата</p>
          </div>
          {(voiceQuestions ?? []).map((q) => {
            const answers = answersByQuestion.get(q.id) ?? []
            if (answers.length === 0) return null
            return (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-semibold text-gray-700 mb-4">{q.text}</p>
                <div className="flex flex-wrap gap-2">
                  {answers.map((answer, i) => (
                    <span
                      key={i}
                      className="inline-block bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full"
                    >
                      {answer}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
