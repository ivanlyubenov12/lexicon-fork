'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { LexiconBottomNav } from '../../LexiconNav'
import HarryPortrait from '../../HarryPortrait'

interface Question {
  id: string
  text: string
  order_index: number
  type: string
  is_featured?: boolean
}

interface Answer {
  question_id: string
  text_content: string | null
  media_url: string | null
  media_type: string | null
}

interface Message {
  id: string
  content: string
  authorName: string
}

interface StudentEvent {
  id: string
  title: string
  event_date: string | null
  firstPhoto: string | null
  comment: string
}

interface Props {
  classId: string
  className: string
  schoolLogoUrl?: string | null
  student: {
    id: string
    first_name: string
    last_name: string
    photo_url: string | null
  }
  questions: Question[]
  answers: Answer[]
  messages: Message[]
  studentEvents?: StudentEvent[]
  prevStudentId: string | null
  nextStudentId: string | null
  /** Override nav links (e.g. for moderator preview) */
  prevHref?: string | null
  nextHref?: string | null
  /** Override the back link */
  backHref?: string
  /** Base path for bottom nav (e.g. /moderator/[id]/preview) */
  basePath?: string
  /** Whether premium features (video) are visible */
  isPremium?: boolean
  /** Show all questions including unanswered (moderator preview mode) */
  showAllQuestions?: boolean
  /** When true, skip the outer shell/nav/footer (a layout.tsx provides them) */
  embedded?: boolean
  themeId?: string | null
}

function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function toggle() {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause() } else { audioRef.current.play() }
    setPlaying(!playing)
  }

  return (
    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md">
      <audio ref={audioRef} src={src} preload="metadata" onEnded={() => setPlaying(false)} />
      <div className="flex items-center space-x-4">
        <button onClick={toggle}>
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {playing ? 'pause_circle' : 'play_circle'}
          </span>
        </button>
        <div className="flex-1 h-1 bg-white/30 rounded-full">
          <div className="h-full w-1/3 bg-white rounded-full" />
        </div>
      </div>
    </div>
  )
}

