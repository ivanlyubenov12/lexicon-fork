'use client'

import { useEffect, useState } from 'react'
import { submitClassVoiceAnswer } from './actions'

interface Question {
  id: string
  text: string
  order_index: number
}

interface Props {
  classId: string
  questions: Question[]
}

function ClassVoiceQuestion({ classId, question }: { classId: string; question: Question }) {
  const storageKey = `class_voice_${classId}_${question.id}`
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
      setSubmitted(true)
    }
  }, [storageKey])

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    const result = await submitClassVoiceAnswer(classId, question.id, text)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      localStorage.setItem(storageKey, '1')
      setSubmitted(true)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm font-medium text-gray-800 mb-3">{question.text}</p>

      {submitted ? (
        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Изпратено анонимно ✓
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вашият анонимен отговор…"
            maxLength={400}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length}/400</span>
            <div className="flex items-center gap-3">
              {error && <span className="text-xs text-red-500">{error}</span>}
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default function ClassVoiceSection({ classId, questions }: Props) {
  if (questions.length === 0) return null

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <ClassVoiceQuestion key={q.id} classId={classId} question={q} />
      ))}
    </div>
  )
}
