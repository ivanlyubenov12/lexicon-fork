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
    description?: string | null
    type: string
    order_index: number
    max_length: number | null
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

export default function AnswerForm({
  studentId,
  question,
  answer,
  prevQuestionId,
  nextQuestionId,
  nextUnansweredId,
}: Props) {
  const router = useRouter()
  const isVideo = question.type === 'video'

  // ── Text state ──────────────────────────────────────────────────────────────
  const [textValue, setTextValue] = useState(answer?.text_content ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── Video state ─────────────────────────────────────────────────────────────
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef(answer?.text_content ?? '')

  // Auto-save text draft (3s debounce)
  useEffect(() => {
    if (isVideo) return
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
  }, [textValue, isVideo, studentId, question.id])

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

  async function handleVideoSubmit() {
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

      const result = await submitAnswer(studentId, question.id, {
        media_url: data.url,
        media_type: 'video',
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
  const isLocked = answerStatus === 'submitted' || answerStatus === 'approved'

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Back */}
        <Link
          href={`/my/${studentId}`}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-6 font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </Link>

        {/* Question */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {isVideo ? (
                <>
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
                  Видео въпрос
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xs">article</span>
                  Въпрос {question.order_index}
                </>
              )}
            </span>
          </div>
          <h1
            className="text-2xl font-bold text-indigo-900 leading-snug"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            {question.text}
          </h1>
          {question.description && (
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{question.description}</p>
          )}
        </div>

        {/* Status banners */}
        {answerStatus === 'approved' && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Одобрен
          </div>
        )}
        {answerStatus === 'submitted' && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">schedule</span>
            Изпратено — чака одобрение
          </div>
        )}
        {answer?.status === 'draft' && answer.moderator_note && !isLocked && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-5">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">feedback</span>
              Бележка от модератора
            </p>
            <p>{answer.moderator_note}</p>
          </div>
        )}

        {/* ── Video question ────────────────────────────────────────────────── */}
        {isVideo && (
          <div className="space-y-4">
            {/* Existing approved video */}
            {answer?.media_url && isLocked ? (
              <video
                src={answer.media_url}
                controls
                className="w-full rounded-2xl border border-gray-200 max-h-64 bg-black"
                preload="metadata"
              />
            ) : (
              <RecordMedia
                type="video"
                onReady={(file) => setMediaFile(file)}
                onClear={() => setMediaFile(null)}
                disabled={uploading || isLocked}
              />
            )}

            {uploading && (
              <div className="text-sm text-indigo-600 text-center font-medium">Качва се...</div>
            )}
            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {submitError}
              </div>
            )}

            {!isLocked && (
              <button
                onClick={handleVideoSubmit}
                disabled={!mediaFile || uploading}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Изпрати видеото
              </button>
            )}
          </div>
        )}

        {/* ── Text question ─────────────────────────────────────────────────── */}
        {!isVideo && (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                rows={5}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                maxLength={question.max_length ?? undefined}
                placeholder="Напишете отговора тук..."
                disabled={isLocked}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-3">
                {question.max_length && (
                  <span className="text-xs text-gray-300">
                    {textValue.length}/{question.max_length}
                  </span>
                )}
                {saveStatus === 'saving' && (
                  <span className="text-xs text-gray-400">Записва се...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-xs text-green-500">Записано</span>
                )}
              </div>
            </div>

            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {submitError}
              </div>
            )}

            {!isLocked && (
              <button
                onClick={handleTextSubmit}
                disabled={!textValue.trim()}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Изпрати
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-5 border-t border-gray-200">
          {prevQuestionId ? (
            <Link
              href={`/my/${studentId}/question/${prevQuestionId}`}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Предишен
            </Link>
          ) : <span />}
          {nextQuestionId ? (
            <Link
              href={`/my/${studentId}/question/${nextQuestionId}`}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Следващ
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          ) : <span />}
        </div>

      </div>
    </div>
  )
}
