import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/invites/[token] — validate token, return student info for the join page
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  console.log(`[GET /api/invites/${params.token}] start`)
  const supabase = createServerClient()
  // TODO: look up student by invite_token, check not expired
  console.log(`[GET /api/invites/${params.token}] end`)
  return NextResponse.json({ data: null })
}

// POST /api/invites/[token] — accept invite: link parent_user_id to student, set invite_accepted_at
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  console.log(`[POST /api/invites/${params.token}] start`)
  const supabase = createServerClient()
  // TODO: implement
  console.log(`[POST /api/invites/${params.token}] end`)
  return NextResponse.json({ data: null })
}
