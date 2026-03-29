export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

async function summarizeComments(eventTitle: string, comments: string[]): Promise<string> {
  if (comments.length === 0) return ''
  try {
    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `Обобщи следните коментари на деца за събитието „${eventTitle}" в едно-две забавни и топли изречения на български. Пиши в детски, жизнерадостен стил. Не повече от 280 знака. Без кавички в началото и края. Може да включиш 1-2 подходящи емоджи:\n\n${comments.slice(0, 20).join('\n')}`,
      }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    return text.slice(0, 300)
  } catch {
    // Fallback: pick 2 random comments
    const picks = comments.sort(() => Math.random() - 0.5).slice(0, 2)
    return picks.map(c => `„${c}"`).join(' · ').slice(0, 300)
  }
}

export default async function LexiconMemoriesPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  const { data: events } = await admin
    .from('events')
    .select('id, title, event_date, note, photos')
    .eq('class_id', classId)
    .order('order_index')

  const eventList = events ?? []

  // Fetch all comments for these events, joined with student name
  const eventIds = eventList.map(e => e.id)
  const { data: comments } = eventIds.length > 0
    ? await admin
        .from('event_comments')
        .select('id, event_id, comment_text, created_at, student_id, students(first_name, last_name, photo_url)')
        .in('event_id', eventIds)
        .order('created_at')
    : { data: [] }

  // Group comments by event_id
  type Comment = {
    id: string
    comment_text: string
    created_at: string
    student_id: string
    students: { first_name: string; last_name: string; photo_url: string | null } | null
  }
  const commentsByEvent: Record<string, Comment[]> = {}
  for (const c of comments ?? []) {
    const raw = c as unknown as Comment & { event_id: string; students: { first_name: string; last_name: string; photo_url: string | null }[] | null }
    const ev: Comment & { event_id: string } = {
      ...raw,
      students: Array.isArray(raw.students) ? (raw.students[0] ?? null) : raw.students,
    }
    if (!commentsByEvent[ev.event_id]) commentsByEvent[ev.event_id] = []
    commentsByEvent[ev.event_id].push(ev)
  }

  // Generate summaries for all events that have comments
  const summaries: Record<string, string> = {}
  await Promise.all(
    eventList.map(async (event) => {
      const ec = commentsByEvent[event.id] ?? []
      if (ec.length > 0) {
        summaries[event.id] = await summarizeComments(event.title, ec.map(c => c.comment_text))
      }
    })
  )

  return (
    <section className="mb-16">
        <h3 className="text-2xl text-[#3632b7] mb-8" style={{ fontFamily: 'Noto Serif, serif' }}>
          Нашите събития
        </h3>

        {eventList.length === 0 ? (
          <div className="py-32 text-center">
            <span className="material-symbols-outlined text-5xl text-[#e9e8e7] block mb-4">photo_library</span>
            <p className="text-stone-400 font-medium">Все още няма споделени събития.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {eventList.map((event, i) => {
              const rotation = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1'][i % 4]
              const hasPhoto = event.photos && event.photos.length > 0
              const eventComments = commentsByEvent[event.id] ?? []

              if (hasPhoto) {
                const photoUrl = event.photos[0]
                return (
                  <div key={event.id}>
                    <div className={`bg-white p-4 shadow-lg ${rotation} transition-transform hover:rotate-0`}>
                      <img src={photoUrl} alt={event.title} className="w-full h-auto mb-4 object-cover" />
                      <p className="italic text-[#1a1c1c]/80 text-sm" style={{ fontFamily: 'Noto Serif, serif' }}>
                        „{event.title}"
                      </p>
                      {event.event_date && (
                        <p className="text-xs text-stone-400 mt-1">
                          {new Date(event.event_date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {summaries[event.id] && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
                            {summaries[event.id]}
                          </p>
                          <p className="text-[10px] text-gray-300 mt-1">{eventComments.length} коментара от класа</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              if (event.note) {
                return (
                  <div key={event.id} className="">
                    <div className="bg-[#e2dfff] p-8 rounded-[2rem] text-[#3632b7]">
                      <span className="material-symbols-outlined text-4xl mb-4 block">format_quote</span>
                      <blockquote className="text-xl leading-relaxed mb-4" style={{ fontFamily: 'Noto Serif, serif' }}>
                        „{event.note}"
                      </blockquote>
                      <cite className="text-sm font-bold uppercase tracking-widest not-italic">
                        — {event.title}
                      </cite>
                      {event.event_date && (
                        <p className="text-xs text-[#3632b7]/60 mt-3">
                          {new Date(event.event_date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {summaries[event.id] && (
                        <div className="mt-4 pt-3 border-t border-[#3632b7]/20">
                          <p className="text-xs text-[#3632b7]/70 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
                            {summaries[event.id]}
                          </p>
                          <p className="text-[10px] text-[#3632b7]/30 mt-1">{eventComments.length} коментара от класа</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <div key={event.id} className="">
                  <div className="bg-[#ffddb8] p-6 rounded-[2rem]">
                    <span className="material-symbols-outlined text-[#855300] text-2xl mb-3 block">event</span>
                    <p className="font-bold text-[#2a1700] text-lg" style={{ fontFamily: 'Noto Serif, serif' }}>
                      {event.title}
                    </p>
                    {event.event_date && (
                      <p className="text-[#855300] text-sm mt-2">
                        {new Date(event.event_date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                    {summaries[event.id] && (
                      <div className="mt-4 pt-3 border-t border-[#855300]/20">
                        <p className="text-xs text-[#2a1700]/60 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
                          {summaries[event.id]}
                        </p>
                        <p className="text-[10px] text-[#855300]/30 mt-1">{eventComments.length} коментара от класа</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
  )
}
