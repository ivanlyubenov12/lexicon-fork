'use client'

import { useState, useEffect } from 'react'
import { submitClassVoiceAnswer } from '../../actions'

interface Question {
  id: string
  text: string
  description?: string | null
  type: string
  poll_options?: string[] | null
  is_anonymous?: boolean | null
}

interface Props {
  studentId: string
  classId: string
  question: Question
  existingAnswer: string | null
  prevUrl: string | null
  nextUrl: string | null
  questionNumber: number
  totalQuestions: number
}

export default function VoiceAnswerPage({
  studentId, classId, question, existingAnswer,
  prevUrl, nextUrl, questionNumber, totalQuestions,
}: Props) {
  const isSurvey = Array.isArray(question.poll_options) && question.poll_options.length > 0
  const isAnonymous = question.is_anonymous !== false

  const [text, setText] = useState('')
  const [selected, setSelected] = useState<string | null>(existingAnswer ?? null)
  const [submitted, setSubmitted] = useState(!isAnonymous && !!existingAnswer)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAnonymous && typeof window !== 'undefined') {
      setSubmitted(!!localStorage.getItem(`class_voice_${classId}_${question.id}`))
    }
  }, [isAnonymous, classId, question.id])

  async function handleSubmit() {
    const value = isSurvey ? selected : text.trim()
    if (!value) return
    setError(null)
    setSubmitting(true)
    const wasSubmitted = submitted
    const result = await submitClassVoiceAnswer(
      classId, question.id, value,
      isAnonymous ? undefined : studentId
    )
    setSubmitting(false)
    if (result.error) { setError(result.error); return }
    if (isAnonymous) localStorage.setItem(`class_voice_${classId}_${question.id}`, '1')
    setSubmitted(true)
    // Auto-navigate only on first submission
    if (!wasSubmitted) {
      window.location.href = nextUrl ?? `/my/${studentId}`
    }
  }

  const canSubmit = isSurvey ? !!selected : !!text.trim()

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={() => { window.location.href = `/my/${studentId}` }}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-6 font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </button>

        {/* Question header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              <span className="material-symbols-outlined text-xs">
                {isAnonymous ? 'visibility_off' : 'record_voice_over'}
              </span>
              Въпрос {questionNumber} / {totalQuestions}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-indigo-900 leading-snug" style={{ fontFamily: 'Noto Serif, serif' }}>
            {question.text}
          </h1>
          {question.description && (
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{question.description}</p>
          )}
          {isAnonymous && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">visibility_off</span>
              Анонимен отговор — никой не вижда кой е отговорил
            </p>
          )}
        </div>

        {/* Submitted banner (anonymous) */}
        {submitted && isAnonymous && !isSurvey && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Изпратено анонимно ✓
          </div>
        )}

        {/* Survey options */}
        {isSurvey && (
          <div className="space-y-2 mb-6">
            {question.poll_options!.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { setSelected(opt); if (submitted) setSubmitted(false) }}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selected === opt
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Text input (non-anonymous or not yet submitted anonymous) */}
        {!isSurvey && (!submitted || !isAnonymous) && (
          <div className="mb-6">
            <textarea
              rows={5}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={isAnonymous ? 'Вашият анонимен отговор…' : 'Вашият отговор…'}
              maxLength={400}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white shadow-sm"
            />
            <div className="text-right text-xs text-gray-300 mt-1">{text.length}/400</div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {/* Submit button */}
        {(!submitted || (!isAnonymous && isSurvey)) && (
          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-6"
          >
            {submitting ? 'Изпращане...' : submitted ? 'Промени' : 'Изпрати'}
          </button>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-5 border-t border-gray-200">
          {prevUrl ? (
            <button
              onClick={() => { window.location.href = prevUrl }}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Предишен
            </button>
          ) : <span />}
          {nextUrl ? (
            <button
              onClick={() => { window.location.href = nextUrl }}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Следващ
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => { window.location.href = `/my/${studentId}` }}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Готово ✓
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
