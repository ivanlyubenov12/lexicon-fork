export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import SuperheroEditor from './SuperheroEditor'

export default async function SuperheroPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params

  const auth = createServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createServiceRoleClient()

  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, school_year, school_logo_url, superhero_prompt, superhero_image_url')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!classData) redirect('/moderator')

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

  const [namePart] = classData?.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData?.name ?? '']

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData?.school_year ?? null}
        logoUrl={classData?.school_logo_url ?? null}
        active="superhero"
      />

      <main className="ml-64 flex-1 p-8 lg:p-12">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Специален момент
          </p>
          <h1
            className="text-4xl font-bold text-gray-900 leading-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Супергерой на класа
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg">
            Децата са описали своята учителка като супергерой. Генерирай описание с AI и след това — илюстрация.
          </p>
        </div>

        <SuperheroEditor
          classId={classId}
          answers={answers}
          savedPrompt={classData?.superhero_prompt ?? null}
          savedImageUrl={classData?.superhero_image_url ?? null}
        />
      </main>
    </div>
  )
}
