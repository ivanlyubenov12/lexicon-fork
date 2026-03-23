import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/answers/[id] — approve / return answer (moderator), or update draft (parent)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PATCH /api/answers/${params.id}] start`)
  const supabase = createServerClient()
  // TODO: implement
  console.log(`[PATCH /api/answers/${params.id}] end`)
  return NextResponse.json({ data: null })
}
