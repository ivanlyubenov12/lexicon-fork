export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import LexiconShell from '@/app/lexicon/[classId]/LexiconShell'

export default async function AdminPreviewMemoriesPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/login')

  const admin = createServiceRoleClient()
  const { data: classData } = await admin.from('classes').select('id, name, school_logo_url, template_id').eq('id', classId).single()
  if (!classData) redirect('/admin/classes')

  const { data: events } = await admin.from('events').select('id, title, event_date, note, photos').eq('class_id', classId).order('order_index')
  const eventList = events ?? []
  const eventIds = eventList.map(e => e.id)

  const { data: comments } = eventIds.length > 0
    ? await admin.from('event_comments').select('id, event_id, comment_text, created_at, student_id, students(first_name, last_name, photo_url)').in('event_id', eventIds).order('created_at')
    : { data: [] }

  type Comment = { id: string; comment_text: string; created_at: string; student_id: string; students: { first_name: string; last_name: string; photo_url: string | null } | null }
  const commentsByEvent: Record<string, Comment[]> = {}
  for (const c of comments ?? []) {
    const raw = c as unknown as Comment & { event_id: string; students: { first_name: string; last_name: string; photo_url: string | null }[] | null }
    const ev: Comment & { event_id: string } = { ...raw, students: Array.isArray(raw.students) ? (raw.students[0] ?? null) : raw.students }
    if (!commentsByEvent[ev.event_id]) commentsByEvent[ev.event_id] = []
    commentsByEvent[ev.event_id].push(ev)
  }

  const basePath = `/admin/classes/${classId}/preview`

  return (
    <LexiconShell classId={classId} logoUrl={classData.school_logo_url} themeId={classData.template_id} basePath={basePath}>
      <section className="mb-16">
        <h3 className="text-2xl text-[#3632b7] mb-8" style={{ fontFamily: 'Noto Serif, serif' }}>Нашите събития</h3>
        {eventList.length === 0 ? (
          <div className="py-32 text-center">
            <span className="material-symbols-outlined text-5xl text-[#e9e8e7] block mb-4">photo_library</span>
            <p className="text-stone-400 font-medium">Все още няма споделени събития.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {eventList.map((event, i) => {
              const rotation = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1'][i % 4]
              const hasPhoto = event.photos && event.photos.length > 0
              const eventComments = commentsByEvent[event.id] ?? []
              if (hasPhoto) return (
                <div key={event.id} className="break-inside-avoid mb-6">
                  <div className={`bg-white p-4 shadow-lg ${rotation} transition-transform hover:rotate-0`}>
                    <img src={event.photos[0]} alt={event.title} className="w-full h-auto mb-4 object-cover" />
                    <p className="italic text-[#1a1c1c]/80 text-sm" style={{ fontFamily: 'Noto Serif, serif' }}>„{event.title}"</p>
                    {event.event_date && <p className="text-xs text-stone-400 mt-1">{new Date(event.event_date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                  </div>
                </div>
              )
              if (event.note) return (
                <div key={event.id} className="break-inside-avoid mb-6">
                  <div className="bg-[#e2dfff] p-8 rounded-[2rem] text-[#3632b7]">
                    <span className="material-symbols-outlined text-4xl mb-4 block">format_quote</span>
                    <blockquote className="text-xl leading-relaxed mb-4" style={{ fontFamily: 'Noto Serif, serif' }}>„{event.note}"</blockquote>
                    <cite className="text-sm font-bold uppercase tracking-widest not-italic">— {event.title}</cite>
                  </div>
                </div>
              )
              return (
                <div key={event.id} className="break-inside-avoid mb-6">
                  <div className="bg-[#ffddb8] p-6 rounded-[2rem]">
                    <span className="material-symbols-outlined text-[#855300] text-2xl mb-3 block">event</span>
                    <p className="font-bold text-[#2a1700] text-lg" style={{ fontFamily: 'Noto Serif, serif' }}>{event.title}</p>
                    {event.event_date && <p className="text-[#855300] text-sm mt-2">{new Date(event.event_date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </LexiconShell>
  )
}
