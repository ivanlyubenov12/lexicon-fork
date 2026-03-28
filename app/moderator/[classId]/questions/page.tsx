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

  const [sysRes, cusRes] = await Promise.all([
    admin
      .from('questions')
      .select('id, text, type, allows_text, allows_media, max_length, order_index, description, voice_display, is_featured')
      .is('class_id', null)
      .eq('is_system', true)
      .order('order_index'),
    admin
      .from('questions')
      .select('id, text, type, allows_text, allows_media, max_length, order_index, description, voice_display, is_featured')
      .eq('class_id', classId)
      .eq('is_system', false)
      .order('order_index'),
  ])

  // If extended columns are missing (migrations not yet applied), fall back to base columns
  const needsFallback = !!sysRes.error || !!cusRes.error
  const [sysFallback, cusFallback] = needsFallback
    ? await Promise.all([
        admin
          .from('questions')
          .select('id, text, type, allows_text, allows_media, max_length, order_index')
          .is('class_id', null)
          .eq('is_system', true)
          .order('order_index'),
        admin
          .from('questions')
          .select('id, text, type, allows_text, allows_media, max_length, order_index')
          .eq('class_id', classId)
          .eq('is_system', false)
          .order('order_index'),
      ])
    : [{ data: null }, { data: null }]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normalise(rows: any[] | null) {
    return (rows ?? []).map(q => ({
      ...q,
      description:   q.description   ?? null,
      voice_display: q.voice_display  ?? null,
      is_featured:   q.is_featured    ?? false,
      max_length:    q.max_length     ?? null,
    }))
  }

  const systemQuestions = normalise(sysRes.data ?? sysFallback.data)
  const customQuestions = normalise(cusRes.data ?? cusFallback.data)

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

      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">
        <QuestionsEditor
          classId={classId}
          systemQuestions={systemQuestions ?? []}
          customQuestions={customQuestions ?? []}
        />
      </main>
    </div>
  )
}
