import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import JoinAuthForms from './JoinAuthForms'

interface Props {
  params: Promise<{ invite_token: string }>
}

export default async function JoinPage({ params }: Props) {
  const { invite_token } = await params
  const admin = createServiceRoleClient()

  const { data: student, error } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url, parent_email, invite_accepted_at, class_id')
    .eq('invite_token', invite_token)
    .single()

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[#faf9f8] flex items-center justify-center px-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
        <div className="max-w-sm w-full text-center">
          <span className="material-symbols-outlined text-5xl text-gray-200 block mb-4">link_off</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noto Serif, serif' }}>Невалиден линк</h1>
          <p className="text-sm text-gray-500">Линкът е невалиден или вече е използван. Свържете се с учителя.</p>
        </div>
      </div>
    )
  }

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, school_logo_url, moderator_id, teacher_name')
    .eq('id', student.class_id)
    .single()

  // Try to get moderator's display name from auth metadata
  let moderatorName = 'Вашата учителка'
  if (classData?.moderator_id) {
    const { data: { user: mod } } = await admin.auth.admin.getUserById(classData.moderator_id)
    const name = mod?.user_metadata?.full_name || mod?.user_metadata?.name || classData?.teacher_name
    if (name) moderatorName = name
  }

  // If already logged in → link student and go straight to wizard
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await admin
      .from('students')
      .update({
        parent_user_id: user.id,
        ...(student.invite_accepted_at ? {} : { invite_accepted_at: new Date().toISOString() }),
      })
      .eq('id', student.id)
    redirect(`/my/${student.id}/wizard`)
  }

  const studentName = `${student.first_name} ${student.last_name}`
  // Already accepted → returning user who has a password; fresh invite → register
  const defaultMode = student.invite_accepted_at ? 'login' : 'register'

  return (
    <JoinShell student={student} classData={classData} moderatorName={moderatorName}>
      <JoinAuthForms
        studentId={student.id}
        studentName={studentName}
        parentEmail={student.parent_email ?? ''}
        defaultMode={defaultMode}
      />
    </JoinShell>
  )
}

function JoinShell({
  student,
  classData,
  moderatorName,
  children,
}: {
  student: { first_name: string; last_name: string; photo_url: string | null }
  classData: { name: string; school_year: string; school_logo_url: string | null } | null
  moderatorName: string
  children: React.ReactNode
}) {
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()

  const [classPart, schoolPart] = classData?.name?.includes(' — ')
    ? classData.name.split(' — ')
    : [classData?.name ?? '', '']

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col items-center justify-center px-6 py-16" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-8">Един неразделен клас</p>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-4">

          {/* Invitation header */}
          {classData && (
            <div className="text-center mb-6 pb-6 border-b border-gray-100">
              {classData.school_logo_url && (
                <img
                  src={classData.school_logo_url}
                  alt={schoolPart}
                  className="w-12 h-12 rounded-full object-contain mx-auto mb-3 border border-gray-100 bg-white p-1"
                />
              )}
              <p className="text-sm text-gray-500 leading-relaxed">
                <span className="font-semibold text-gray-800">{moderatorName}</span> ви кани да попълните
                годишния лексикон на{' '}
                <span className="font-semibold text-indigo-700">{classPart}</span>
                {schoolPart && (
                  <>, <span className="font-semibold text-gray-700">{schoolPart}</span></>
                )}
              </p>
              {classData.school_year && (
                <p className="text-xs text-gray-400 mt-1">{classData.school_year}</p>
              )}
            </div>
          )}

          {/* Student */}
          <div className="flex flex-col items-center mb-6">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={`${student.first_name} ${student.last_name}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-indigo-50 mb-3"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl mb-3"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                {initials}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
              {student.first_name} {student.last_name}
            </h1>
          </div>

          {children}
        </div>

        <p className="text-center text-xs text-gray-400">
          Вашите данни са защитени и никога няма да бъдат споделени.
        </p>
      </div>
    </div>
  )
}
