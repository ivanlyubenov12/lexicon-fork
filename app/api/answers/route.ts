import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/answers?classId=&status= — fetch answers (moderator use)
export async function GET(request: NextRequest) {
  console.log('[GET /api/answers] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[GET /api/answers] end')
  return NextResponse.json({ data: [] })
}

// POST /api/answers — save or update an answer (parent use)
export async function POST(request: NextRequest) {
  console.log('[POST /api/answers] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[POST /api/answers] end')
  return NextResponse.json({ data: null }, { status: 201 })
}
