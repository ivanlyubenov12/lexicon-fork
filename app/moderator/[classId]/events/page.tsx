import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import EventsEditor from './EventsEditor'

export default async function EventsPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData) notFound()

  const { data: events } = await admin
    .from('events')
    .select('id, title, event_date, note, photos, order_index')
    .eq('class_id', classId)
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
        active="events"
      />

      <main className="ml-64 flex-1 p-8 lg:p-12">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Албум на годината
          </p>
          <h1
            className="text-4xl font-bold text-gray-900 leading-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Събития през годината
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Добавете до 10 специални момента от учебната година.
          </p>
        </div>

        <EventsEditor
          classId={classId}
          initialEvents={(events ?? []).map((e) => ({ ...e, photos: e.photos ?? [] }))}
        />
      </main>
    </div>
  )
}
