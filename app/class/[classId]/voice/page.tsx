export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ClassVoiceReaderPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  const { data: questions } = await admin
    .from('questions')
    .select('id, text, order_index')
    .is('class_id', null)
    .eq('type', 'class_voice')
    .order('order_index')

  const questionIds = (questions ?? []).map((q) => q.id)

  const { data: answers } = questionIds.length > 0
    ? await admin
        .from('class_voice_answers')
        .select('question_id, content')
        .eq('class_id', classId)
        .in('question_id', questionIds)
    : { data: [] }

  // Group answers by question and count words/phrases
  const groupByQuestion = new Map<string, string[]>()
  for (const a of answers ?? []) {
    const existing = groupByQuestion.get(a.question_id) ?? []
    groupByQuestion.set(a.question_id, [...existing, a.content])
  }

  // For each question build a frequency map
  function buildFrequency(texts: string[]): { text: string; count: number }[] {
    const freq = new Map<string, number>()
    for (const t of texts) {
      const normalized = t.trim().toLowerCase()
      if (normalized) freq.set(normalized, (freq.get(normalized) ?? 0) + 1)
    }
    return [...freq.entries()]
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
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
          <h1 className="text-2xl font-bold text-gray-900">Гласът на класа</h1>
          <p className="text-sm text-gray-400 mt-1">Анонимни отговори от децата</p>
        </div>

        {(questions ?? []).map((q) => {
          const texts = groupByQuestion.get(q.id) ?? []
          if (texts.length === 0) return null
          const freq = buildFrequency(texts)
          const maxCount = freq[0]?.count ?? 1

          return (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-700 mb-5">{q.text}</p>

              {/* Visual bubble cloud */}
              <div className="flex flex-wrap gap-2 justify-center">
                {freq.map(({ text, count }) => {
                  const weight = count / maxCount
                  const size = weight > 0.75 ? 'text-lg' : weight > 0.4 ? 'text-base' : 'text-sm'
                  const bg = weight > 0.75
                    ? 'bg-indigo-600 text-white'
                    : weight > 0.4
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600'
                  return (
                    <span
                      key={text}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium ${size} ${bg}`}
                    >
                      {text}
                      {count > 1 && (
                        <span className="text-xs opacity-70 ml-0.5">×{count}</span>
                      )}
                    </span>
                  )
                })}
              </div>

              <p className="text-xs text-gray-400 mt-4 text-right">{texts.length} отговора</p>
            </div>
          )
        })}
      </div>
    </main>
  )
}
