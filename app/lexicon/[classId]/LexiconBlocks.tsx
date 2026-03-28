import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Block } from '@/lib/templates/types'

function cardRotation(id: string): string {
  const n = parseInt(id.replace(/-/g, '').slice(0, 4), 16) % 7
  return `rotate(${n - 3}deg)` // deterministic -3..+3 deg per student
}

// ── Exported data types ────────────────────────────────────────────────────

export interface QuestionAnswer {
  id: string
  student_id: string
  text_content: string | null
  media_url: string | null
  media_type: string | null
  student: { first_name: string; last_name: string; photo_url: string | null } | null
}

export interface VoiceItem {
  text: string
  size: 'lg' | 'md' | 'sm'
  pct: number
}

export interface LexiconData {
  classId: string
  classData: {
    name: string
    superhero_prompt?: string | null
    superhero_image_url?: string | null
    cover_image_url?: string | null
  }
  namePart: string
  schoolPart: string | null
  studentList: { id: string; first_name: string; last_name: string; photo_url?: string | null }[]
  teaserMap: Record<string, string>
  /** questionId → { text, answers[] } */
  questionData: Record<string, { text: string; answers: QuestionAnswer[] }>
  /** questionId → { text, items[], display } */
  voiceData: Record<string, { text: string; items: VoiceItem[]; display: 'wordcloud' | 'barchart' }>
  /** pollId → { question, nominees[], totalVotes } */
  pollData: Record<string, { question: string; nominees: { studentId: string; name: string; pct: number; photoUrl: string | null }[]; totalVotes: number }>
  eventList: { id: string; title: string; event_date?: string | null; note?: string | null; photos?: string[] | null }[]
}

// ── Block renderers ────────────────────────────────────────────────────────

