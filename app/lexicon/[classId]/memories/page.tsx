export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import EventPhotos from './EventPhotos'

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

  const eventIds = eventList.map(e => e.id)
  const { data: rawComments } = eventIds.length > 0
    ? await admin
        .from('event_comments')
        .select('id, event_id, comment_text, created_at, students(first_name, last_name, photo_url)')
        .in('event_id', eventIds)
        .order('created_at')
    : { data: [] }

  type Comment = {
    id: string
    event_id: string
    comment_text: string
    created_at: string
    students: { first_name: string; last_name: string; photo_url: string | null } | null
  }

  const commentsByEvent: Record<string, Comment[]> = {}
  for (const c of rawComments ?? []) {
    const raw = c as unknown as Comment & { students: { first_name: string; last_name: string; photo_url: string | null }[] | null }
    const comment: Comment = {
      ...raw,
      students: Array.isArray(raw.students) ? (raw.students[0] ?? null) : raw.students,
    }
    if (!commentsByEvent[comment.event_id]) commentsByEvent[comment.event_id] = []
    commentsByEvent[comment.event_id].push(comment)
  }

  return (
    <section className="mb-16">
      {eventList.length === 0 ? (
        <div className="py-32 text-center">
          <span className="material-symbols-outlined text-5xl text-[#e9e8e7] block mb-4">photo_library</span>
          <p className="text-stone-400 font-medium">Все още няма споделени събития.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {eventList.map((event) => {
            const photos: string[] = event.photos ?? []
            const eventComments = commentsByEvent[event.id] ?? []

            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Event header */}
                <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
                    {event.title}
                  </h3>
                  {event.event_date && (
                    <p className="text-xs text-stone-400 shrink-0 pt-1">
                      {new Date(event.event_date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
                {event.note && (
                  <p className="text-sm text-gray-500 px-6 pb-3 leading-relaxed">{event.note}</p>
                )}

                <EventPhotos photos={photos} />

                {/* Comments */}
                {eventComments.length > 0 && (
                  <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-50 pt-4">
                    {eventComments.map((c) => (
                      <div key={c.id} className="flex items-start gap-3">
                        {c.students?.photo_url ? (
                          <img
                            src={c.students.photo_url}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0 mt-0.5">
                            {c.students ? c.students.first_name[0] : '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {c.students ? `${c.students.first_name} ${c.students.last_name}` : 'Анонимен'}
                          </p>
                          <p className="text-sm text-gray-600 leading-snug mt-0.5">{c.comment_text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
