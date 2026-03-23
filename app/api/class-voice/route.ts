import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/class-voice?classId=&questionId= — fetch aggregated word-cloud data
export async function GET(request: NextRequest) {
  console.log('[GET /api/class-voice] start')
  const supabase = createServerClient()
  // TODO: implement — GROUP BY content, COUNT(*)
  console.log('[GET /api/class-voice] end')
  return NextResponse.json({ data: [] })
}

// POST /api/class-voice — submit an anonymous answer (parent use, no student_id stored)
export async function POST(request: NextRequest) {
  console.log('[POST /api/class-voice] start')
  const supabase = createServerClient()
  // TODO: implement
  console.log('[POST /api/class-voice] end')
  return NextResponse.json({ data: null }, { status: 201 })
}
