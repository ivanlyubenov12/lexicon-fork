'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function loginFromJoin(
  prevState: { error: string | null; redirectTo: string | null },
  formData: FormData
): Promise<{ error: string | null; redirectTo: string | null }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const studentId = formData.get('studentId') as string

  const supabase = createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: 'Грешна парола. Опитайте отново.', redirectTo: null }
  }

  return { error: null, redirectTo: `/my/${studentId}` }
}

interface State {
  error: string | null
  redirectTo: string | null
}

export async function acceptInvite(prevState: State, formData: FormData): Promise<State> {
  const studentId = formData.get('studentId') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!studentId || !email || !password) {
    return { error: 'Моля попълнете всички полета.', redirectTo: null }
  }

  if (password.length < 6) {
    return { error: 'Паролата трябва да е поне 6 символа.', redirectTo: null }
  }

  const supabase = createServerClient()

  // 1. Try to sign up — if user already exists, fall through to sign in
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })

  let userId: string | null = null

  if (signUpError) {
    // User likely already exists — attempt sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError || !signInData.user) {
      return { error: 'Не може да влезете. Проверете паролата.', redirectTo: null }
    }
    userId = signInData.user.id
  } else if (signUpData.user) {
    userId = signUpData.user.id
    // 2. Sign in immediately to establish a session
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      console.log('[acceptInvite] signIn failed:', signInError.message)
      return { error: 'Акаунтът е създаден, но влизането не успя. Моля изключете потвърждението на имейл в Supabase → Authentication → Email → Confirm email → OFF', redirectTo: null }
    }
  } else {
    return { error: 'Регистрацията не успя. Опитайте отново.', redirectTo: null }
  }

  // 3. Update student record with parent_user_id and invite_accepted_at
  const admin = createServiceRoleClient()
  const { error: updateError } = await admin
    .from('students')
    .update({
      parent_user_id: userId,
      invite_accepted_at: new Date().toISOString(),
    })
    .eq('id', studentId)

  if (updateError) {
    return { error: 'Профилът не успя да се свърже. Опитайте отново.', redirectTo: null }
  }

  return { error: null, redirectTo: `/my/${studentId}` }
}
