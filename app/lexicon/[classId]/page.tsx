export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LexiconShell from './LexiconShell'

export default async function LexiconCoverPage({ params }: { params: Promise<{ classId: string }> }) {
  noStore()
  const { classId } = await params
  const admin = createServiceRoleClient()

  // ── Class data ──────────────────────────────────────────────────────
  const { data: classData } = await admin
    .from('classes')
    .select('id, name, school_year, status, superhero_prompt, superhero_image_url, school_logo_url')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') notFound()

  const [namePart, schoolPart] = classData.name.includes(' — ')
    ? classData.name.split(' — ')
    : [classData.name, null]

  // ── Students ────────────────────────────────────────────────────────
  const { data: students } = await admin
    .from('students')
    .select('id, first_name, last_name, photo_url')
    .eq('class_id', classId)
    .order('last_name')

  const studentList = students ?? []

  // ── Teasers: first personal question answers ─────────────────────────
  const { data: firstPersonalQArr } = await admin
    .from('questions')
    .select('id')
    .eq('class_id', classId)
    .eq('type', 'personal')
    .order('order_index')
    .limit(1)

  const teaserMap: Record<string, string> = {}
  if (firstPersonalQArr?.[0]) {
    const { data: teaserAnswers } = await admin
      .from('answers')
      .select('student_id, text_content')
      .eq('question_id', firstPersonalQArr[0].id)
      .eq('status', 'approved')
    for (const a of teaserAnswers ?? []) {
      if (a.text_content) teaserMap[a.student_id] = a.text_content
    }
  }

  // ── Voice answers (word cloud) ───────────────────────────────────────
  const { data: voiceQs } = await admin
    .from('questions')
    .select('id, text')
    .eq('class_id', classId)
    .eq('type', 'class_voice')
    .order('order_index')

  const voiceQIds = (voiceQs ?? []).map(q => q.id)
  const voiceAnswersRaw = voiceQIds.length > 0
    ? ((await admin.from('class_voice_answers').select('question_id, content').eq('class_id', classId).in('question_id', voiceQIds)).data ?? [])
    : []

  const firstVoiceQ = voiceQs?.[0]
  const firstVoiceAnswers = firstVoiceQ
    ? voiceAnswersRaw.filter(a => a.question_id === firstVoiceQ.id).map(a => a.content)
    : []

  const voiceFreq: Record<string, number> = {}
  for (const a of firstVoiceAnswers) {
    const key = a.trim().toLowerCase()
    voiceFreq[key] = (voiceFreq[key] ?? 0) + 1
  }
  const maxFreq = Math.max(...Object.values(voiceFreq), 1)
  const voiceItems = Object.entries(voiceFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([key, count]) => ({
      text: firstVoiceAnswers.find(a => a.trim().toLowerCase() === key) ?? key,
      size: count >= maxFreq * 0.6 ? 'lg' as const : count >= maxFreq * 0.3 ? 'md' as const : 'sm' as const,
    }))

  // ── Polls (bar chart) ─────────────────────────────────────────────────
  const { data: polls } = await admin
    .from('class_polls')
    .select('id, question')
    .eq('class_id', classId)
    .order('order_index')

  const pollIds = (polls ?? []).map(p => p.id)
  const pollVotesRaw = pollIds.length > 0
    ? ((await admin.from('class_poll_votes').select('poll_id, nominee_student_id').in('poll_id', pollIds)).data ?? [])
    : []

  const studentNameMap = new Map(studentList.map(s => [s.id, s.first_name]))

  const pollResults = (polls ?? []).map(poll => {
    const votes = pollVotesRaw.filter(v => v.poll_id === poll.id)
    const countMap: Record<string, number> = {}
    for (const v of votes) countMap[v.nominee_student_id] = (countMap[v.nominee_student_id] ?? 0) + 1
    const total = votes.length
    const nominees = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([sid, count]) => ({
        name: studentNameMap.get(sid) ?? 'Ученик',
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
    return { id: poll.id, question: poll.question, nominees, totalVotes: total }
  }).filter(p => p.nominees.length > 0)

  // ── Events preview ────────────────────────────────────────────────────
  const { data: events } = await admin
    .from('events')
    .select('id, title, event_date, note, photos')
    .eq('class_id', classId)
    .order('order_index')
    .limit(5)

  const eventList = events ?? []

  return (
    <LexiconShell classId={classId} logoUrl={classData.school_logo_url}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="mb-12">
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] md:aspect-[16/7]">
          {classData.superhero_image_url ? (
            <img
              src={classData.superhero_image_url}
              alt={classData.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#3632b7] via-[#504ed0] to-[#855300]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <h2
              className="text-3xl md:text-5xl text-white mb-2 leading-tight"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              {namePart}
              {schoolPart && (
                <span className="text-xl md:text-2xl font-normal opacity-75 ml-3">· {schoolPart}</span>
              )}
            </h2>
            {classData.superhero_prompt && (
              <p
                className="italic text-[#c2c1ff] text-base md:text-lg opacity-90 max-w-xl"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                „{classData.superhero_prompt.slice(0, 130)}{classData.superhero_prompt.length > 130 ? '…' : ''}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Student Gallery ────────────────────────────────────────────── */}
      {studentList.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl text-[#3632b7]" style={{ fontFamily: 'Noto Serif, serif' }}>
              Нашите съученици
            </h3>
            <Link
              href={`/lexicon/${classId}/students`}
              className="text-[#855300] font-semibold text-sm tracking-widest uppercase"
            >
              {studentList.length} ученици
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 -mx-6 px-6">
            {studentList.map(student => {
              const teaser = teaserMap[student.id]
              const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
              return (
                <Link
                  key={student.id}
                  href={`/lexicon/${classId}/student/${student.id}`}
                  className="flex-none w-48 group"
                >
                  <div className="bg-white p-5 rounded-[2.5rem] text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-4 border-[#f4f3f2] ring-2 ring-[#3632b7]/10">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.first_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#e2dfff] flex items-center justify-center">
                          <span className="text-[#3632b7] font-bold text-2xl" style={{ fontFamily: 'Noto Serif, serif' }}>
                            {initials}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-lg text-[#3632b7] mb-1" style={{ fontFamily: 'Noto Serif, serif' }}>
                      {student.first_name} {student.last_name[0]}.
                    </h4>
                    {teaser && (
                      <p className="text-xs text-[#855300] leading-relaxed italic">
                        „{teaser.slice(0, 50)}{teaser.length > 50 ? '…' : ''}"
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Гласът на класа ───────────────────────────────────────────── */}
      {(voiceItems.length > 0 || pollResults.length > 0) && (
        <section className="mb-16">
          <h3 className="text-2xl text-[#3632b7] mb-8" style={{ fontFamily: 'Noto Serif, serif' }}>
            Гласът на класа
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Word cloud */}
            {voiceItems.length > 0 && firstVoiceQ && (
              <div className="bg-[#f4f3f2] p-8 rounded-[2rem] flex flex-col items-center justify-center min-h-[250px]">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#855300] mb-6 text-center">
                  {firstVoiceQ.text}
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-3 text-center">
                  {voiceItems.map((item, i) => (
                    <span
                      key={i}
                      className={
                        item.size === 'lg'
                          ? 'text-base text-[#3632b7]'
                          : item.size === 'md'
                          ? 'text-sm text-[#3632b7]/70'
                          : 'text-sm text-[#855300]/70 italic'
                      }
                      style={{ fontFamily: 'Noto Serif, serif' }}
                    >
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bar chart */}
            {pollResults[0] && (
              <div className="bg-[#f4f3f2] p-8 rounded-[2rem]">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#855300] mb-8">
                  {pollResults[0].question}
                </h4>
                <div className="space-y-5">
                  {pollResults[0].nominees.map((n, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-[#1a1c1c]">{n.name}</span>
                        <span className="text-[#464555]">{n.pct}%</span>
                      </div>
                      <div className="h-3 w-full bg-[#e9e8e7] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${n.pct}%`,
                            background: i === 0 ? '#3632b7' : i === 1 ? '#fea619' : '#3632b7aa',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Нашите спомени (preview) ───────────────────────────────────── */}
      {eventList.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl text-[#3632b7]" style={{ fontFamily: 'Noto Serif, serif' }}>
              Нашите спомени
            </h3>
            <Link href={`/lexicon/${classId}/memories`} className="text-sm text-[#855300] font-semibold hover:underline">
              Виж всички →
            </Link>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {eventList.slice(0, 4).map((event, i) => {
              const photo = event.photos?.[0]
              const rotation = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1'][i % 4]
              if (photo) {
                return (
                  <div key={event.id} className="break-inside-avoid">
                    <div className={`bg-white p-4 shadow-lg ${rotation} transition-transform hover:rotate-0`}>
                      <img src={photo} alt={event.title} className="w-full h-auto mb-4 object-cover" />
                      <p className="italic text-[#1a1c1c]/80 text-sm" style={{ fontFamily: 'Noto Serif, serif' }}>
                        „{event.title}"
                      </p>
                    </div>
                  </div>
                )
              }
              if (event.note) {
                return (
                  <div key={event.id} className="break-inside-avoid">
                    <div className="bg-[#e2dfff] p-8 rounded-[2rem] text-[#3632b7]">
                      <span className="material-symbols-outlined text-4xl mb-4 block">format_quote</span>
                      <blockquote className="text-xl leading-relaxed mb-4" style={{ fontFamily: 'Noto Serif, serif' }}>
                        „{event.note.slice(0, 150)}{event.note.length > 150 ? '…' : ''}"
                      </blockquote>
                      <cite className="text-sm font-bold uppercase tracking-widest not-italic">
                        — {event.title}
                      </cite>
                    </div>
                  </div>
                )
              }
              return (
                <div key={event.id} className="break-inside-avoid">
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
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

    </LexiconShell>
  )
}
