import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../../ModeratorSidebar'
import AddStudentForm from './AddStudentForm'

export default async function NewStudentPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  const supabase = createServiceRoleClient()

  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

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
        active="students"
      />

      <main className="md:ml-64 flex-1 p-4 pt-20 md:p-8 lg:p-12">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Покани и деца
          </p>
          <h1
            className="text-4xl font-bold text-gray-900 leading-tight"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Добави дете
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Добавете ученик и изпратете покана на родителя.
          </p>
        </div>

        <AddStudentForm classId={classId} />
      </main>
    </div>
  )
}
