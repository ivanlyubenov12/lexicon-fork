import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import JoinRegisterForm from './JoinRegisterForm'
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
      <div className="min-h-screen bg-[#faf9f8] flex items-center justify-center px-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
        <div className="max-w-sm w-full text-center">
          <span className="material-symbols-outlined text-5xl text-gray-200 block mb-4">link_off</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noto Serif, serif' }}>Невалиден линк</h1>
          <p className="text-sm text-gray-500">Линкът е невалиден или вече е използван. Свържете се с учителя.</p>
        </div>
      </div>
    )
  }

  // If already logged in → go straight to student profile
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(`/my/${student.id}`)

  const parentEmail = student.parent_email ?? ''

  // Check if this email already has a parent account on another student
  const { data: existingParentRow } = await admin
    .from('students')
    .select('parent_user_id')
    .eq('parent_email', parentEmail)
    .not('parent_user_id', 'is', null)
    .limit(1)
    .maybeSingle()

  const parentAccountExists = !!existingParentRow?.parent_user_id

  return (
    <JoinShell student={student}>
      {/* Invite already accepted — show login */}
      {student.invite_accepted_at !== null && (
        <JoinLoginForm
          studentId={student.id}
          studentName={`${student.first_name} ${student.last_name}`}
          parentEmail={parentEmail}
          reason="already_accepted"
        />
      )}

      {/* New invite, but parent already has an account (second child etc.) */}
      {student.invite_accepted_at === null && parentAccountExists && (
        <JoinLoginForm
          studentId={student.id}
          studentName={`${student.first_name} ${student.last_name}`}
          parentEmail={parentEmail}
          reason="account_exists"
        />
      )}

      {/* New invite, new parent — registration */}
      {student.invite_accepted_at === null && !parentAccountExists && (
        <JoinRegisterForm
          studentId={student.id}
          studentName={`${student.first_name} ${student.last_name}`}
          parentEmail={parentEmail}
        />
      )}
    </JoinShell>
  )
}

function JoinShell({
  student,
  children,
}: {
  student: { first_name: string; last_name: string; photo_url: string | null }
  children: React.ReactNode
}) {
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col items-center justify-center px-6 py-16" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-8">Един неразделен клас</p>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-4">
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
