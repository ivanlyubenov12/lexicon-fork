import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// GET /auth/callback — handles magic link (token_hash) and OAuth (code) flows for moderators
// Parents no longer use this route — they register/login directly on /join/[invite_token]
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  const supabase = createServerClient()

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (error) return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_token`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login?error=auth_failed`)

  const admin = createServiceRoleClient()

  // Moderator with a class
  const { data: classData } = await admin
    .from('classes')
    .select('id')
    .eq('moderator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (classData) return NextResponse.redirect(`${origin}/moderator/${classData.id}`)

  // Parent with a linked student
  const { data: studentData } = await admin
    .from('students')
    .select('id')
    .eq('parent_user_id', user.id)
    .single()

  if (studentData) return NextResponse.redirect(`${origin}/my/${studentData.id}`)

  // Admin
  if (user.email === process.env.ADMIN_EMAIL) return NextResponse.redirect(`${origin}/admin`)

  // Moderator with no class yet
  return NextResponse.redirect(`${origin}/moderator`)
}
