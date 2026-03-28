import { createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ModeratorSidebar from '../ModeratorSidebar'
import SeedPanel from './SeedPanel'

interface Props {
  params: Promise<{ classId: string }>
}

export default async function SeedPage({ params }: Props) {
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData) redirect('/moderator')

  const [namePart] = classData.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name ?? '']

  return (
    <div className="flex min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <ModeratorSidebar
        classId={classId}
        namePart={namePart}
        schoolYear={classData.school_year ?? null}
        logoUrl={classData.school_logo_url ?? null}
        active="seed"
      />

      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">
            Тестова фаза
          </p>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Тестови данни
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Генерирай или изчисти дъми данни за бързо тестване на лексикона.
          </p>
        </div>

        <SeedPanel classId={classId} />
      </main>
    </div>
  )
}
