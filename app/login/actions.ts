'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

interface State {
  error: string | null
  redirectTo: string | null
}

export async function loginModerator(prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Моля попълнете всички полета.', redirectTo: null }
  }

  const supabase = createServerClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: 'Грешен имейл или парола.', redirectTo: null }
  }

  const admin = createServiceRoleClient()

  // Check if moderator
  const { data: classData } = await admin
    .from('classes')
    .select('id')
    .eq('moderator_id', authData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (classData) {
    return { error: null, redirectTo: `/moderator/${classData.id}` }
  }

  // Check if parent
  const { data: studentData } = await admin
    .from('students')
    .select('id')
    .eq('parent_user_id', authData.user.id)
    .limit(1)
    .single()

  if (studentData) {
    return { error: null, redirectTo: `/my/${studentData.id}` }
  }

  return { error: null, redirectTo: '/register' }
}
