// Service: answers
import { createServerClient } from '@/lib/supabase/server'

export async function getAnswersByClass(classId: string, status?: string) {
  // TODO: fetch answers joined with student + question for moderator queue
}

export async function upsertAnswer(studentId: string, questionId: string, data: {
  text_content?: string
  media_url?: string
  media_type?: 'video' | 'audio'
  status: 'draft' | 'submitted'
}) {
  // TODO: upsert on (student_id, question_id) unique constraint
}

export async function moderateAnswer(answerId: string, action: 'approved' | 'draft', note?: string) {
  // TODO: update status, optionally store rejection note, send email if returning
}
