import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import QuestionsEditor from './QuestionsEditor'

export default async function QuestionsPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData) notFound()

  const { data: systemQuestions } = await admin
    .from('questions')
    .select('id, text, type, allows_text, allows_media, max_length, order_index')
    .is('class_id', null)
    .eq('is_system', true)
    .order('order_index')

  const { data: customQuestions } = await admin
    .from('questions')
    .select('id, text, type, allows_text, allows_media, max_length, order_index')
    .eq('class_id', classId)
    .eq('is_system', false)
    .order('order_index')

  const [namePart] = classData.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name ?? '']

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData.school_year}
        logoUrl={classData.school_logo_url}
        active="questions"
      />

      <main className="ml-64 flex-1 p-8 lg:p-12">
        <QuestionsEditor
          classId={classId}
          systemQuestions={systemQuestions ?? []}
          customQuestions={customQuestions ?? []}
        />
      </main>
    </div>
  )
}
