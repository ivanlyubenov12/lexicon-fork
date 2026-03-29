// Shared TypeScript types — mirrors the database schema

export type ClassStatus = 'draft' | 'filling' | 'unpublished' | 'published'
export type UserRole = 'admin' | 'moderator' | 'parent'
export type AnswerStatus = 'draft' | 'submitted' | 'approved'
export type MessageStatus = 'pending' | 'approved' | 'rejected'
export type MediaType = 'video' | 'audio'
export type QuestionType = 'personal' | 'class_voice' | 'better_together' | 'superhero' | 'video' | 'photo'

export interface Class {
  id: string
  moderator_id: string
  name: string
  school_year: string
  status: ClassStatus
  stripe_payment_id: string | null
  finalized_at: string | null
  superhero_prompt: string | null
  superhero_image_url: string | null
  created_at: string
}

export interface Student {
  id: string
  class_id: string
  parent_user_id: string | null
  first_name: string
  last_name: string
  photo_url: string | null
  invite_token: string
  invite_accepted_at: string | null
  created_at: string
}

export interface Question {
  id: string
  class_id: string | null  // null = system question for all classes
  text: string
  type: QuestionType
  is_system: boolean
  allows_text: boolean
  allows_media: boolean
  order_index: number
  created_at: string
}

export interface Answer {
  id: string
  student_id: string
  question_id: string
  text_content: string | null
  media_url: string | null
  media_type: MediaType | null
  status: AnswerStatus
  updated_at: string
}

export interface PeerMessage {
  id: string
  recipient_student_id: string
  author_student_id: string
  content: string
  status: MessageStatus
  moderated_at: string | null
  created_at: string
}

export interface ClassVoiceAnswer {
  id: string
  class_id: string
  question_id: string
  content: string
  created_at: string
}
