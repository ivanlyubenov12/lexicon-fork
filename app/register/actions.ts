'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

interface State {
  error: string | null
  redirectTo: string | null
}

export async function registerModerator(prevState: State, formData: FormData): Promise<State> {
  console.log('[registerModerator] start')

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const tos = formData.get('tos')

  if (!tos) {
    return { error: 'Трябва да приемете условията за ползване.', redirectTo: null }
  }

  if (!email || !password) {
    return { error: 'Моля попълнете всички полета.', redirectTo: null }
  }

  if (password.length < 6) {
    return { error: 'Паролата трябва да е поне 6 символа.', redirectTo: null }
  }

  const supabase = createServerClient()

  // 1. Create account
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

  if (authError) {
    console.log('[registerModerator] auth error:', authError.message)
    if (authError.message.toLowerCase().includes('already registered')) {
      return { error: 'Вече има акаунт с този имейл. Опитайте да влезете.', redirectTo: null }
    }
    return { error: 'Регистрацията не успя. Опитайте отново.', redirectTo: null }
  }

  if (!authData.user) {
    return { error: 'Регистрацията не успя. Опитайте отново.', redirectTo: null }
  }

  // 2. Sign in immediately to get a session (works when email confirmation is OFF)
  await supabase.auth.signInWithPassword({ email, password })

  // 3. Create class in draft status using service role (bypasses RLS — safe on server)
  const adminClient = createServiceRoleClient()
  const { data: classData, error: classError } = await adminClient
    .from('classes')
    .insert({
      moderator_id: authData.user.id,
      name: '',
      school_year: '',
      status: 'draft',
    })
    .select('id')
    .single()

  if (classError || !classData) {
    console.log('[registerModerator] class error:', classError?.message)
    return { error: 'Акаунтът е създаден, но класът не успя да се запази. Опитайте отново.', redirectTo: null }
  }

  console.log('[registerModerator] success — classId:', classData.id)

  return { error: null, redirectTo: `/moderator/${classData.id}` }
}
