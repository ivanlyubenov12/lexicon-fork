// Service: class voice (anonymous answers)
import { createServerClient } from '@/lib/supabase/server'

export async function submitClassVoiceAnswer(classId: string, questionId: string, content: string) {
  // TODO: insert into class_voice_answers — no student_id (anonymous by design)
}

export async function getClassVoiceAggregated(classId: string, questionId: string) {
  // TODO: SELECT content, COUNT(*) GROUP BY content ORDER BY count DESC
  // Returns word-cloud data
}
