'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'

async function verifyModerator(classId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: cls } = await admin
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()
  if (!cls) redirect('/moderator')
  return admin
}

export async function deleteVoiceAnswer(id: string, classId: string) {
  const admin = await verifyModerator(classId)
  const { error } = await admin.from('class_voice_answers').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/moderator/${classId}/answers`)
  return {}
}

export async function updateVoiceAnswer(id: string, content: string, classId: string) {
  const admin = await verifyModerator(classId)
  const { error } = await admin
    .from('class_voice_answers')
    .update({ content: content.trim() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/moderator/${classId}/answers`)
  return {}
}
