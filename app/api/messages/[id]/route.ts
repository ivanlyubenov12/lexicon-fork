import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/messages/[id] — approve or reject a peer message (moderator)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PATCH /api/messages/${params.id}] start`)
  const supabase = createServerClient()
  // TODO: implement
  console.log(`[PATCH /api/messages/${params.id}] end`)
  return NextResponse.json({ data: null })
}
