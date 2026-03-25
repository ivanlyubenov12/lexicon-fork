'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import PhotoUpload from '../PhotoUpload'
import { saveDraft, submitAnswer } from '../actions'

interface WizardQuestion {
  id: string
  text: string
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
  const inputRef                    = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
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
    if (!videoUrl) { onNext(); return }
    setSubmitting(true)
    setError(null)
    const res = await submitAnswer(studentId, question.id, { media_url: videoUrl, media_type: 'video' })
    if (res.error) { setError(res.error); setSubmitting(false) }
    else onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Видео</p>
        <h2 className="text-2xl font-bold text-indigo-900 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
          {question.text}
        </h2>
      </div>

      <div className="flex flex-col items-center gap-4 py-2">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full rounded-2xl border border-gray-200 shadow-sm max-h-56 bg-black"
          />
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-full h-40 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-100 transition-colors"
          >
            <span className="material-symbols-outlined text-4xl text-indigo-300">videocam</span>
            <p className="text-sm text-indigo-400 font-medium">Добавете видео</p>
            <p className="text-xs text-gray-400">MP4, MOV, WebM — до 100 MB</p>
          </div>
        )}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2 disabled:opacity-50"
        >
          {uploading ? 'Качва се...' : videoUrl ? 'Смени видеото' : 'Избери файл'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

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

export default function WizardClient({
  studentId,
  firstName,
  lastName,
  photoUrl,
  questions,
}: Props) {
  const steps = buildSteps(questions)
  const [stepIndex, setStepIndex] = useState(0)

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
                  className="text-2xl font-bold text-indigo-900 mb-2"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  Здравейте!
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Ще попълним страницата на{' '}
                  <strong className="text-gray-800">{firstName} {lastName}</strong>{' '}
                  в лексикона на класа. Ще ви отнеме само няколко минути.
                </p>
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
                Нека започнем →
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
                <p className="text-sm text-gray-400 mt-1">
                  Тя ще се появи на страницата на детето в лексикона.
                </p>
              </div>

              <div className="flex flex-col items-center py-4">
                <PhotoUpload
                  studentId={studentId}
                  photoUrl={photoUrl}
                  firstName={firstName}
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
              studentId={studentId}
              question={step.question}
              onNext={next}
              onBack={back}
            />
          )}
          {step.kind === 'question' && step.question.type !== 'video' && (
            <QuestionStep
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
