import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/classes — list classes for the current moderator
export async function GET() {
  console.log('[GET /api/classes] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[GET /api/classes] end')
  return NextResponse.json({ data: [] })
}

// POST /api/classes — create a new class (called on moderator registration)
export async function POST(request: NextRequest) {
  console.log('[POST /api/classes] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[POST /api/classes] end')
  return NextResponse.json({ data: null }, { status: 201 })
}
