export interface PDFAnswer {
  question_id?: string
  question_text: string
  question_type?: string | null
  text_content: string | null
  media_url: string | null
  media_type: string | null
  // Resolved at data-fetch time for PDF rendering
  video_thumbnail_url?: string | null
  video_qr_png?: Buffer | null
}

export interface PDFStudentEvent {
  event_title: string
  event_date: string | null
  event_photo_url: string | null
  comment_text: string
}

export interface PDFStudent {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  answers: PDFAnswer[]
  video_qrs: Array<{ question_text: string; qr_png: Buffer | null; url: string }>
  messages: Array<{
    content: string
    author_name: string
  }>
  event_comments: PDFStudentEvent[]
}

export interface PDFPollNominee {
  id: string
  name: string
  votes: number
  pct: number
  photo_url: string | null
}

export interface PDFPoll {
  question: string
  nominees: PDFPollNominee[]
  totalVotes: number
}

export interface PDFVoiceItem {
  text: string
  size: 'lg' | 'md' | 'sm'
  pct: number
}

export interface PDFVoiceQuestion {
  text: string
  items: PDFVoiceItem[]
  display: 'wordcloud' | 'barchart'
}

export interface PDFEventComment {
  student_name: string
  student_photo_url: string | null
  text: string
}

export interface PDFEvent {
  id: string
  title: string
  event_date: string | null
  note: string | null
  photos: string[]
  comments: PDFEventComment[]
}

export interface PDFData {
  /** Rasterized background pattern PNG (A4 595×842). null = no background. */
  bg_pattern_png?: Buffer | null
  preset?: string | null
  starsLabel?: string | null
  memberLabel?: string | null
  groupLabel?: string | null
  coverBlocks?: Array<{ type: string; config: Record<string, unknown> }> | null
  closingBlocks?: Array<{ type: string; config: Record<string, unknown> }> | null
  studentPageBlocks?: Array<{ type: string; config: Record<string, unknown> }> | null
  memoriesBlocks?: Array<{ type: string; config: Record<string, unknown> }> | null
  groupBlocks?: Array<{ type: string; config: Record<string, unknown> }> | null
  classInfo: {
    name: string
    namePart: string
    schoolPart: string | null
    school_year: string
    school_logo_url: string | null
    cover_image_url: string | null
    superhero_image_url: string | null
    superhero_prompt: string | null
  }
  students: PDFStudent[]
  polls: PDFPoll[]
  voice_questions: PDFVoiceQuestion[]
  events: PDFEvent[]
}
