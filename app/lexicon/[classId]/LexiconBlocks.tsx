import Link from 'next/link'
import type { Block } from '@/lib/templates/types'

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
  /** questionId → { text, items[] } */
  voiceData: Record<string, { text: string; items: VoiceItem[] }>
  /** pollId → { question, nominees[], totalVotes } */
  pollData: Record<string, { question: string; nominees: { name: string; pct: number }[]; totalVotes: number }>
  eventList: { id: string; title: string; event_date?: string | null; note?: string | null; photos?: string[] | null }[]
}

// ── Block renderers ────────────────────────────────────────────────────────

function HeroBlock({ data }: { data: LexiconData }) {
  const { classData, namePart, schoolPart } = data
  return (
    <section className="mb-12">
      <div className="relative overflow-hidden shadow-2xl aspect-[4/3] md:aspect-[16/7]" style={{ borderRadius: 'var(--lex-radius)' }}>
        {(classData.superhero_image_url ?? classData.cover_image_url) ? (
          <img src={(classData.superhero_image_url ?? classData.cover_image_url)!} alt={classData.name} className="w-full h-full object-cover" />
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
  const { classId, studentList, teaserMap } = data
  const showTeaser = (config.showTeaser as boolean) ?? true
  const base = basePath ?? `/lexicon/${classId}`
  if (studentList.length === 0) return null

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>Нашите съученици</h3>
        <Link href={`${base}/students`} className="font-semibold text-sm tracking-widest uppercase" style={{ color: 'var(--lex-secondary)' }}>
          {studentList.length} ученици
        </Link>
      </div>
      <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 -mx-6 px-6">
        {studentList.map(student => {
          const teaser = teaserMap[student.id]
          const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
          return (
            <Link key={student.id} href={`${base}/student/${student.id}`} className="flex-none w-48 group">
              <div className="p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" style={{ backgroundColor: 'var(--lex-surface)', borderRadius: 'var(--lex-radius-card)' }}>
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4" style={{ border: '4px solid var(--lex-card)' }}>
                  {student.photo_url
                    ? <img src={student.photo_url} alt={student.first_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--lex-primary-light)' }}>
                        <span className="font-bold text-2xl" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{initials}</span>
                      </div>
                  }
                </div>
                <h4 className="text-lg mb-1" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>
                  {student.first_name} {student.last_name[0]}.
                </h4>
                {showTeaser && teaser && (
                  <p className="text-xs leading-relaxed italic" style={{ color: 'var(--lex-secondary)' }}>
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

function QuestionBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const qid = config.questionId as string | null
  const layout = (config.layout as string) ?? 'grid'

  if (!qid) return <PlaceholderBlock icon="quiz" text="Избери въпрос от редактора на лексикона" color="primary" />

  const q = data.questionData[qid]
  if (!q) return <PlaceholderBlock icon="quiz" text="Въпросът не е намерен или няма одобрени отговори" color="primary" />
  if (q.answers.length === 0) return (
    <section className="mb-16">
      <h3 className="text-2xl mb-4" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{q.text}</h3>
      <PlaceholderBlock icon="quiz" text="Все още няма одобрени отговори" color="primary" />
    </section>
  )

  return (
    <section className="mb-16">
      <h3 className="text-2xl mb-8" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{q.text}</h3>

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
    <div className="p-5" style={{ backgroundColor: 'var(--lex-surface)', borderRadius: 'var(--lex-radius)', border: '1px solid color-mix(in srgb, var(--lex-primary) 8%, transparent)' }}>
      {answer.media_url && (answer.media_type?.startsWith('image') ?? true) && (
        <img src={answer.media_url} alt="" className="w-full rounded-xl mb-4 object-cover max-h-64" />
      )}
      {answer.text_content && (
        <p className="text-base leading-relaxed mb-4" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-text)' }}>
          „{answer.text_content}"
        </p>
      )}
      {s && (
        <div className="flex items-center gap-2 mt-auto pt-2" style={{ borderTop: '1px solid color-mix(in srgb, var(--lex-primary) 6%, transparent)' }}>
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
      <h3 className="text-2xl mb-8" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>{q.text}</h3>
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

function ClassVoiceBlock({ data, config }: { data: LexiconData; config: Record<string, unknown> }) {
  const qid = config.questionId as string | null

  if (!qid) return <PlaceholderBlock icon="record_voice_over" text="Избери въпрос за гласа на класа от редактора" color="primary" />

  const v = data.voiceData[qid]
  if (!v || v.items.length === 0) return <PlaceholderBlock icon="record_voice_over" text="Все още няма отговори за гласа на класа" color="primary" />

  return (
    <section className="mb-16">
      <h3 className="text-2xl mb-8" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>Гласът на класа</h3>
      <div className="p-8 flex flex-col items-center justify-center min-h-[200px]" style={{ backgroundColor: 'var(--lex-card)', borderRadius: 'var(--lex-radius)' }}>
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center" style={{ color: 'var(--lex-secondary)' }}>{v.text}</h4>
        <div className="flex flex-wrap items-center justify-center gap-3 text-center">
          {v.items.map((item, i) => (
            <span key={i} className={item.size === 'sm' ? 'italic' : ''} style={{
              fontFamily: 'Noto Serif, serif',
              fontSize: item.size === 'lg' ? '1rem' : '0.875rem',
              color: item.size === 'sm'
                ? 'color-mix(in srgb, var(--lex-secondary) 70%, transparent)'
                : item.size === 'md'
                ? 'color-mix(in srgb, var(--lex-primary) 70%, transparent)'
                : 'var(--lex-primary)',
            }}>
              {item.text}
            </span>
          ))}
        </div>
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

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl" style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}>Нашите спомени</h3>
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

export default function LexiconBlocks({ blocks, data, basePath }: { blocks: Block[]; data: LexiconData; basePath?: string }) {
  return (
    <>
      {blocks.map(block => {
        const cfg = block.config as Record<string, unknown>
        switch (block.type) {
          case 'hero':          return <HeroBlock          key={block.id} data={data} />
          case 'superhero':     return <SuperheroBlock     key={block.id} data={data} />
          case 'students_grid': return <StudentsGridBlock  key={block.id} data={data} config={cfg} basePath={basePath} />
          case 'question':      return <QuestionBlock      key={block.id} data={data} config={cfg} />
          case 'photo_gallery': return <PhotoGalleryBlock  key={block.id} data={data} config={cfg} />
          case 'class_voice':   return <ClassVoiceBlock    key={block.id} data={data} config={cfg} />
          case 'poll':          return <PollBlock          key={block.id} data={data} config={cfg} />
          case 'events':        return <EventsBlock        key={block.id} data={data} config={cfg} basePath={basePath} />
          default:              return null
        }
      })}
    </>
  )
}
