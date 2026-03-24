import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/students/[id] — update student info
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()
  // TODO: implement
  return NextResponse.json({ data: null })
}

// DELETE /api/students/[id] — remove a student from the class
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()
  // TODO: implement
  return NextResponse.json({ data: null })
}
