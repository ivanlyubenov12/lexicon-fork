import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/invites/[token] — validate token, return student info for the join page
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createServerClient()
  // TODO: look up student by invite_token, check not expired
  return NextResponse.json({ data: null })
}

// POST /api/invites/[token] — accept invite: link parent_user_id to student, set invite_accepted_at
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createServerClient()
  // TODO: implement
  return NextResponse.json({ data: null })
}
