'use client'

import { useEffect, useState } from 'react'
import { submitClassVoiceAnswer } from './actions'

interface Question {
  id: string
  text: string
  order_index: number
  poll_options?: string[] | null
}

interface Props {
  classId: string
  questions: Question[]
  onFinalize?: () => void
}

function VoiceQuestionCard({
  classId,
  question,
  submitted,
  onSubmitted,
}: {
  classId: string
  question: Question
  submitted: boolean
  onSubmitted: () => void
}) {
  const isSurvey = Array.isArray(question.poll_options) && question.poll_options.length > 0
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const value = isSurvey ? selected : text
    if (!value?.trim()) return
    setError(null)
    setSubmitting(true)
    const result = await submitClassVoiceAnswer(classId, question.id, value.trim())
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`class_voice_${classId}_${question.id}`, '1')
      }
      onSubmitted()
    }
  }

  return (
    <div className="bg-[#faf9f8] rounded-2xl p-5 space-y-3">
      <p className="font-semibold text-gray-900" style={{ fontFamily: 'Noto Serif, serif' }}>
        {question.text}
      </p>

      {submitted ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium py-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
          Изпратено анонимно ✓
        </div>
      ) : isSurvey ? (
        <div className="space-y-2">
          {question.poll_options!.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(opt)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                selected === opt
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200'
              }`}
            >
              {opt}
            </button>
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">Анонимен отговор</span>
            <div className="flex items-center gap-3">
              {error && <span className="text-xs text-red-500">{error}</span>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !selected}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Изпращане...' : 'Изпрати'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={4}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Вашият анонимен отговор…"
            maxLength={400}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length}/400</span>
            <div className="flex items-center gap-3">
              {error && <span className="text-xs text-red-500">{error}</span>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Изпращане...' : 'Изпрати'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClassVoiceSection({ classId, questions, onFinalize }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const initial = new Set<string>()
    for (const q of questions) {
      if (localStorage.getItem(`class_voice_${classId}_${q.id}`)) {
        initial.add(q.id)
      }
    }
    setSubmittedIds(initial)
  }, [classId, questions])

  if (questions.length === 0) return null

  const question = questions[currentIndex]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{currentIndex + 1} от {questions.length}</span>
        {submittedIds.size > 0 && (
          <span className="text-emerald-600 font-medium">{submittedIds.size} / {questions.length} изпратени</span>
        )}
      </div>

      <VoiceQuestionCard
        key={question.id}
        classId={classId}
        question={question}
        submitted={submittedIds.has(question.id)}
        onSubmitted={() => setSubmittedIds(prev => new Set([...prev, question.id]))}
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex-none px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          ← Назад
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(i => i + 1)}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Напред →
          </button>
        ) : (
          <button
            onClick={onFinalize}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Финализирай секцията ✓
          </button>
        )}
      </div>
    </div>
  )
}
