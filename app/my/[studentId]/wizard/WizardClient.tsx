'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PhotoUpload from '../PhotoUpload'
import RecordMedia from '../question/[questionId]/RecordMedia'
import { saveDraft, submitAnswer } from '../actions'

interface WizardQuestion {
  id: string
  text: string
  description: string | null
  type: 'video' | 'personal' | 'superhero'
  maxLength: number | null
  existingAnswer: string
  existingMediaUrl: string | null
  existingStatus: string | null
}

interface Props {
  studentId: string
  firstName: string
  lastName: string
  photoUrl: string | null
  questions: WizardQuestion[]
  className: string | null
  deadline: string | null
}

// ── Step definitions ──────────────────────────────────────────────────────────

type Step =
  | { kind: 'intro' }
  | { kind: 'photo' }
  | { kind: 'question'; question: WizardQuestion }
  | { kind: 'done' }

function buildSteps(questions: WizardQuestion[]): Step[] {
  return [
    { kind: 'intro' },
    { kind: 'photo' },
    ...questions.map(q => ({ kind: 'question' as const, question: q })),
    { kind: 'done' },
  ]
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span>Стъпка {current} от {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Question step ─────────────────────────────────────────────────────────────

function QuestionStep({
  studentId,
  question,
  onNext,
  onBack,
}: {
  studentId: string
  question: WizardQuestion
  onNext: () => void
  onBack: () => void
}) {
  const [text, setText]             = useState(question.existingAnswer)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef                = useRef(question.existingAnswer)

  // Reset when question changes
  useEffect(() => {
    setText(question.existingAnswer)
    lastSavedRef.current = question.existingAnswer
    setSaveStatus('idle')
    setError(null)
  }, [question.id, question.existingAnswer])

  // Auto-save draft
  useEffect(() => {
    if (text === lastSavedRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    debounceRef.current = setTimeout(async () => {
      const res = await saveDraft(studentId, question.id, text)
      if (!res.error) {
        lastSavedRef.current = text
        setSaveStatus('saved')
      } else {
        setSaveStatus('idle')
      }
    }, 2000)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [text, studentId, question.id])

  async function handleNext() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!text.trim()) { onNext(); return }   // allow skipping empty
    setSubmitting(true)
    setError(null)
    const res = await submitAnswer(studentId, question.id, { text_content: text })
    if (res.error) {
      setError(res.error)
      setSubmitting(false)
    } else {
      onNext()
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
          Въпрос
        </p>
        <h2
          className="text-2xl font-bold text-indigo-900 leading-snug"
          style={{ fontFamily: 'Noto Serif, serif' }}
        >
          {question.text}
        </h2>
        {question.description && (
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{question.description}</p>
        )}
      </div>

      <div className="relative">
        <textarea
          rows={5}
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={question.maxLength ?? undefined}
          placeholder="Напишете отговора тук..."
          autoFocus
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none shadow-sm"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {question.maxLength && (
            <span className="text-xs text-gray-300">{text.length}/{question.maxLength}</span>
          )}
          {saveStatus === 'saving' && <span className="text-xs text-gray-400">Записва се...</span>}
          {saveStatus === 'saved'  && <span className="text-xs text-emerald-500">Записано ✓</span>}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          ← Назад
        </button>
        <button
          onClick={handleNext}
          disabled={submitting}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? 'Записва се...' : text.trim() ? 'Напред →' : 'Пропусни →'}
        </button>
      </div>
    </div>
  )
}

// ── Video step ────────────────────────────────────────────────────────────────

