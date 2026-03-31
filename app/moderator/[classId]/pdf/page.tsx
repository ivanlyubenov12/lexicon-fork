import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../ModeratorSidebar'
import PdfBuilderClient from './PdfBuilderClient'

export default async function PdfBuilderPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData) notFound()

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
        active="pdf"
      />

      <main className="md:ml-64 flex-1 min-w-0 flex flex-col">
        <PdfBuilderClient classId={classId} />
      </main>
    </div>
  )
}
