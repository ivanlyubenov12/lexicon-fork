import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import JoinForm from './JoinForm'
import JoinLoginForm from './JoinLoginForm'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Невалиден линк</h1>
          <p className="text-gray-500 text-sm">Линкът е невалиден или вече е използван.</p>
        </div>
      </div>
    )
  }

  // If already registered, check if the parent is currently logged in
  if (student.invite_accepted_at !== null) {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Already logged in as the right parent — go directly
    if (user) {
      redirect(`/my/${student.id}`)
    }

    // Not logged in — show login form inline
    const studentName = `${student.first_name} ${student.last_name}`
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={studentName}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-indigo-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600 text-2xl font-bold">
                {student.first_name.charAt(0)}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-800">{studentName}</h1>
          </div>
          <JoinLoginForm
            studentId={student.id}
            studentName={studentName}
            parentEmail={student.parent_email ?? ''}
          />
        </div>
      </div>
    )
  }

  const studentName = `${student.first_name} ${student.last_name}`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={studentName}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-indigo-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600 text-2xl font-bold">
              {student.first_name.charAt(0)}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-800">{studentName}</h1>
        </div>
        <JoinForm
          studentId={student.id}
          studentName={studentName}
          parentEmail={student.parent_email ?? ''}
        />
      </div>
    </div>
  )
}
