import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// GET /auth/callback — handles both magic link (token_hash) and OAuth (code) flows
// ?token_hash=xxx&type=magiclink&studentId=xxx  ← magic link
// ?code=xxx                                      ← OAuth / PKCE
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const studentId = searchParams.get('studentId')

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  const supabase = createServerClient()

  if (token_hash && type) {
    // Magic link / OTP flow
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  } else if (code) {
    // OAuth / PKCE flow
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_token`)
  }

  // Reconstruct user object for downstream use
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // If this is a join flow — link student to parent
  if (studentId) {
    const admin = createServiceRoleClient()

    // Only link if not already linked
    const { data: student } = await admin
      .from('students')
      .select('id, parent_user_id, invite_accepted_at')
      .eq('id', studentId)
      .single()

    if (student && !student.invite_accepted_at) {
      await admin
        .from('students')
        .update({
          parent_user_id: user.id,
          invite_accepted_at: new Date().toISOString(),
        })
        .eq('id', studentId)
    }

    return NextResponse.redirect(`${origin}/my/${studentId}`)
  }

  // For regular login (magic link from /login page) — redirect based on role
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id')
    .eq('moderator_id', user.id)
    .single()

  if (classData) {
    return NextResponse.redirect(`${origin}/moderator/${classData.id}`)
  }

  const { data: studentData } = await admin
    .from('students')
    .select('id')
    .eq('parent_user_id', user.id)
    .single()

  if (studentData) {
    return NextResponse.redirect(`${origin}/my/${studentData.id}`)
  }

  return NextResponse.redirect(`${origin}/login`)
}
