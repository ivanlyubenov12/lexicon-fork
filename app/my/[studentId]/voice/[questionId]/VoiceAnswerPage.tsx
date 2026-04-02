'use client'

import { useState } from 'react'
import { submitClassVoiceAnswer } from '../../actions'

interface Question {
  id: string
  text: string
  description?: string | null
  type: string
  poll_options?: string[] | null
  is_anonymous?: boolean | null
  max_length?: number | null
}

interface Classmate {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
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
  classmates?: Classmate[]
}

const MAX_WORD_PICKS = 3

export default function VoiceAnswerPage({
  studentId, classId, question, existingAnswer,
  prevUrl, nextUrl, questionNumber, totalQuestions,
  classmates = [],
}: Props) {
  const hasPollOptions = Array.isArray(question.poll_options) && question.poll_options.length > 0
  const isStudentPoll = question.type === 'survey' && question.poll_options?.[0] === '__students__'
  const isSurvey  = hasPollOptions && question.type === 'survey' && !isStudentPoll
  const isWordPicker = hasPollOptions && question.type === 'class_voice'
  const isAnonymous = question.is_anonymous !== false

  // ── Survey (single-select + Друго) ─────────────────────────────────────────
  const isPredefinedOption = (v: string | null) =>
    v != null && question.poll_options?.includes(v)

  const [surveySelected, setSurveySelected] = useState<string | null>(
    existingAnswer && isPredefinedOption(existingAnswer) ? existingAnswer : null
  )
  const [surveyCustom, setSurveyCustom] = useState(
    existingAnswer && !isPredefinedOption(existingAnswer) ? existingAnswer : ''
  )
  const [surveyOther, setSurveyOther] = useState(
    !!existingAnswer && !isPredefinedOption(existingAnswer)
  )

  // ── Student picker ─────────────────────────────────────────────────────────
  const [pickedStudent, setPickedStudent] = useState<string | null>(existingAnswer ?? null)

  // ── Word picker (multi-select up to 3 + Друго) ─────────────────────────────
  const parseWordPicker = (s: string | null): string[] =>
    s ? s.split(',').map(w => w.trim()).filter(Boolean) : []

  const [pickedWords, setPickedWords] = useState<string[]>(() => parseWordPicker(existingAnswer))
  const [customWord, setCustomWord] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  function toggleWord(word: string) {
    setPickedWords(prev => {
      if (prev.includes(word)) return prev.filter(w => w !== word)
      if (prev.length >= MAX_WORD_PICKS) return prev
      return [...prev, word]
    })
  }

  // ── Free text ───────────────────────────────────────────────────────────────
  const [text, setText] = useState(existingAnswer ?? '')

  // ── Submission state ────────────────────────────────────────────────────────
  const [submitted, setSubmitted] = useState(!!existingAnswer)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function buildValue(): string | null {
    if (isStudentPoll) return pickedStudent
    if (isSurvey) {
      if (surveyOther) return surveyCustom.trim() || null
      return surveySelected
    }
    if (isWordPicker) {
      const all = [...pickedWords]
      if (customWord.trim()) all.push(customWord.trim())
      return all.length > 0 ? all.join(',') : null
    }
    return text.trim() || null
  }

  const textLimit = question.max_length ?? 150
  const textOver = !isStudentPoll && !isSurvey && !isWordPicker && text.length > textLimit
  const canSubmit = !!buildValue() && !textOver

  async function handleSubmit() {
    const value = buildValue()
    if (!value) return
    setError(null)
    setSubmitting(true)
    const wasSubmitted = submitted
    const result = await submitClassVoiceAnswer(classId, question.id, value, studentId)
    setSubmitting(false)
    if (result.error) { setError(result.error); return }
    setSubmitted(true)
    if (!wasSubmitted) {
      window.location.href = nextUrl ?? `/my/${studentId}`
    }
  }

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

        {/* Submitted banner (anonymous voice) */}
        {submitted && isAnonymous && !isSurvey && !isWordPicker && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Изпратено анонимно ✓
          </div>
        )}

        {/* ── Student picker ────────────────────────────────────────── */}
        {isStudentPoll && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Избери един участник
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {classmates.map(cm => {
                const isSelected = pickedStudent === cm.first_name + ' ' + cm.last_name
                const initials = `${cm.first_name?.[0] ?? ''}${cm.last_name?.[0] ?? ''}`.toUpperCase()
                return (
                  <button
                    key={cm.id}
                    type="button"
                    onClick={() => {
                      setPickedStudent(isSelected ? null : cm.first_name + ' ' + cm.last_name)
                      if (submitted) setSubmitted(false)
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    {cm.photo_url ? (
                      <img
                        src={cm.photo_url}
                        alt={cm.first_name}
                        className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${isSelected ? 'border-indigo-400' : 'border-gray-100'}`}
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                        isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-100 text-indigo-600 border-transparent'
                      }`}>{initials}</div>
                    )}
                    <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                      {cm.first_name}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Word picker ───────────────────────────────────────────── */}
        {isWordPicker && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Избери до {MAX_WORD_PICKS} думи
              {pickedWords.length > 0 && (
                <span className="ml-2 text-indigo-600">{pickedWords.length}/{MAX_WORD_PICKS}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {question.poll_options!.map(word => {
                const active = pickedWords.includes(word)
                const disabled = !active && pickedWords.length >= MAX_WORD_PICKS
                return (
                  <button
                    key={word}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleWord(word)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                        : disabled
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    {active && <span className="mr-1">✓</span>}{word}
                  </button>
                )
              })}

              {/* Друго */}
              <button
                type="button"
                onClick={() => setShowCustom(prev => !prev)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  showCustom
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-dashed border-gray-300 bg-white text-gray-500 hover:border-amber-300'
                }`}
              >
                + Друго
              </button>
            </div>

            {showCustom && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customWord}
                  onChange={e => setCustomWord(e.target.value)}
                  placeholder="Напиши своя дума..."
                  maxLength={50}
                  autoFocus
                  className="w-full border border-amber-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Survey options (single-select + Друго) ───────────────── */}
        {isSurvey && (
          <div className="space-y-2 mb-6">
            {question.poll_options!.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSurveySelected(opt)
                  setSurveyOther(false)
                  if (submitted) setSubmitted(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  surveySelected === opt && !surveyOther
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
                }`}
              >
                {opt}
              </button>
            ))}

            {/* Друго */}
            <button
              type="button"
              onClick={() => {
                setSurveyOther(true)
                setSurveySelected(null)
                if (submitted) setSubmitted(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                surveyOther
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-dashed border-gray-300 bg-white text-gray-500 hover:border-amber-300'
              }`}
            >
              + Друго
            </button>

            {surveyOther && (
              <input
                type="text"
                value={surveyCustom}
                onChange={e => setSurveyCustom(e.target.value)}
                placeholder="Напиши своя отговор..."
                maxLength={100}
                autoFocus
                className="w-full border border-amber-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            )}
          </div>
        )}

        {/* ── Free text ─────────────────────────────────────────────── */}
        {!isStudentPoll && !isSurvey && !isWordPicker && (!submitted || !isAnonymous) && (() => {
          const limit = question.max_length ?? 150
          const over = text.length > limit
          return (
            <div className="mb-6">
              <div className="relative">
                <textarea
                  rows={5}
                  value={text}
                  onChange={e => { setText(e.target.value); if (submitted) setSubmitted(false) }}
                  placeholder={isAnonymous ? 'Вашият анонимен отговор…' : 'Вашият отговор…'}
                  className={`w-full border rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 resize-none bg-white shadow-sm ${
                    over ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-400'
                  }`}
                />
                <span className={`absolute bottom-3 right-3 text-xs ${over ? 'text-red-500 font-semibold' : 'text-gray-300'}`}>
                  {text.length}/{limit}
                </span>
              </div>
              {over && (
                <p className="text-xs text-red-500 mt-1 px-1">
                  Текстът е прекалено дълъг — съкратете до {limit} знака ({text.length - limit} в повече).
                </p>
              )}
            </div>
          )
        })()}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {/* Submit button */}
        {(!submitted || (!isAnonymous && (isSurvey || isWordPicker))) && (
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
