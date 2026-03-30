import { redirect } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import ModeratorSidebar from '../../../ModeratorSidebar'
import EditStudentForm from './EditStudentForm'

interface Props {
  params: Promise<{ classId: string; studentId: string }>
}

export default async function EditStudentPage({ params }: Props) {
  const { classId, studentId } = await params
  const supabase = createServiceRoleClient()

  const { data: classData } = await supabase
    .from('classes')
    .select('id, name, school_year, school_logo_url')
    .eq('id', classId)
    .single()

  const { data: student, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, parent_email, photo_url, parent_user_id, invite_accepted_at')
    .eq('id', studentId)
    .eq('class_id', classId)
    .single()

  if (error || !student) redirect(`/moderator/${classId}/students`)

  // If magic link accepted, show registered email
  let registeredEmail: string | null = null
  if (student.invite_accepted_at && student.parent_user_id) {
    const { data: userData } = await supabase.auth.admin.getUserById(student.parent_user_id)
    registeredEmail = userData?.user?.email ?? null
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
        active="students"
      />

      <main className="md:ml-64 flex-1 min-w-0 p-4 pt-20 md:p-8 lg:p-12">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">
            Участници
          </p>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Редактирай участник
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {student.first_name} {student.last_name}
          </p>
        </div>

        <EditStudentForm classId={classId} student={student} photoUrl={student.photo_url ?? null} registeredEmail={registeredEmail} />
      </main>
    </div>
  )
}
