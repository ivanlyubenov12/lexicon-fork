'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveDraft, submitAnswer } from '../../actions'
import RecordMedia from './RecordMedia'

interface Props {
  studentId: string
  question: {
    id: string
    text: string
    order_index: number
    allows_text: boolean
    allows_media: boolean
  }
  answer: {
    id?: string
    text_content?: string | null
    media_url?: string | null
    media_type?: string | null
    status?: string
    moderator_note?: string | null
  } | null
  prevQuestionId: string | null
  nextQuestionId: string | null
  nextUnansweredId: string | null
}

type Tab = 'text' | 'video' | 'audio'

function resolveDefaultTab(question: Props['question']): Tab {
  if (question.order_index === 5) return 'video'
  if (question.allows_text) return 'text'
  if (question.allows_media) return 'video'
  return 'text'
}

export default function AnswerForm({ studentId, question, answer, prevQuestionId, nextQuestionId, nextUnansweredId }: Props) {
  const router = useRouter()
  const isVideoOnly = question.order_index === 5

  const [activeTab, setActiveTab] = useState<Tab>(resolveDefaultTab(question))
  const [textValue, setTextValue] = useState(answer?.text_content ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef(answer?.text_content ?? '')

  // Auto-save draft with 3s debounce
  useEffect(() => {
    if (activeTab !== 'text') return
    if (textValue === lastSavedRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('saving')

    debounceRef.current = setTimeout(async () => {
      const result = await saveDraft(studentId, question.id, textValue)
      if (!result.error) {
        lastSavedRef.current = textValue
        setSaveStatus('saved')
      } else {
        setSaveStatus('idle')
      }
    }, 3000)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [textValue, activeTab, studentId, question.id])

  async function handleTextSubmit() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSubmitError(null)
    const result = await submitAnswer(studentId, question.id, { text_content: textValue })
    if (result.error) {
      setSubmitError(result.error)
    } else {
      setSubmitStatus('submitted')
      if (nextUnansweredId) {
        router.push(`/my/${studentId}/question/${nextUnansweredId}`)
      }
    }
  }

  async function handleMediaSubmit() {
    if (!mediaFile) return
    setSubmitError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('file', mediaFile)

    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.error || !data.url) {
        setSubmitError(data.error ?? 'Качването не успя.')
        setUploading(false)
        return
      }

      const mediaType = activeTab === 'video' ? 'video' : 'audio'
      const result = await submitAnswer(studentId, question.id, {
        media_url: data.url,
        media_type: mediaType,
      })

      if (result.error) {
        setSubmitError(result.error)
      } else {
        setSubmitStatus('submitted')
        if (nextUnansweredId) {
          router.push(`/my/${studentId}/question/${nextUnansweredId}`)
        }
      }
    } catch {
      setSubmitError('Качването не успя. Опитайте отново.')
    } finally {
      setUploading(false)
    }
  }

  const answerStatus = submitStatus ?? answer?.status

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href={`/my/${studentId}`}
          className="inline-flex items-center text-sm text-indigo-600 hover:underline mb-6"
        >
          ← Профил на детето
        </Link>

        {/* Question badge + text */}
        <div className="mb-6">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Въпрос {question.order_index}
          </span>
          <h1 className="text-xl font-bold text-gray-800">{question.text}</h1>
        </div>

        {/* Status banners */}
        {answerStatus === 'approved' && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <span>Одобрен ✓</span>
          </div>
        )}
        {answerStatus === 'submitted' && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            Изпратено — чака одобрение ✓
          </div>
        )}
        {answer?.status === 'draft' && answer.moderator_note && answerStatus !== 'submitted' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold mb-1">Бележка от модератора:</p>
            <p>{answer.moderator_note}</p>
          </div>
        )}

        {/* Format selector */}
        {!isVideoOnly && (question.allows_text || question.allows_media) && (
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Избери в какъв формат да е отговорът
            </p>
            <div className="grid grid-cols-3 gap-3">
              {question.allows_text && (
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all ${
                    activeTab === 'text'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">✏️</span>
                  <span className="text-xs font-semibold">Текст</span>
                </button>
              )}
              {question.allows_media && (
                <>
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all ${
                      activeTab === 'video'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">🎥</span>
                    <span className="text-xs font-semibold">Видео</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('audio')}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all ${
                      activeTab === 'audio'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">🎙️</span>
                    <span className="text-xs font-semibold">Аудио</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Video-only indicator */}
        {isVideoOnly && (
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Формат на отговора
            </p>
            <div className="inline-flex flex-col items-center gap-2 py-4 px-6 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-indigo-700">
              <span className="text-2xl">🎥</span>
              <span className="text-xs font-semibold">Видео</span>
            </div>
          </div>
        )}

        {/* Text mode */}
        {activeTab === 'text' && !isVideoOnly && (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                rows={4}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Напишете отговора тук..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              {saveStatus === 'saving' && (
                <span className="absolute bottom-3 right-3 text-xs text-gray-400">Записва се...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="absolute bottom-3 right-3 text-xs text-green-500">Записано</span>
              )}
            </div>

            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {submitError}
              </div>
            )}

            <button
              onClick={handleTextSubmit}
              disabled={answerStatus === 'submitted' || answerStatus === 'approved'}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {answerStatus === 'submitted' ? 'Изчаква одобрение' : 'Изпрати'}
            </button>
          </div>
        )}

        {/* Video / Audio mode */}
        {(activeTab === 'video' || activeTab === 'audio' || isVideoOnly) && (
          <div className="space-y-4">
            <RecordMedia
              type={activeTab === 'audio' ? 'audio' : 'video'}
              onReady={(file) => setMediaFile(file)}
              onClear={() => setMediaFile(null)}
              disabled={uploading || answerStatus === 'submitted' || answerStatus === 'approved'}
            />

            {uploading && (
              <div className="text-sm text-indigo-600 text-center">Качва се...</div>
            )}

            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {submitError}
              </div>
            )}

            <button
              onClick={handleMediaSubmit}
              disabled={!mediaFile || uploading || answerStatus === 'submitted' || answerStatus === 'approved'}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {answerStatus === 'submitted' ? 'Изчаква одобрение' : 'Изпрати'}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          {prevQuestionId ? (
            <Link
              href={`/my/${studentId}/question/${prevQuestionId}`}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              ← Предишен
            </Link>
          ) : (
            <span />
          )}
          {nextQuestionId ? (
            <Link
              href={`/my/${studentId}/question/${nextQuestionId}`}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Следващ →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  )
}
