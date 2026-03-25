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
    <div className="bg-primary-container text-on-primary p-8 relative overflow-hidden">
      <div className="relative z-10 mb-4">
        <span className="material-symbols-outlined text-4xl mb-3 block text-on-primary/60" style={{ fontVariationSettings: "'FILL' 1" }}>
          videocam
        </span>
        <h3 className="font-headline font-bold text-lg mb-1 text-white">{question.text}</h3>
      </div>
      <div className="relative group cursor-pointer" onClick={handlePlay}>
        <video
          ref={videoRef}
          src={answer.media_url!}
          className="w-full h-44 object-cover opacity-70 group-hover:opacity-90 transition-opacity"
          preload="metadata"
          controls={playing}
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>
        )}
      </div>
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
  prevStudentId,
  nextStudentId,
  prevHref,
  nextHref,
  backHref,
  basePath,
  isPremium = false,
}: Props) {
  const resolvedPrevHref = prevHref !== undefined ? prevHref : (prevStudentId ? `/lexicon/${classId}/student/${prevStudentId}` : null)
  const resolvedNextHref = nextHref !== undefined ? nextHref : (nextStudentId ? `/lexicon/${classId}/student/${nextStudentId}` : null)
  const resolvedBackHref = backHref ?? `/lexicon/${classId}/students`
  const answerMap = new Map(answers.map((a) => [a.question_id, a]))
  const answeredQuestions = questions.filter((q) => answerMap.has(q.id))

  const textQA = answeredQuestions
    .filter((q) => { const a = answerMap.get(q.id)!; return a.text_content && !a.media_url })
    .map((q) => ({ question: q, answer: answerMap.get(q.id)! }))

  const videoQA = isPremium
    ? answeredQuestions.filter((q) => answerMap.get(q.id)?.media_type === 'video').map((q) => ({ question: q, answer: answerMap.get(q.id)! }))
    : []

  const audioQA = answeredQuestions
    .filter((q) => answerMap.get(q.id)?.media_type === 'audio')
    .map((q) => ({ question: q, answer: answerMap.get(q.id)! }))

  const imageQA = answeredQuestions
    .filter((q) => { const a = answerMap.get(q.id)!; return a.media_url && !a.media_type })
    .map((q) => ({ question: q, answer: answerMap.get(q.id)! }))

  const featuredText  = textQA[0] ?? null
  const quoteText     = textQA[1] ?? textQA[0] ?? null
  const extraText     = textQA.slice(2)
  const firstVideo    = videoQA[0] ?? null
  const firstAudio    = audioQA[0] ?? null
  const extraAnswers  = [...videoQA.slice(1), ...audioQA.slice(1), ...imageQA, ...extraText]
  const initials      = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()

  return (
    <div className="bg-surface min-h-screen pb-32" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Nav — glassmorphism ───────────────────────────────────────── */}
      <nav
        className="w-full top-0 sticky z-50"
        style={{
          backgroundColor: 'rgba(252, 248, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Separator via bg-surface-container-high bottom strip, no border */}
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-screen-xl mx-auto">
          <Link
            href={resolvedBackHref}
            className="font-headline text-xl italic text-on-surface"
          >
            Един неразделен клас
          </Link>
          <div className="flex items-center gap-4">
            {resolvedPrevHref && (
              <Link
                href={resolvedPrevHref}
                className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Предишно
              </Link>
            )}
            {resolvedNextHref && (
              <Link
                href={resolvedNextHref}
                className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
              >
                Следващо
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            )}
          </div>
        </div>
        <div className="h-px bg-surface-container-high" />
      </nav>

      <main className="max-w-screen-xl mx-auto px-6 py-12">

        {/* ── Hero — Magazine Layout ────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-28">

          {/* Left: Portrait + overlapping name block */}
          <div className="md:col-span-5 relative mb-20 md:mb-0">
            {/* Washi tape at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 tape-overlay z-30" />

            {/* Sharp-frame portrait */}
            <div className="relative z-10 overflow-hidden sharp-frame">
              <HarryPortrait
                src={student.photo_url}
                alt={`${student.first_name} ${student.last_name}`}
                initials={initials}
                variant="portrait"
                messages={messages}
              />
            </div>

            {/* School logo — overlapping bottom-center */}
            {schoolLogoUrl && (
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-5 z-20 w-11 h-11 rounded-full bg-white flex items-center justify-center"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                <img src={schoolLogoUrl} alt="Лого" className="w-full h-full object-contain rounded-full p-1" />
              </div>
            )}

            {/* Overlapping name block */}
            <div
              className="absolute -bottom-10 -right-2 md:-right-6 z-20 p-6 md:p-8 max-w-[260px] md:max-w-xs bg-primary shadow-2xl"
              style={{ transform: 'rotate(1deg)' }}
            >
              <h1 className="font-headline text-4xl md:text-5xl font-bold text-white leading-tight">
                {student.first_name}<br />{student.last_name}
              </h1>
              <p className="text-white/70 mt-2 font-label font-bold tracking-widest uppercase text-[10px]">
                {className.split(' — ')[0]}
              </p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="md:col-span-7 flex flex-col gap-8">

            {/* Featured quote */}
            {quoteText && (
              <section className="bg-surface-container-low p-8 md:p-10 relative">
                <div className="absolute -top-4 left-10 w-24 h-6 tape-overlay pointer-events-none" />
                <h3 className="font-label text-xs font-bold uppercase tracking-widest text-primary mb-4">
                  {quoteText.question.text}
                </h3>
                <blockquote
                  className="text-2xl md:text-3xl text-on-surface-variant leading-relaxed"
                  style={{ fontFamily: 'Noto Serif, serif', fontStyle: 'italic' }}
                >
                  "{quoteText.answer.text_content}"
                </blockquote>
              </section>
            )}

            {/* Personal facts */}
            {extraText.slice(0, 3).map(({ question, answer }) => (
              <div key={question.id} className="flex items-start gap-4">
                <div className="p-3 bg-primary-fixed flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">format_quote</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">
                    {question.text}
                  </p>
                  <p className="font-headline text-lg text-on-surface">{answer.text_content}</p>
                </div>
              </div>
            ))}

            {/* Video if exists */}
            {firstVideo && (
              <VideoCard answer={firstVideo.answer} question={firstVideo.question} />
            )}

            {/* Audio if exists */}
            {firstAudio && (
              <div className="bg-tertiary-container text-white p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-headline text-xl font-bold mb-3 flex items-center gap-2 text-on-tertiary-fixed">
                    <span className="material-symbols-outlined">mic</span>
                    Гласова бележка
                  </h3>
                  <p className="text-sm italic opacity-80 mb-6 text-on-tertiary-fixed-variant">
                    „{firstAudio.question.text}"
                  </p>
                </div>
                <AudioPlayer src={firstAudio.answer.media_url!} />
              </div>
            )}
          </div>
        </section>

        {/* ── Answers grid ─────────────────────────────────────────── */}
        {(featuredText || extraAnswers.length > 0) && (
          <section className="mb-24">
            <h2
              className="font-headline text-3xl font-bold text-on-surface mb-12 flex items-center gap-4"
            >
              <span className="w-8 h-px bg-primary block" />
              Живи спомени
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Featured answer — wide */}
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

              {/* Video question placeholder — shown when no video submitted */}
              {!firstVideo && !firstAudio && featuredText && (() => {
                const videoQ = questions.find(q => q.type === 'video')
                return (
                  <div className="bg-on-background flex flex-col justify-between overflow-hidden relative" style={{ minHeight: 220 }}>
                    {/* Dark noise texture feel */}
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #3632b7 0%, transparent 60%), radial-gradient(circle at 80% 20%, #674000 0%, transparent 60%)' }}
                    />
                    <div className="relative z-10 p-6 flex flex-col justify-between h-full gap-6">
                      <div className="flex items-center justify-center flex-1">
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/50 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            videocam
                          </span>
                        </div>
                      </div>
                      {videoQ && (
                        <p className="text-white/50 text-sm italic leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
                          „{videoQ.text}"
                        </p>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Image answers */}
              {imageQA.map(({ question, answer }) => (
                <div key={question.id} className="bg-surface-container-lowest overflow-hidden polaroid-frame">
                  <img src={answer.media_url!} alt={question.text} className="w-full h-56 object-cover" />
                  <div className="p-4">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{question.text}</p>
                  </div>
                </div>
              ))}

              {/* Extra text/video/audio answers */}
              {extraAnswers.map(({ question, answer }) => (
                <div key={question.id} className="bg-surface-container-lowest p-7 polaroid-frame">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                    {question.text}
                  </p>
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

        {/* ── Prev / Next ───────────────────────────────────────────── */}
        <div className="flex justify-between items-center pt-8 max-w-3xl mx-auto bg-surface-container-low px-6 py-4">
          {resolvedPrevHref ? (
            <Link href={resolvedPrevHref} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Предишно дете
            </Link>
          ) : <span />}
          <Link href={resolvedBackHref} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            Всички деца
          </Link>
          {resolvedNextHref ? (
            <Link href={resolvedNextHref} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container transition-colors">
              Следващо дете
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          ) : <span />}
        </div>

      </main>

      {/* ── Fixed bottom navigation ──────────────────────────────────── */}
      <footer
        className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 pb-8 pt-4 rounded-t-[2rem]"
        style={{
          backgroundColor: 'rgba(252, 248, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 40px rgba(27,13,162,0.06)',
        }}
      >
        <LexiconBottomNav classId={classId} basePath={basePath} />
      </footer>

    </div>
  )
}
