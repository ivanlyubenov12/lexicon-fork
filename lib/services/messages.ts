// Service: peer messages
import { createServerClient } from '@/lib/supabase/server'

export async function getPendingMessages(classId: string) {
  // TODO: fetch peer_messages with status: pending for moderator queue
}

export async function submitMessage(data: {
  recipient_student_id: string
  author_student_id: string
  content: string
}) {
  // TODO: insert with status: pending
}

export async function moderateMessage(messageId: string, action: 'approved' | 'rejected') {
  // TODO: update status + set moderated_at
}
