// Service: students
import { createServerClient } from '@/lib/supabase/server'

export async function getStudentsByClass(classId: string) {
  // TODO: fetch all students for the class
}

export async function addStudent(classId: string, data: {
  first_name: string
  last_name: string
  parent_email: string
  photo_url?: string
}) {
  // TODO: insert student with a unique invite_token (uuid)
}

export async function acceptInvite(token: string, parentUserId: string) {
  // TODO: find student by invite_token, set parent_user_id + invite_accepted_at
}
