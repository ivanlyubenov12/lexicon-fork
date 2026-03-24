import Link from 'next/link'
import type { Block } from '@/lib/templates/types'

// ── Shared data types ──────────────────────────────────────────────────────

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
  voiceItems: { text: string; size: 'lg' | 'md' | 'sm' }[]
  firstVoiceQ: { id: string; text: string } | null
  pollResults: { id: string; question: string; nominees: { name: string; pct: number }[]; totalVotes: number }[]
  eventList: { id: string; title: string; event_date?: string | null; note?: string | null; photos?: string[] | null }[]
}

// ── Block renderers ────────────────────────────────────────────────────────

function HeroBlock({ data }: { data: LexiconData }) {
  const { classData, namePart, schoolPart } = data
  return (
    <section className="mb-12">
      <div
        className="relative overflow-hidden shadow-2xl aspect-[4/3] md:aspect-[16/7]"
        style={{ borderRadius: 'var(--lex-radius)' }}
      >
        {(classData.superhero_image_url ?? classData.cover_image_url) ? (
          <img
            src={(classData.superhero_image_url ?? classData.cover_image_url)!}
            alt={classData.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: 'var(--lex-hero-grad)' }} />
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
              className="text-base md:text-lg opacity-90 max-w-xl italic"
              style={{ fontFamily: 'Noto Serif, serif', color: 'color-mix(in srgb, var(--lex-primary-light) 90%, white)' }}
            >
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
      <div
        className="relative overflow-hidden shadow-2xl aspect-[4/3] md:aspect-[16/7]"
        style={{ borderRadius: 'var(--lex-radius)' }}
      >
        <img
          src={data.classData.superhero_image_url}
          alt="Супергерой на класа"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {data.classData.superhero_prompt && (
          <div className="absolute bottom-0 left-0 p-8">
            <p
              className="text-base md:text-lg opacity-90 max-w-xl italic"
              style={{ fontFamily: 'Noto Serif, serif', color: 'color-mix(in srgb, var(--lex-primary-light) 90%, white)' }}
            >
              „{data.classData.superhero_prompt}"
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function StudentsGridBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const { classId, studentList, teaserMap } = data
  const showTeaser = (config.showTeaser as boolean) ?? true
  if (studentList.length === 0) return null

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h3
          className="text-2xl"
          style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}
        >
          Нашите съученици
        </h3>
        <Link
          href={`/lexicon/${classId}/students`}
          className="font-semibold text-sm tracking-widest uppercase"
          style={{ color: 'var(--lex-secondary)' }}
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
              <div
                className="p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{ backgroundColor: 'var(--lex-surface)', borderRadius: 'var(--lex-radius-card)' }}
              >
                <div
                  className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4"
                  style={{
                    border: '4px solid var(--lex-card)',
                    outline: '2px solid color-mix(in srgb, var(--lex-primary) 10%, transparent)',
                    outlineOffset: '2px',
                  }}
                >
                  {student.photo_url ? (
                    <img src={student.photo_url} alt={student.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--lex-primary-light)' }}
                    >
                      <span
                        className="font-bold text-2xl"
                        style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}
                      >
                        {initials}
                      </span>
                    </div>
                  )}
                </div>
                <h4
                  className="text-lg mb-1"
                  style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}
                >
                  {student.first_name} {student.last_name[0]}.
                </h4>
                {showTeaser && teaser && (
                  <p
                    className="text-xs leading-relaxed italic"
                    style={{ color: 'var(--lex-secondary)' }}
                  >
                    „{teaser.slice(0, 50)}{teaser.length > 50 ? '…' : ''}"
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function ClassVoiceBlock({ data }: { data: LexiconData }) {
  const { voiceItems, firstVoiceQ } = data
  if (voiceItems.length === 0 || !firstVoiceQ) return null
  return (
    <section className="mb-16">
      <h3
        className="text-2xl mb-8"
        style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}
      >
        Гласът на класа
      </h3>
      <div
        className="p-8 flex flex-col items-center justify-center min-h-[200px]"
        style={{ backgroundColor: 'var(--lex-card)', borderRadius: 'var(--lex-radius)' }}
      >
        <h4
          className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center"
          style={{ color: 'var(--lex-secondary)' }}
        >
          {firstVoiceQ.text}
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-3 text-center">
          {voiceItems.map((item, i) => (
            <span
              key={i}
              className={item.size === 'sm' ? 'italic' : ''}
              style={{
                fontFamily: 'Noto Serif, serif',
                fontSize: item.size === 'lg' ? '1rem' : '0.875rem',
                color: item.size === 'sm'
                  ? 'color-mix(in srgb, var(--lex-secondary) 70%, transparent)'
                  : item.size === 'md'
                  ? 'color-mix(in srgb, var(--lex-primary) 70%, transparent)'
                  : 'var(--lex-primary)',
              }}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function PollBlock({ data }: { data: LexiconData }) {
  const { pollResults } = data
  if (pollResults.length === 0) return null
  const poll = pollResults[0]
  return (
    <section className="mb-16">
      <div
        className="p-8"
        style={{ backgroundColor: 'var(--lex-card)', borderRadius: 'var(--lex-radius)' }}
      >
        <h4
          className="text-xs font-bold uppercase tracking-[0.2em] mb-8"
          style={{ color: 'var(--lex-secondary)' }}
        >
          {poll.question}
        </h4>
        <div className="space-y-5">
          {poll.nominees.map((n, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span style={{ color: 'var(--lex-text)' }}>{n.name}</span>
                <span style={{ color: 'var(--lex-muted)' }}>{n.pct}%</span>
              </div>
              <div
                className="h-3 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: 'color-mix(in srgb, var(--lex-card) 50%, var(--lex-muted) 20%)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${n.pct}%`,
                    backgroundColor: i === 0
                      ? 'var(--lex-primary)'
                      : i === 1
                      ? 'var(--lex-accent)'
                      : 'color-mix(in srgb, var(--lex-primary) 60%, transparent)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EventsBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const { classId, eventList } = data
  const limit = (config.limit as number) ?? 4
  const style = (config.style as string) ?? 'polaroids'
  const items = eventList.slice(0, limit)
  if (items.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h3
          className="text-2xl"
          style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}
        >
          Нашите спомени
        </h3>
        <Link
          href={`/lexicon/${classId}/memories`}
          className="text-sm font-semibold hover:underline"
          style={{ color: 'var(--lex-secondary)' }}
        >
          Виж всички →
        </Link>
      </div>
      <div className={style === 'timeline' ? 'space-y-4' : 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'}>
        {items.map((event, i) => {
          const photo = event.photos?.[0]
          const rotations = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1']
          const rotation = rotations[i % 4]

          if (photo && style !== 'timeline') {
            return (
              <div key={event.id} className="break-inside-avoid">
                <div className={`p-4 shadow-lg ${rotation} transition-transform hover:rotate-0`} style={{ backgroundColor: 'var(--lex-surface)' }}>
                  <img src={photo} alt={event.title} className="w-full h-auto mb-4 object-cover" />
                  <p
                    className="italic text-sm"
                    style={{ fontFamily: 'Noto Serif, serif', color: 'color-mix(in srgb, var(--lex-text) 80%, transparent)' }}
                  >
                    „{event.title}"
                  </p>
                </div>
              </div>
            )
          }
          if (event.note) {
            return (
              <div key={event.id} className={style !== 'timeline' ? 'break-inside-avoid' : ''}>
                <div
                  className="p-8"
                  style={{
                    backgroundColor: 'var(--lex-primary-light)',
                    borderRadius: 'var(--lex-radius)',
                    color: 'var(--lex-primary)',
                  }}
                >
                  <span className="material-symbols-outlined text-4xl mb-4 block">format_quote</span>
                  <blockquote
                    className="text-xl leading-relaxed mb-4"
                    style={{ fontFamily: 'Noto Serif, serif' }}
                  >
                    „{event.note.slice(0, 150)}{event.note.length > 150 ? '…' : ''}"
                  </blockquote>
                  <cite className="text-sm font-bold uppercase tracking-widest not-italic">— {event.title}</cite>
                </div>
              </div>
            )
          }
          return (
            <div key={event.id} className={style !== 'timeline' ? 'break-inside-avoid' : ''}>
              <div
                className="p-6"
                style={{
                  backgroundColor: 'var(--lex-secondary-light)',
                  borderRadius: 'var(--lex-radius)',
                }}
              >
                <span
                  className="material-symbols-outlined text-2xl mb-3 block"
                  style={{ color: 'var(--lex-secondary)' }}
                >
                  event
                </span>
                <p
                  className="font-bold text-lg"
                  style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-text)' }}
                >
                  {event.title}
                </p>
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

function QuestionPlaceholderBlock({ config }: { config: Record<string, unknown> }) {
  const placeholder = (config.placeholder as string) ?? 'Добави въпрос'
  return (
    <section className="mb-16">
      <div
        className="p-10 flex flex-col items-center justify-center text-center min-h-[200px]"
        style={{
          border: '2px dashed color-mix(in srgb, var(--lex-primary) 20%, transparent)',
          borderRadius: 'var(--lex-radius)',
          backgroundColor: 'color-mix(in srgb, var(--lex-primary-light) 30%, transparent)',
        }}
      >
        <span
          className="material-symbols-outlined text-4xl mb-3"
          style={{ color: 'color-mix(in srgb, var(--lex-primary) 40%, transparent)' }}
        >
          quiz
        </span>
        <p
          className="text-sm italic"
          style={{ color: 'color-mix(in srgb, var(--lex-primary) 60%, transparent)' }}
        >
          {placeholder}
        </p>
      </div>
    </section>
  )
}

function PhotoGalleryPlaceholderBlock({ config }: { config: Record<string, unknown> }) {
  const caption = (config.caption as string) ?? 'Фото галерия'
  return (
    <section className="mb-16">
      <div
        className="p-10 flex flex-col items-center justify-center text-center min-h-[200px]"
        style={{
          border: '2px dashed color-mix(in srgb, var(--lex-secondary) 20%, transparent)',
          borderRadius: 'var(--lex-radius)',
          backgroundColor: 'color-mix(in srgb, var(--lex-secondary-light) 30%, transparent)',
        }}
      >
        <span
          className="material-symbols-outlined text-4xl mb-3"
          style={{ color: 'color-mix(in srgb, var(--lex-secondary) 40%, transparent)' }}
        >
          photo_library
        </span>
        <p
          className="text-sm italic"
          style={{ color: 'color-mix(in srgb, var(--lex-secondary) 60%, transparent)' }}
        >
          {caption}
        </p>
      </div>
    </section>
  )
}

// ── Main renderer ──────────────────────────────────────────────────────────

interface Props {
  blocks: Block[]
  data: LexiconData
}

export default function LexiconBlocks({ blocks, data }: Props) {
  return (
    <>
      {blocks.map((block) => {
        const cfg = block.config as Record<string, unknown>
        switch (block.type) {
          case 'hero':
            return <HeroBlock key={block.id} data={data} />
          case 'superhero':
            return <SuperheroBlock key={block.id} data={data} />
          case 'students_grid':
            return <StudentsGridBlock key={block.id} data={data} config={cfg} />
          case 'class_voice':
            return <ClassVoiceBlock key={block.id} data={data} />
          case 'poll':
            return <PollBlock key={block.id} data={data} />
          case 'events':
            return <EventsBlock key={block.id} data={data} config={cfg} />
          case 'question':
            return <QuestionPlaceholderBlock key={block.id} config={cfg} />
          case 'photo_gallery':
            return <PhotoGalleryPlaceholderBlock key={block.id} config={cfg} />
          default:
            return null
        }
      })}
    </>
  )
}
