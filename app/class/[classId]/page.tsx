export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

export default async function ClassEntryPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/class/${classId}`)
  }

  const admin = createServiceRoleClient()

  // Check if this user is the moderator
  const { data: classData } = await admin
    .from('classes')
    .select('id, status')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (classData) {
    // Moderator → go to class home
    redirect(`/class/${classId}/home`)
  }

  // Check if this user is a parent of a student in this class
  const { data: student } = await admin
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .eq('parent_user_id', user.id)
    .single()

  if (student) {
    // Parent → go to their child's profile
    redirect(`/my/${student.id}`)
  }

  // No match → send to class home anyway (visitor)
  redirect(`/class/${classId}/home`)
}