function HeroBlock({ data }: { data: LexiconData }) {
  const { classData, namePart, schoolPart } = data
  return (
    <section className="mb-12">
      <div className="relative overflow-hidden shadow-2xl aspect-[4/3] md:aspect-[16/7]" style={{ borderRadius: 'var(--lex-radius)' }}>
        {(classData.cover_image_url ?? classData.superhero_image_url) ? (
          <img src={(classData.cover_image_url ?? classData.superhero_image_url)!} alt={classData.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'var(--lex-hero-grad)' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h2 className="text-3xl md:text-5xl text-white mb-2 leading-tight" style={{ fontFamily: 'Noto Serif, serif' }}>
            {namePart}
            {schoolPart && <span className="text-xl md:text-2xl font-normal opacity-75 ml-3">· {schoolPart}</span>}
          </h2>
          {classData.superhero_prompt && (
            <p className="text-base md:text-lg opacity-90 max-w-xl italic" style={{ fontFamily: 'Noto Serif, serif', color: 'color-mix(in srgb, var(--lex-primary-light) 90%, white)' }}>
              „{classData.superhero_prompt.slice(0, 130)}{classData.superhero_prompt.length > 130 ? '…' : ''}"
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function SuperheroBlock({ data }: { data: LexiconData }) {
  if (!data.classData.superhero_image_url) return null
  return (
    <section className="mb-12">
      <div className="relative overflow-hidden shadow-2xl aspect-[4/3] md:aspect-[16/7]" style={{ borderRadius: 'var(--lex-radius)' }}>
        <img src={data.classData.superhero_image_url} alt="Супергерой на класа" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {data.classData.superhero_prompt && (
          <div className="absolute bottom-0 left-0 p-8">
            <p className="text-base md:text-lg opacity-90 max-w-xl italic" style={{ fontFamily: 'Noto Serif, serif', color: 'color-mix(in srgb, var(--lex-primary-light) 90%, white)' }}>
              „{data.classData.superhero_prompt}"
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function StudentsGridBlock({ data, config, basePath }: { data: LexiconData; config: Record<string, unknown>; basePath?: string }) {
  const { classId, studentList } = data
  const base = basePath ?? `/lexicon/${classId}`
  if (studentList.length === 0) return null

  // Show preview of first 8, link out for all
  const preview = studentList.slice(0, 8)

  return (
    <section className="mb-20">
      {/* Header — editorial asymmetric */}
      <div className="flex items-baseline justify-between mb-14">
        <h3
          className="font-headline font-bold text-on-surface leading-none"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
        >
          Учениците
        </h3>
        <Link
          href={`${base}/students`}
          className="text-xs font-bold tracking-[0.25em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-200"
        >
          {studentList.length} ученици →
        </Link>
      </div>

      {/* Magazine grid — alternating vertical offsets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-14 gap-x-8">
        {preview.map((student, i) => {
          const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
          const rotation = cardRotation(student.id)
          // columns 2 and 4 (index 1 and 3 in a row of 4) get a vertical offset
          const isOffset = i % 4 === 1 || i % 4 === 3
          return (
            <Link
              key={student.id}
              href={`${base}/student/${student.id}`}
              className={`group relative pt-5 transition-transform duration-300 hover:-translate-y-2 ${isOffset ? 'lg:mt-10' : ''}`}
            >
              {/* Washi tape */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 tape-overlay z-10 pointer-events-none" />

              {/* Polaroid */}
              <div
                className="bg-surface-container-lowest p-3 polaroid-frame transition-transform duration-500 group-hover:rotate-0"
                style={{ transform: rotation }}
              >
                <div className="aspect-[4/5] overflow-hidden bg-surface-container">
                  {student.photo_url ? (
                    <img
                      src={student.photo_url}
                      alt={student.first_name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                      <span className="font-headline text-2xl font-bold text-on-surface-variant">{initials}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pb-1">
                  <h4 className="font-headline text-base font-bold text-on-surface leading-tight">
                    {student.first_name} {student.last_name}
                  </h4>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function QuestionBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const qid = config.questionId as string | null
  const layout = (config.layout as string) ?? 'grid'

  if (!qid) return <PlaceholderBlock icon="quiz" text="Избери въпрос от редактора на лексикона" color="primary" />

  const q = data.questionData[qid]
  if (!q) return <PlaceholderBlock icon="quiz" text="Въпросът не е намерен или няма одобрени отговори" color="primary" />
  if (q.answers.length === 0) return (
    <section className="mb-16">
      <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{q.text}</h3>
      <PlaceholderBlock icon="quiz" text="Все още няма одобрени отговори" color="primary" />
    </section>
  )

  return (
    <section className="mb-16">
      <h3 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{q.text}</h3>

      {layout === 'list' && (
        <div className="space-y-4">
          {q.answers.map(a => (
            <AnswerCard key={a.id} answer={a} />
          ))}
        </div>
      )}

      {layout === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {q.answers.map(a => (
            <AnswerCard key={a.id} answer={a} />
          ))}
        </div>
      )}

      {layout === 'masonry' && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {q.answers.map(a => (
            <div key={a.id} className="break-inside-avoid">
              <AnswerCard answer={a} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function AnswerCard({ answer }: { answer: QuestionAnswer }) {
  const s = answer.student
  const initials = s ? `${s.first_name[0]}${s.last_name[0]}`.toUpperCase() : '?'
  return (
    <div className="p-5" style={{ backgroundColor: 'var(--lex-surface)', borderRadius: 'var(--lex-radius)' }}>
      {answer.media_url && (answer.media_type?.startsWith('image') ?? true) && (
        <img src={answer.media_url} alt="" className="w-full rounded-xl mb-4 object-cover max-h-64" />
      )}
      {answer.text_content && (
        <p className="text-base leading-relaxed mb-4" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-text)' }}>
          „{answer.text_content}"
        </p>
      )}
      {s && (
        <div className="flex items-center gap-2 mt-4 pt-0">
          <div className="w-7 h-7 rounded-full overflow-hidden flex-none" style={{ backgroundColor: 'var(--lex-primary-light)' }}>
            {s.photo_url
              ? <img src={s.photo_url} alt={s.first_name} className="w-full h-full object-cover" />
              : <span className="text-[10px] font-bold flex items-center justify-center h-full" style={{ color: 'var(--lex-primary)' }}>{initials}</span>
            }
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--lex-muted)' }}>
            {s.first_name} {s.last_name[0]}.
          </span>
        </div>
      )}
    </div>
  )
}

function PhotoGalleryBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const qid = config.questionId as string | null
  const columns = (config.columns as number) ?? 3

  if (!qid) return <PlaceholderBlock icon="photo_library" text="Избери въпрос с медия отговори от редактора" color="secondary" />

  const q = data.questionData[qid]
  const mediaAnswers = (q?.answers ?? []).filter(a => a.media_url)

  if (!q || mediaAnswers.length === 0) return <PlaceholderBlock icon="photo_library" text="Все още няма одобрени снимки за този въпрос" color="secondary" />

  const colClass = columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'

  return (
    <section className="mb-16">
      <h3 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{q.text}</h3>
      <div className={`grid ${colClass} gap-3`}>
        {mediaAnswers.map(a => (
          <div key={a.id} className="overflow-hidden" style={{ borderRadius: 'var(--lex-radius)' }}>
            <img src={a.media_url!} alt="" className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
      </div>
    </section>
  )
}

const CLOUD_COLORS = [
  'var(--lex-primary)',
  'var(--lex-secondary)',
  '#e11d48',  // rose
  '#d97706',  // amber
  '#059669',  // emerald
  '#7c3aed',  // violet
  '#0891b2',  // cyan
  '#be185d',  // pink
  '#15803d',  // green
  '#b45309',  // yellow-brown
]

function WordCloudView({ items, title }: { items: VoiceItem[]; title: string }) {
  return (
    <section className="mb-16">
      <h3 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{title}</h3>
      <div className="px-8 py-10 flex flex-col items-center justify-center min-h-[200px]" style={{ backgroundColor: 'var(--lex-card)', borderRadius: 'var(--lex-radius)' }}>
        <div className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-3 text-center">
          {items.map((item, i) => (
            <span key={i} style={{
              fontFamily: 'Noto Serif, serif',
              fontSize: item.size === 'lg' ? '2rem' : item.size === 'md' ? '1.35rem' : '0.95rem',
              fontWeight: item.size === 'lg' ? 700 : item.size === 'md' ? 600 : 400,
              fontStyle: item.size === 'sm' ? 'italic' : 'normal',
              lineHeight: 1.2,
              color: item.size === 'sm'
                ? `color-mix(in srgb, ${CLOUD_COLORS[i % CLOUD_COLORS.length]} 55%, transparent)`
                : CLOUD_COLORS[i % CLOUD_COLORS.length],
            }}>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function BarChartView({ items, title }: { items: VoiceItem[]; title: string }) {
  const top3 = items.slice(0, 3)
  const maxPct = top3[0]?.pct ?? 1
  const BAR_COLORS = ['var(--lex-primary)', 'var(--lex-secondary)', '#d97706']

  return (
    <section className="mb-16">
      <h3 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{title}</h3>
      <div className="p-8 space-y-6" style={{ backgroundColor: 'var(--lex-card)', borderRadius: 'var(--lex-radius)' }}>
        {top3.map((item, i) => {
          const relativeWidth = maxPct > 0 ? Math.round((item.pct / maxPct) * 100) : 0
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--lex-muted)' }}>{i + 1}</span>
                <span className="text-sm font-semibold" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-text)' }}>
                  {item.text}
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden ml-7" style={{ backgroundColor: 'color-mix(in srgb, var(--lex-primary) 10%, transparent)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${relativeWidth}%`, backgroundColor: BAR_COLORS[i] }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ClassVoiceBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const qid = config.questionId as string | null
  if (!qid) return <PlaceholderBlock icon="record_voice_over" text="Избери въпрос за гласа на класа от редактора" color="primary" />
  const v = data.voiceData[qid]
  if (!v || v.items.length === 0) return <PlaceholderBlock icon="record_voice_over" text="Все още няма отговори за гласа на класа" color="primary" />
  if (v.display === 'barchart') return <BarChartView items={v.items} title={v.text} />
  return <WordCloudView items={v.items} title={v.text} />
}

function SubjectsBarBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const qid = config.questionId as string | null
  if (!qid) return <PlaceholderBlock icon="bar_chart" text="Избери въпрос за диаграмата от редактора" color="primary" />
  const v = data.voiceData[qid]
  if (!v || v.items.length === 0) return <PlaceholderBlock icon="bar_chart" text="Все още няма отговори за тази диаграма" color="primary" />
  if (v.display === 'wordcloud') return <WordCloudView items={v.items} title={v.text} />
  return <BarChartView items={v.items} title={v.text} />
}

function PollsGridBlock({ data, config, basePath }: { data: LexiconData; config: Record<string, unknown>; basePath?: string }) {
  const pollIds = (config.pollIds as string[] | undefined) ?? Object.keys(data.pollData)
  const polls = pollIds
    .map(id => ({ id, ...(data.pollData[id] ?? {}) }))
    .filter(p => p.nominees && p.nominees.length > 0) as Array<{ id: string; question: string; nominees: { studentId: string; name: string; pct: number; photoUrl: string | null }[] }>

  if (polls.length === 0) return <PlaceholderBlock icon="emoji_events" text="Все още няма гласове за анкетите" color="secondary" />

  return (
    <section className="mb-16">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">⭐</span>
        <h3 className="text-2xl font-bold" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>
          Звездите на класа
        </h3>
        <span className="text-3xl">⭐</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.map((poll) => {
          const winner = poll.nominees[0]
          const initials = winner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          const studentHref = basePath && winner.studentId
            ? `${basePath}/student/${winner.studentId}`
            : null
          const card = (
            <div
              className="relative flex flex-col items-center gap-4 text-center pt-8 pb-6 px-6 cursor-pointer group transition-transform hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--lex-card)',
                borderRadius: 'var(--lex-radius)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Crown + avatar */}
              <div className="relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl leading-none select-none">👑</div>
                <div
                  className="w-20 h-20 rounded-full overflow-hidden flex-none flex items-center justify-center ring-4 transition-all group-hover:ring-[color:var(--lex-primary)]"
                  style={{ backgroundColor: 'var(--lex-primary-light)' }}
                >
                  {winner.photoUrl ? (
                    <img src={winner.photoUrl} alt={winner.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold" style={{ color: 'var(--lex-primary)' }}>{initials}</span>
                  )}
                </div>
              </div>

              {/* Name */}
              <p className="text-xl font-bold leading-tight" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>
                {winner.name}
              </p>

              {/* Award label */}
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: 'var(--lex-primary-light)', color: 'var(--lex-primary)' }}
              >
                {poll.question}
              </div>
            </div>
          )

          return studentHref ? (
            <a key={poll.id} href={studentHref} className="block no-underline">
              {card}
            </a>
          ) : (
            <div key={poll.id}>{card}</div>
          )
        })}
      </div>
    </section>
  )
}

function PollBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const pid = config.pollId as string | null

  if (!pid) return <PlaceholderBlock icon="bar_chart" text="Избери анкета от редактора на лексикона" color="primary" />

  const poll = data.pollData[pid]
  if (!poll || poll.nominees.length === 0) return <PlaceholderBlock icon="bar_chart" text="Все още няма гласове за тази анкета" color="primary" />

  const winner = poll.nominees[0]

  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-sm font-semibold" style={{ color: 'var(--lex-muted)' }}>{poll.question}:</span>
        <span className="text-lg font-bold" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{winner.name}</span>
      </div>
    </section>
  )
}

function EventsBlock({ data, config, basePath }: { data: LexiconData; config: Record<string, unknown>; basePath?: string }) {
  const { classId, eventList } = data
  const limit = (config.limit as number) ?? 4
  const style = (config.style as string) ?? 'polaroids'
  const items = eventList.slice(0, limit)
  const base = basePath ?? `/lexicon/${classId}`
  if (items.length === 0) return null

  // photo_grid style — only events with photos
  if (style === 'photo_grid') {
    const photoItems = items.filter(e => e.photos && e.photos.length > 0)
    if (photoItems.length === 0) return null
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>Нашите събития</h3>
          <Link href={`${base}/memories`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--lex-secondary)' }}>Виж всички →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photoItems.map(event => (
            <div key={event.id} className="relative aspect-square overflow-hidden group" style={{ borderRadius: 'var(--lex-radius)' }}>
              <img
                src={event.photos![0]}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-0 left-0 right-0 p-4 text-sm font-semibold text-white leading-tight" style={{ fontFamily: 'Noto Serif, serif' }}>
                {event.title}
              </p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>Нашите събития</h3>
        <Link href={`${base}/memories`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--lex-secondary)' }}>Виж всички →</Link>
      </div>
      <div className={style === 'timeline' ? 'space-y-4' : 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'}>
        {items.map((event, i) => {
          const photo = event.photos?.[0]
          const rotation = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1'][i % 4]
          if (photo && style !== 'timeline') {
            return (
              <div key={event.id} className="break-inside-avoid">
                <div className={`p-4 shadow-lg ${rotation} transition-transform hover:rotate-0`} style={{ backgroundColor: 'var(--lex-surface)' }}>
                  <img src={photo} alt={event.title} className="w-full h-auto mb-4 object-cover" />
                  <p className="italic text-sm" style={{ fontFamily: 'Noto Serif, serif', color: 'color-mix(in srgb, var(--lex-text) 80%, transparent)' }}>„{event.title}"</p>
                </div>
              </div>
            )
          }
          if (event.note) {
            return (
              <div key={event.id} className={style !== 'timeline' ? 'break-inside-avoid' : ''}>
                <div className="p-8" style={{ backgroundColor: 'var(--lex-primary-light)', borderRadius: 'var(--lex-radius)', color: 'var(--lex-primary)' }}>
                  <span className="material-symbols-outlined text-4xl mb-4 block">format_quote</span>
                  <blockquote className="text-xl leading-relaxed mb-4" style={{ fontFamily: 'Noto Serif, serif' }}>
                    „{event.note.slice(0, 150)}{event.note.length > 150 ? '…' : ''}"
                  </blockquote>
                  <cite className="text-sm font-bold uppercase tracking-widest not-italic">— {event.title}</cite>
                </div>
              </div>
            )
          }
          return (
            <div key={event.id} className={style !== 'timeline' ? 'break-inside-avoid' : ''}>
              <div className="p-6" style={{ backgroundColor: 'var(--lex-secondary-light)', borderRadius: 'var(--lex-radius)' }}>
                <span className="material-symbols-outlined text-2xl mb-3 block" style={{ color: 'var(--lex-secondary)' }}>event</span>
                <p className="font-bold text-lg" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-text)' }}>{event.title}</p>
                {event.event_date && (
                  <p className="text-sm mt-2" style={{ color: 'var(--lex-secondary)' }}>
                    {new Date(event.event_date).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Generic placeholder ────────────────────────────────────────────────────

function PlaceholderBlock({ icon, text, color }: { icon: string; text: string; color: 'primary' | 'secondary' }) {
  const isPrimary = color === 'primary'
  return (
    <section className="mb-16">
      <div className="p-10 flex flex-col items-center justify-center text-center min-h-[160px]" style={{
        border: `2px dashed color-mix(in srgb, var(--lex-${isPrimary ? 'primary' : 'secondary'}) 20%, transparent)`,
        borderRadius: 'var(--lex-radius)',
        backgroundColor: `color-mix(in srgb, var(--lex-${isPrimary ? 'primary' : 'secondary'}-light) 30%, transparent)`,
      }}>
        <span className="material-symbols-outlined text-4xl mb-3" style={{ color: `color-mix(in srgb, var(--lex-${isPrimary ? 'primary' : 'secondary'}) 30%, transparent)` }}>{icon}</span>
        <p className="text-sm italic" style={{ color: `color-mix(in srgb, var(--lex-${isPrimary ? 'primary' : 'secondary'}) 50%, transparent)` }}>{text}</p>
      </div>
    </section>
  )
}

// ── Main renderer ──────────────────────────────────────────────────────────

// Block types that always span the full width
const FULL_WIDTH_TYPES = new Set<string>(['hero', 'superhero', 'students_grid', 'polls_grid', 'events'])

export default function LexiconBlocks({ blocks, data, basePath }: { blocks: Block[]; data: LexiconData; basePath?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
      {blocks.map(block => {
        const cfg = block.config as Record<string, unknown>
        const fullWidth = FULL_WIDTH_TYPES.has(block.type)

        let content: ReactNode = null
        switch (block.type) {
          case 'hero':          content = <HeroBlock          data={data} />;                          break
          case 'superhero':     content = <SuperheroBlock     data={data} />;                          break
          case 'students_grid': return null  // shown on dedicated /students page
          case 'question':      content = <QuestionBlock      data={data} config={cfg} />;             break
          case 'photo_gallery': content = <PhotoGalleryBlock  data={data} config={cfg} />;             break
          case 'class_voice':   content = <ClassVoiceBlock    data={data} config={cfg} />;             break
          case 'subjects_bar':  content = <SubjectsBarBlock   data={data} config={cfg} />;             break
          case 'poll':          content = <PollBlock          data={data} config={cfg} />;             break
          case 'polls_grid':    content = <PollsGridBlock     data={data} config={cfg} basePath={basePath} />; break
          case 'events':        content = <EventsBlock        data={data} config={cfg} basePath={basePath} />; break
          default:              return null
        }

        return (
          <div
            key={block.id}
            className={`[&>section]:mb-0 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