function VideoStep({
  studentId,
  question,
  onNext,
  onBack,
}: {
  studentId: string
  question: WizardQuestion
  onNext: () => void
  onBack: () => void
}) {
  const [videoUrl, setVideoUrl]     = useState<string | null>(question.existingMediaUrl)
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const pendingFileRef              = useRef<File | null>(null)

  async function uploadFile(file: File) {
    setError(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res  = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error || !data.url) { setError('Качването не успя.'); return }
      setVideoUrl(data.url)
    } catch {
      setError('Качването не успя.')
    } finally {
      setUploading(false)
    }
  }

  async function handleNext() {
    // If there's a pending file that hasn't been uploaded yet, upload it first
    if (pendingFileRef.current && !videoUrl) {
      await uploadFile(pendingFileRef.current)
      pendingFileRef.current = null
      return  // state update will re-render; user taps Напред again
    }
    if (!videoUrl) { onNext(); return }
    setSubmitting(true)
    setError(null)
    const res = await submitAnswer(studentId, question.id, { media_url: videoUrl, media_type: 'video' })
    if (res.error) { setError(res.error); setSubmitting(false) }
    else onNext()
  }

  function handleReady(file: File) {
    pendingFileRef.current = file
    // Auto-upload immediately
    uploadFile(file)
  }

  function handleClear() {
    pendingFileRef.current = null
    setVideoUrl(null)
    setError(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Видео</p>
        <h2 className="text-2xl font-bold text-indigo-900 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
          {question.text}
        </h2>
      </div>

      {/* Show uploaded video above the recorder when available */}
      {videoUrl && (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-2xl border border-gray-200 shadow-sm max-h-56 bg-black"
          />
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 w-full text-center"
          >
            Смени видеото
          </button>
        </div>
      )}

      {!videoUrl && (
        <RecordMedia
          type="video"
          onReady={handleReady}
          onClear={handleClear}
          disabled={uploading || submitting}
        />
      )}

      {uploading && (
        <p className="text-xs text-indigo-500 text-center flex items-center justify-center gap-1">
          <span className="animate-spin">↻</span> Качва се...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          ← Назад
        </button>
        <button
          onClick={handleNext}
          disabled={submitting || uploading}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? 'Записва се...' : videoUrl ? 'Напред →' : 'Пропусни →'}
        </button>
      </div>
    </div>
  )
}

// ── Main wizard ───────────────────────────────────────────────────────────────

function findResumeStep(steps: Step[], photoUrl: string | null): number {
  const hasStarted = !!photoUrl || steps.some(
    s => s.kind === 'question' && (s.question.existingAnswer || s.question.existingMediaUrl)
  )
  if (!hasStarted) return 0  // first visit → show intro

  // Skip intro, find first incomplete step
  for (let i = 1; i < steps.length; i++) {
    const s = steps[i]
    if (s.kind === 'photo' && !photoUrl) return i
    if (s.kind === 'question' && !s.question.existingAnswer && !s.question.existingMediaUrl) return i
    if (s.kind === 'done') return i
  }
  return 0
}

export default function WizardClient({
  studentId,
  firstName,
  lastName,
  photoUrl,
  questions,
  className,
  deadline,
}: Props) {
  const router = useRouter()
  const steps = buildSteps(questions)
  const [stepIndex, setStepIndex] = useState(() => findResumeStep(steps, photoUrl))

  // Redirect to the student's main page when wizard is complete
  useEffect(() => {
    if (steps[stepIndex]?.kind === 'done') {
      router.push(`/my/${studentId}`)
    }
  }, [stepIndex, studentId, router, steps])

  const step        = steps[stepIndex]
  const totalVisible = steps.length - 2  // exclude intro and done from count display
  const visibleIndex = stepIndex - 1     // 0-based after intro

  function next() { setStepIndex(i => Math.min(i + 1, steps.length - 1)) }
  function back() { setStepIndex(i => Math.max(i - 1, 0)) }

  return (
    <div
      className="min-h-screen bg-[#faf9f8] flex flex-col items-center px-6 py-10"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Brand */}
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-8">
        Един неразделен клас
      </p>

      <div className="w-full max-w-md">
        {/* Progress (skip on intro/done) */}
        {step.kind !== 'intro' && step.kind !== 'done' && (
          <ProgressBar current={visibleIndex} total={totalVisible} />
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* ── Intro ─────────────────────────────────────────────────────── */}
          {step.kind === 'intro' && (
            <div className="text-center space-y-5">
              <div
                className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl mx-auto"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                {firstName[0]}
              </div>
              <div>
                <h1
                  className="text-2xl font-bold text-indigo-900 mb-3"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  Здравейте!
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Тук ще попълните страницата на{' '}
                  <strong className="text-gray-900">{firstName} {lastName}</strong>{' '}
                  в лексикона на класа. Попълването отнема само няколко минути.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">
                  Можете да прекъснете по всяко време и да се върнете да довършите, когато е удобно
                  за Вас и <strong className="text-gray-700">{firstName}</strong>.
                  За да влезете отново, използвайте потребителско Ime и парола.
                </p>
                {deadline && (
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Срокът за попълване на въпросника е{' '}
                    <strong className="text-gray-700">
                      {new Date(deadline).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </strong>.
                  </p>
                )}
              </div>
              {questions.length > 0 && (
                <p className="text-xs text-gray-400">
                  {questions.length} въпроса + снимка
                </p>
              )}
              <button
                onClick={next}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Да започваме! →
              </button>
            </div>
          )}

          {/* ── Photo ─────────────────────────────────────────────────────── */}
          {step.kind === 'photo' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
                  Снимка
                </p>
                <h2
                  className="text-2xl font-bold text-indigo-900"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  Добавете снимка на {firstName}
                </h2>
                {className && (
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mt-1">
                    {className}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  Тя ще се появи на страницата на детето в лексикона.
                </p>
              </div>

              <div className="py-2">
                <PhotoUpload
                  studentId={studentId}
                  photoUrl={photoUrl}
                  firstName={firstName}
                  wizardMode
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={back}
                  className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  ← Назад
                </button>
                <button
                  onClick={next}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Напред →
                </button>
              </div>
            </div>
          )}

          {/* ── Question ──────────────────────────────────────────────────── */}
          {step.kind === 'question' && step.question.type === 'video' && (
            <VideoStep
              key={step.question.id}
              studentId={studentId}
              question={step.question}
              onNext={next}
              onBack={back}
            />
          )}
          {step.kind === 'question' && step.question.type !== 'video' && (
            <QuestionStep
              key={step.question.id}
              studentId={studentId}
              question={step.question}
              onNext={next}
              onBack={back}
            />
          )}

          {/* ── Done ──────────────────────────────────────────────────────── */}
          {step.kind === 'done' && (
            <div className="text-center space-y-5">
              <span className="material-symbols-outlined text-6xl text-emerald-400 block">
                celebration
              </span>
              <div>
                <h2
                  className="text-2xl font-bold text-indigo-900 mb-2"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  Готово!
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Страницата на <strong className="text-gray-800">{firstName}</strong>{' '}
                  е изпратена за преглед. Учителят ще я одобри и ще се появи в лексикона.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href={`/my/${studentId}/preview`}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors text-center shadow-sm"
                >
                  Виж как ще изглежда страницата →
                </Link>
                <Link
                  href={`/my/${studentId}`}
                  className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors text-center"
                >
                  Към моя профил
                </Link>
                <button
                  onClick={() => setStepIndex(2)}
                  className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Редактирай отговорите
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Skip link below card */}
        {(step.kind === 'photo') && (
          <p className="text-center mt-4">
            <button
              onClick={next}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              Пропусни снимката засега
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
