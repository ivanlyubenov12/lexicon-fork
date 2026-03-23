export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import SuperheroEditor from './SuperheroEditor'

export default async function SuperheroPage({ params }: { params: { classId: string } }) {
  noStore()
  const { classId } = params
  const supabase = createServiceRoleClient()

  const { data: classData } = await supabase
    .from('classes')
    .select('superhero_prompt, superhero_image_url')
    .eq('id', classId)
    .single()

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)

  const studentIds = (students ?? []).map((s) => s.id)
  let answers: string[] = []

  if (studentIds.length > 0) {
    const { data: superheroQuestions } = await supabase
      .from('questions')
      .select('id')
      .eq('type', 'superhero')

    const questionIds = (superheroQuestions ?? []).map((q) => q.id)

    if (questionIds.length > 0) {
      const { data } = await supabase
        .from('answers')
        .select('text_content')
        .eq('status', 'approved')
        .in('student_id', studentIds)
        .in('question_id', questionIds)
        .not('text_content', 'is', null)

      answers = (data ?? []).map((a) => a.text_content as string).filter(Boolean)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href={`/moderator/${classId}`}
        className="text-sm text-gray-500 hover:text-gray-700 inline-block mb-6"
      >
        ← Към dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Супергерой на класа</h1>
      <p className="text-sm text-gray-500 mb-8">
        Децата са описали своята учителка като супергерой. Генерирай описание с AI и след това — илюстрация.
      </p>

      <SuperheroEditor
        classId={classId}
        answers={answers}
        savedPrompt={classData?.superhero_prompt ?? null}
        savedImageUrl={classData?.superhero_image_url ?? null}
      />
    </div>
  )
}
