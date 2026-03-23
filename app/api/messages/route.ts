import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/messages?classId=&status= — fetch peer messages (moderator use)
export async function GET(request: NextRequest) {
  console.log('[GET /api/messages] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[GET /api/messages] end')
  return NextResponse.json({ data: [] })
}

// POST /api/messages — submit a peer message (parent use) → status: pending
export async function POST(request: NextRequest) {
  console.log('[POST /api/messages] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[POST /api/messages] end')
  return NextResponse.json({ data: null }, { status: 201 })
}
