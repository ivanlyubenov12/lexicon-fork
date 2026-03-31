'use server'

import { createServerClient as _createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface State {
  error: string | null
  redirectTo: string | null
}

export async function loginModerator(prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rememberMe = formData.get('rememberMe') === 'on'

  if (!email || !password) {
    return { error: 'Моля попълнете всички полета.', redirectTo: null }
  }

  const cookieStore = await cookies()
  const supabase = _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts = rememberMe ? options : { ...options, maxAge: undefined, expires: undefined }
            cookieStore.set(name, value, opts)
          })
        },
      },
    }
  )

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    const msg = authError?.message ?? ''
    if (msg.includes('Email not confirmed')) {
      return { error: 'Имейлът не е потвърден. Проверете пощата си.', redirectTo: null }
    }
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
      return { error: 'Имейлът или паролата са грешни. Опитайте отново.', redirectTo: null }
    }
    if (msg.includes('too many requests') || msg.includes('rate limit')) {
      return { error: 'Твърде много опити. Изчакайте малко и опитайте отново.', redirectTo: null }
    }
    return { error: 'Нещо се обърка. Опитайте отново.', redirectTo: null }
  }

  // Check if admin first — takes priority over all other roles
  if (authData.user.email === process.env.ADMIN_EMAIL) {
    return { error: null, redirectTo: '/admin' }
  }

  const admin = createServiceRoleClient()

  // Check if moderator (has any class)
  const { data: classData } = await admin
    .from('classes')
    .select('id')
    .eq('moderator_id', authData.user.id)
    .limit(1)
    .single()

  if (classData) {
    return { error: null, redirectTo: '/moderator' }
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

  // Fall back to role stored in user_metadata at registration
  const metaRole = authData.user.user_metadata?.role
  if (metaRole === 'student') {
    return { error: null, redirectTo: '/my' }
  }

  // Moderator with no class yet (or unknown role)
  return { error: null, redirectTo: '/moderator' }
}