function VideoCard({ answer, question }: { answer: Answer; question: Question }) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  function handlePlay() {
    setPlaying(true)
    videoRef.current?.play()
  }

  return (
    <div className="bg-primary-container relative overflow-hidden aspect-video group cursor-pointer" onClick={handlePlay}>
      <video
        ref={videoRef}
        src={answer.media_url!}
        className="w-full h-full object-cover"
        preload="metadata"
        controls={playing}
      />
      {!playing && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <p className="absolute bottom-4 left-4 right-4 text-white text-sm font-semibold leading-snug pointer-events-none z-10">
            {question.text}
          </p>
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function StudentLexiconView({
  classId,
  className,
  schoolLogoUrl,
  student,
  questions,
  answers,
  messages,
  studentEvents = [],
  prevStudentId,
  nextStudentId,
  prevHref,
  nextHref,
  backHref,
  basePath,
  isPremium = false,
  showAllQuestions = false,
  embedded = false,
  themeId,
}: Props) {
  const resolvedPrevHref = prevHref !== undefined ? prevHref : (prevStudentId ? `/lexicon/${classId}/student/${prevStudentId}` : null)
  const resolvedNextHref = nextHref !== undefined ? nextHref : (nextStudentId ? `/lexicon/${classId}/student/${nextStudentId}` : null)
  const resolvedBackHref = backHref ?? `/lexicon/${classId}/students`
  const answerMap = new Map(answers.map((a) => [a.question_id, a]))
  const answeredQuestions = questions.filter((q) => answerMap.has(q.id))
  const unansweredQuestions = showAllQuestions ? questions.filter((q) => !answerMap.has(q.id)) : []

  // Sequential slot assignment — each question used at most once
  const used = new Set<string>()

  function consumeFirst(pred: (q: Question, a: Answer) => boolean) {
    for (const q of answeredQuestions) {
      if (used.has(q.id)) continue
      const a = answerMap.get(q.id)!
      if (pred(q, a)) { used.add(q.id); return { question: q, answer: a } }
    }
    return null
  }
  function consumeN(pred: (q: Question, a: Answer) => boolean, n: number) {
    const result: Array<{ question: Question; answer: Answer }> = []
    for (const q of answeredQuestions) {
      if (result.length >= n) break
      if (used.has(q.id)) continue
      const a = answerMap.get(q.id)!
      if (pred(q, a)) { used.add(q.id); result.push({ question: q, answer: a }) }
    }
    return result
  }
  function consumeAll() {
    const result: Array<{ question: Question; answer: Answer }> = []
    for (const q of answeredQuestions) {
      if (used.has(q.id)) continue
      used.add(q.id)
      result.push({ question: q, answer: answerMap.get(q.id)! })
    }
    return result
  }

  // Slot 1 — Hero right: up to 3 ★ featured text items
  const featuredQA = consumeN((q, a) => !!(q.is_featured && a.text_content), 3)

  // Slot 2 — Hero right fallback (no featured): up to 3 text items fill the column
  const heroFallbackQA = featuredQA.length === 0
    ? consumeN((_, a) => !!(a.text_content && !a.media_url), 3)
    : []

  // Slot 3 — Row 2: first video
  const firstVideo = isPremium ? consumeFirst((_, a) => a.media_type === 'video') : null

  // Slot 4 — Row 2: first audio
  const firstAudio = consumeFirst((_, a) => a.media_type === 'audio')

  // Slot 5 — Grid header blockquote (only when featured QA fills hero right)
  const gridQuoteText = featuredQA.length > 0
    ? consumeFirst((_, a) => !!(a.text_content && !a.media_url))
    : null

  // Slot 6 — Grid: wide text card
  const featuredText = consumeFirst((_, a) => !!(a.text_content && !a.media_url))

  // Slot 7 — Grid: everything else (in original question order)
  const gridItems = consumeAll()

  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()

  const prevNextNav = (
    <div className="flex items-center gap-4">
      {resolvedPrevHref && (
        <Link
          href={resolvedPrevHref}
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Предишен
        </Link>
      )}
      {resolvedNextHref && (
        <Link
          href={resolvedNextHref}
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
        >
          Следващ
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      )}
    </div>
  )

  return (
    <div className={embedded ? undefined : 'bg-surface min-h-screen pb-32'} style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Nav — only when not embedded in a layout shell ───────────── */}
      {!embedded ? (
        <nav
          className="w-full top-0 sticky z-50"
          style={{
            backgroundColor: 'rgba(252, 248, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-screen-xl mx-auto">
            <Link
              href={resolvedBackHref}
              className="font-headline text-xl italic text-on-surface"
            >
              {themeId === 'kindergarten' ? 'Нашата страхотна група' : 'Един неразделен клас'}
            </Link>
            <div className="flex items-center gap-4">{prevNextNav}</div>
          </div>
          <div className="h-px bg-surface-container-high" />
        </nav>
      ) : (
        /* Inline prev/next when embedded — desktop only; mobile uses fixed strip */
        <div className="hidden md:flex justify-end gap-4 mb-4">{prevNextNav}</div>
      )}

      <main className="max-w-screen-xl mx-auto px-6 py-12">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="mb-16">

          {/* Row 1: Portrait + Featured Q&A (full width) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 mb-0 items-stretch">

            {/* Portrait */}
            <div className="md:col-span-5 relative mb-20 md:mb-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 tape-overlay z-30" />
              <div className="relative z-10 overflow-hidden sharp-frame h-full">
                <HarryPortrait
                  src={student.photo_url}
                  alt={`${student.first_name} ${student.last_name}`}
                  initials={initials}
                  variant="portrait"
                  messages={messages}
                />
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 z-20 px-6 pt-5 pb-6 bg-primary shadow-2xl"
                style={{ transform: 'rotate(0.5deg)' }}
              >
                {schoolLogoUrl && (
                  <div
                    className="absolute -top-10 left-6 z-30 w-20 h-20 rounded-full bg-white flex items-center justify-center"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  >
                    <img src={schoolLogoUrl} alt="Лого" className="w-full h-full object-contain rounded-full p-1.5" />
                  </div>
                )}
                <h1 className={`font-headline text-4xl md:text-5xl font-bold text-white leading-tight ${schoolLogoUrl ? 'pl-24' : ''}`}>
                  {student.first_name} {student.last_name}
                </h1>
              </div>
            </div>

            {/* Featured Q&A sticky note OR fallback content */}
            <div className="md:col-span-7 flex flex-col">
              {featuredQA.length > 0 ? (
                <div className="relative bg-surface-container-low h-full flex flex-col justify-center px-10 py-12 md:px-14 md:py-14">
                  <div className="absolute -top-4 left-12 w-28 h-7 tape-overlay pointer-events-none" />
                  <div className="space-y-0 divide-y divide-on-surface/6">
                    {featuredQA.map(({ question, answer }, i) => (
                      <div key={question.id} className={`${i === 0 ? 'pb-8' : i === featuredQA.length - 1 ? 'pt-8' : 'py-8'}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                          {question.text}
                        </p>
                        <p
                          className="text-2xl md:text-3xl text-on-surface leading-snug"
                          style={{ fontFamily: 'Noto Serif, serif' }}
                        >
                          {answer.text_content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-8 pt-4">
                  {heroFallbackQA[0] && (
                    <section className="bg-surface-container-low p-8 md:p-10 relative">
                      <div className="absolute -top-4 left-10 w-24 h-6 tape-overlay pointer-events-none" />
                      <h3 className="font-label text-xs font-bold uppercase tracking-widest text-primary mb-4">
                        {heroFallbackQA[0].question.text}
                      </h3>
                      <blockquote
                        className="text-2xl md:text-3xl text-on-surface-variant leading-relaxed"
                        style={{ fontFamily: 'Noto Serif, serif', fontStyle: 'italic' }}
                      >
                        "{heroFallbackQA[0].answer.text_content}"
                      </blockquote>
                    </section>
                  )}
                  {heroFallbackQA.slice(1).map(({ question, answer }) => (
                    <div key={question.id} className="flex items-start gap-4">
                      <div className="p-3 bg-primary-fixed flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">format_quote</span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">{question.text}</p>
                        <p className="font-headline text-lg text-on-surface">{answer.text_content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Row 2: Video — constrained width, centered */}
          <div className="mt-8 max-w-2xl mx-auto">
            {firstVideo ? (
              <VideoCard answer={firstVideo.answer} question={firstVideo.question} />
            ) : (
              <div className="bg-primary-container relative overflow-hidden aspect-video flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3632b7 0%, transparent 60%), radial-gradient(circle at 80% 20%, #674000 0%, transparent 60%)' }}
                />
                {schoolLogoUrl ? (
                  <img src={schoolLogoUrl} alt="Лого" className="relative z-10 w-24 h-24 object-contain opacity-60" />
                ) : (
                  <span className="material-symbols-outlined text-white/30 relative z-10" style={{ fontSize: 80, fontVariationSettings: "'FILL' 1" }}>
                    videocam
                  </span>
                )}
              </div>
            )}
            {firstAudio && (
              <div className="bg-tertiary-container text-white p-8 flex flex-col justify-between mt-6">
                <div>
                  <h3 className="font-headline text-xl font-bold mb-3 flex items-center gap-2 text-on-tertiary-fixed">
                    <span className="material-symbols-outlined">mic</span>
                    Гласова бележка
                  </h3>
                  <p className="text-sm italic opacity-80 mb-6 text-on-tertiary-fixed-variant">„{firstAudio.question.text}"</p>
                </div>
                <AudioPlayer src={firstAudio.answer.media_url!} />
              </div>
            )}
          </div>

        </section>

        {/* ── Answers grid ─────────────────────────────────────────── */}
        {(gridQuoteText || featuredText || gridItems.length > 0 || unansweredQuestions.length > 0) && (
          <section className="mb-24">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-12 flex items-center gap-4">
              <span className="w-8 h-px bg-primary block" />
              Това съм аз
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Full-width blockquote (first unused text, shown only when featuredQA fills the hero) */}
              {gridQuoteText && (
                <div className="md:col-span-3 bg-surface-container-low p-8 md:p-10 relative">
                  <div className="absolute -top-4 left-10 w-24 h-6 tape-overlay pointer-events-none" />
                  <h3 className="font-label text-xs font-bold uppercase tracking-widest text-primary mb-4">
                    {gridQuoteText.question.text}
                  </h3>
                  <blockquote
                    className="text-2xl md:text-3xl text-on-surface-variant leading-relaxed"
                    style={{ fontFamily: 'Noto Serif, serif', fontStyle: 'italic' }}
                  >
                    "{gridQuoteText.answer.text_content}"
                  </blockquote>
                </div>
              )}

              {/* Wide text card */}
              {featuredText && (
                <div className="md:col-span-2 bg-surface-container-lowest p-10 relative overflow-hidden group polaroid-frame">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined" style={{ fontSize: 96 }}>auto_stories</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                    {featuredText.question.text}
                  </p>
                  <p className="text-on-surface-variant leading-relaxed text-lg" style={{ fontFamily: 'Noto Serif, serif' }}>
                    {featuredText.answer.text_content}
                  </p>
                </div>
              )}

              {/* Remaining answers — each shown exactly once */}
              {gridItems.map(({ question, answer }) => {
                if (answer.media_url && !answer.media_type) {
                  return (
                    <div key={question.id} className="bg-surface-container-lowest overflow-hidden polaroid-frame">
                      <img src={answer.media_url} alt={question.text} className="w-full h-56 object-cover" />
                      <div className="p-4">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">{question.text}</p>
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={question.id} className="bg-surface-container-lowest p-7 polaroid-frame">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{question.text}</p>
                    {answer.text_content && (
                      <p className="text-on-surface-variant leading-relaxed">{answer.text_content}</p>
                    )}
                    {answer.media_url && answer.media_type === 'video' && (
                      <video src={answer.media_url} controls className="w-full mt-2 max-h-64" preload="metadata" />
                    )}
                    {answer.media_url && answer.media_type === 'audio' && (
                      <audio src={answer.media_url} controls className="w-full mt-2" preload="metadata" />
                    )}
                  </div>
                )
              })}

              {/* Unanswered placeholders (moderator preview only) */}
              {unansweredQuestions.map((question) => (
                <div key={question.id} className="bg-surface-container-lowest p-7 polaroid-frame opacity-40 border-2 border-dashed border-on-surface/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{question.text}</p>
                  <p className="text-on-surface-variant/50 text-sm italic">Не е отговорено</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Messages ─────────────────────────────────────────────── */}
        {messages.length > 0 && (
          <section className="max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-12 text-center">
              Пожелания от класа
            </h2>
            <div className="space-y-6">
              {messages.map((msg) => {
                const initial = msg.authorName[0]?.toUpperCase() ?? '?'
                return (
                  <div key={msg.id} className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {initial}
                    </div>
                    <div className="bg-surface-container-lowest p-6 flex-1 polaroid-frame">
                      <h4 className="font-bold text-primary text-sm mb-3">{msg.authorName}</h4>
                      <p
                        className="text-on-surface-variant italic leading-relaxed text-sm"
                        style={{ fontFamily: 'Noto Serif, serif' }}
                      >
                        „{msg.content}"
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Event comments ───────────────────────────────────────── */}
        {studentEvents.length > 0 && (
          <section className="mb-24">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-12 flex items-center gap-4">
              <span className="w-8 h-px bg-primary block" />
              Моите спомени с класа
            </h2>
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {studentEvents.map((ev, i) => {
                const rotation = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1'][i % 4]
                return (
                  <div key={ev.id} className="break-inside-avoid">
                    <div className={`bg-white p-4 shadow-lg ${rotation} transition-transform hover:rotate-0`}>
                      {ev.firstPhoto && (
                        <img src={ev.firstPhoto} alt={ev.title} className="w-full h-auto mb-4" />
                      )}
                      <p className="italic text-sm text-on-surface-variant" style={{ fontFamily: 'Noto Serif, serif' }}>
                        „{ev.title}"
                      </p>
                      {ev.event_date && (
                        <p className="text-xs text-on-surface-variant opacity-60 mt-1">
                          {new Date(ev.event_date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}
                        </p>
                      )}
                      {ev.comment && (
                        <p className="text-xs text-primary font-medium mt-2 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
                          {ev.comment}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Prev / Next ───────────────────────────────────────────── */}
        {!embedded && (
          <div className="flex justify-between items-center pt-8 max-w-3xl mx-auto bg-surface-container-low px-6 py-4">
            {resolvedPrevHref ? (
              <Link href={resolvedPrevHref} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container transition-colors">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Предишен
              </Link>
            ) : <span />}
            <Link href={resolvedBackHref} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
              Всички деца
            </Link>
            {resolvedNextHref ? (
              <Link href={resolvedNextHref} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container transition-colors">
                Следващ
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            ) : <span />}
          </div>
        )}

      </main>

      {/* ── Fixed bottom navigation — only when not embedded ─────────── */}
      {!embedded && (
        <footer
          className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-3 pt-1 md:pb-5 md:pt-2"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--lex-bg, #faf9f8) 88%, transparent)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 -1px 0 rgba(0,0,0,0.06)',
          }}
        >
          <LexiconBottomNav classId={classId} basePath={basePath} themeId={themeId} />
        </footer>
      )}

      {/* ── Mobile prev/next strip — above bottom nav ────────────────── */}
      {(resolvedPrevHref || resolvedNextHref) && (
        <div
          className="md:hidden fixed left-0 right-0 z-[49] flex items-center justify-between px-5 h-9"
          style={{
            bottom: '60px',
            backgroundColor: 'color-mix(in srgb, var(--lex-bg, #faf9f8) 75%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {resolvedPrevHref ? (
            <Link
              href={resolvedPrevHref}
              className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--lex-primary)' }}
            >
              <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
              Предишен
            </Link>
          ) : <span />}
          {resolvedNextHref ? (
            <Link
              href={resolvedNextHref}
              className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--lex-primary)' }}
            >
              Следващ
              <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
            </Link>
          ) : <span />}
        </div>
      )}

    </div>
  )
}
