import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/students/[id] — update student info
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[PATCH /api/students/${params.id}] start`)
  const supabase = createServerClient()
  // TODO: implement
  console.log(`[PATCH /api/students/${params.id}] end`)
  return NextResponse.json({ data: null })
}

// DELETE /api/students/[id] — remove a student from the class
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[DELETE /api/students/${params.id}] start`)
  const supabase = createServerClient()
  // TODO: implement
  console.log(`[DELETE /api/students/${params.id}] end`)
  return NextResponse.json({ data: null })
}
