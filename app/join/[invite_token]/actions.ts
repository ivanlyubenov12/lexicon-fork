'use server'

import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function sendJoinMagicLink(
  inviteToken: string,
  email: string,
): Promise<{ error: string | null }> {
  const admin = createServiceRoleClient()
  const { data: student } = await admin
    .from('students')
    .select('id')
    .eq('invite_token', inviteToken)
    .single()

  if (!student) return { error: 'Невалиден линк.' }

  const supabase = createServerClient()
  const siteUrl  =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?invite_token=${inviteToken}`,
      shouldCreateUser: true,
    },
  })

  if (error) return { error: 'Изпращането не успя. Опитайте отново.' }
  return { error: null }
}

interface State {
  error: string | null
  redirectTo: string | null
}

// Link student to user if not already linked
async function linkStudent(studentId: string, userId: string) {
  const admin = createServiceRoleClient()
  const { data: student } = await admin
    .from('students')
    .select('invite_accepted_at')
    .eq('id', studentId)
    .single()

  if (!student?.invite_accepted_at) {
    await admin
      .from('students')
      .update({ parent_user_id: userId, invite_accepted_at: new Date().toISOString() })
      .eq('id', studentId)
  }
}

// First-time registration — creates the Supabase user with confirmed email
export async function registerParent(prevState: State, formData: FormData): Promise<State> {
  const email    = (formData.get('email')    as string).trim()
  const password = (formData.get('password') as string)
  const confirm  = (formData.get('confirm')  as string)
  const studentId = formData.get('studentId') as string

  if (!email || !password) return { error: 'Моля попълнете всички полета.', redirectTo: null }
  if (password.length < 6)  return { error: 'Паролата трябва да е поне 6 символа.', redirectTo: null }
  if (password !== confirm)  return { error: 'Паролите не съвпадат.', redirectTo: null }

  const admin   = createServiceRoleClient()
  const supabase = createServerClient()

  // Create user with email already confirmed (no confirmation email needed)
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    // User already exists — tell them to log in instead
    if (createError.message.toLowerCase().includes('already')) {
      return { error: 'Вече имате профил с този имейл. Използвайте формата за вход по-долу.', redirectTo: null }
    }
    return { error: createError.message, redirectTo: null }
  }

  // Sign in to get a session (admin.createUser doesn't create a session)
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) return { error: 'Регистрацията успя, но влизането се провали. Опитайте да влезете.', redirectTo: null }

  await linkStudent(studentId, created.user.id)
  return { error: null, redirectTo: `/my/${studentId}` }
}

// Login for returning parents (or second-child invites)
export async function loginFromJoin(prevState: State, formData: FormData): Promise<State> {
  const email     = (formData.get('email')    as string).trim()
  const password  = (formData.get('password') as string)
  const studentId = formData.get('studentId') as string

  const supabase = createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) return { error: 'Грешна парола. Опитайте отново.', redirectTo: null }

  // Link this student too (covers the multi-child case)
  await linkStudent(studentId, data.user.id)
  return { error: null, redirectTo: `/my/${studentId}` }
}
