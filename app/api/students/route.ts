import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/students?classId= — list students for a class
export async function GET(request: NextRequest) {
  console.log('[GET /api/students] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[GET /api/students] end')
  return NextResponse.json({ data: [] })
}

// POST /api/students — add a student to a class
export async function POST(request: NextRequest) {
  console.log('[POST /api/students] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[POST /api/students] end')
  return NextResponse.json({ data: null }, { status: 201 })
}
