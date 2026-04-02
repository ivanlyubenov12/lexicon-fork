'use client'

import { useState, useEffect, useRef } from 'react'
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
    allows_text?: boolean | null
  }
  answer: {
    id?: string
    text_content?: string | null
    media_url?: string | null
    media_type?: string | null
    status?: string
    moderator_note?: string | null
  } | null
  prevUrl: string | null
  nextUrl: string | null
  questionNumber: number
  totalQuestions: number
}

export default function AnswerForm({
  studentId,
  question,
  answer,
  prevUrl,
  nextUrl,
  questionNumber,
  totalQuestions,
}: Props) {
  const isVideo = question.type === 'video'
  const isPhoto = question.type === 'photo'

  const [textValue, setTextValue] = useState(answer?.text_content ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editing, setEditing] = useState(!answer?.text_content && !answer?.media_url)

  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
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

  // Flush draft + hard-navigate (bypasses Router Cache for fresh DB read)
  async function navigateTo(url: string) {
    if (!isVideo && textValue !== lastSavedRef.current) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      await saveDraft(studentId, question.id, textValue)
    }
    window.location.href = url
  }

  async function handleTextSubmit() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSubmitError(null)
    setSubmitting(true)
    try {
      const result = await submitAnswer(studentId, question.id, { text_content: textValue })
      if (result.error) {
        setSubmitError(result.error)
      } else {
        lastSavedRef.current = textValue  // prevent navigateTo from re-saving as draft
        setSubmitStatus('submitted')
        setEditing(false)
        navigateTo(`/my/${studentId}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVideoSubmit() {
    if (!mediaFile) return
    setSubmitError(null)
    setUploading(true)

    try {
      // Get upload signature from server (no file data sent to server)
      const signRes = await fetch('/api/media/sign', { method: 'POST' })
      const { signature, timestamp, apiKey, cloudName } = await signRes.json()

      // Upload directly to Cloudinary (bypasses server body size limits)
      const formData = new FormData()
      formData.append('file', mediaFile)
      formData.append('api_key', apiKey)
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('folder', 'lexicon')

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: 'POST', body: formData }
      )
      const uploadData = await uploadRes.json()

      if (uploadData.error || !uploadData.secure_url) {
        setSubmitError(uploadData.error?.message ?? 'Качването не успя.')
        setUploading(false)
        return
      }

      const result = await submitAnswer(studentId, question.id, {
        media_url: uploadData.secure_url,
        media_type: 'video',
      })

      if (result.error) {
        setSubmitError(result.error)
      } else {
        setSubmitStatus('submitted')
        navigateTo(`/my/${studentId}`)
      }
    } catch {
      setSubmitError('Качването не успя. Опитайте отново.')
    } finally {
      setUploading(false)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setMediaFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
    } else {
      setPhotoPreview(null)
    }
  }

  async function compressImage(file: File, maxDim = 1600, quality = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim }
          else { width = Math.round(width * maxDim / height); height = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('canvas toBlob failed')), 'image/jpeg', quality)
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function handlePhotoSubmit() {
    if (!mediaFile) return
    setSubmitError(null)
    setUploading(true)
    let fileToUpload: Blob = mediaFile
    try {
      fileToUpload = await compressImage(mediaFile)
    } catch { /* use original if compression fails */ }
    const formData = new FormData()
    formData.append('file', fileToUpload, 'photo.jpg')
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
        ...(question.allows_text ? { text_content: textValue } : {}),
      })
      if (result.error) {
        setSubmitError(result.error)
      } else {
        setSubmitStatus('submitted')
        navigateTo(`/my/${studentId}`)
      }
    } catch {
      setSubmitError('Качването не успя. Опитайте отново.')
    } finally {
      setUploading(false)
    }
  }

  const answerStatus = submitStatus ?? answer?.status
  const isLocked = answerStatus === 'approved'

  async function handleStartEdit() {
    await saveDraft(studentId, question.id, textValue)
    lastSavedRef.current = textValue
    setEditing(true)
  }

  return (
    <div className="min-h-screen bg-[#f4f3f2]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={() => navigateTo(`/my/${studentId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors mb-6 font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Назад
        </button>

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
                  Въпрос {questionNumber} / {totalQuestions}
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
        {!editing && (answer?.text_content || answer?.media_url) && (answerStatus === 'approved' || answerStatus === 'submitted') && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2 ${
            answerStatus === 'approved'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              {answerStatus === 'approved' ? 'verified' : 'check_circle'}
            </span>
            {answerStatus === 'approved' ? 'Одобрен' : 'Изпратен за одобрение'}
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

        {/* ── Photo question ────────────────────────────────────────────── */}
        {isPhoto && (
          <div className="space-y-4">
            {/* Existing approved photo */}
            {answer?.media_url && !editing && (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={answer.media_url}
                  alt="Снимка"
                  className="w-full max-h-80 object-contain"
                />
              </div>
            )}

            {editing && (
              <>
                {/* Preview of newly selected photo */}
                {photoPreview && (
                  <div className="relative rounded-2xl overflow-hidden border border-indigo-200 bg-gray-50">
                    <img src={photoPreview} alt="Преглед" className="w-full max-h-80 object-contain" />
                    <button
                      onClick={() => { setMediaFile(null); setPhotoPreview(null) }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-white shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                )}

                {/* File input */}
                {!photoPreview && (
                  <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-white cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <span className="material-symbols-outlined text-4xl text-gray-300">add_photo_alternate</span>
                    <span className="text-sm text-gray-500 font-medium">Изберете или снимайте снимка</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </>
            )}

            {/* Optional text field */}
            {question.allows_text && (() => {
              const limit = question.max_length ?? 150
              const over = textValue.length > limit
              return (
                <div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Добавете текст към снимката..."
                      disabled={isLocked || !editing}
                      className={`w-full bg-white border rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 resize-none disabled:opacity-60 disabled:bg-gray-50 disabled:cursor-default shadow-sm ${
                        over ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-400'
                      }`}
                    />
                    {editing && (
                      <div className={`absolute bottom-3 right-3 text-xs ${over ? 'text-red-500 font-semibold' : 'text-gray-300'}`}>
                        {textValue.length}/{limit}
                      </div>
                    )}
                  </div>
                  {over && editing && (
                    <p className="text-xs text-red-500 mt-1 px-1">
                      Прекалено дълъг текст — съкратете до {limit} знака ({textValue.length - limit} в повече).
                    </p>
                  )}
                </div>
              )
            })()}

            {uploading && (
              <div className="text-sm text-indigo-600 text-center font-medium">Качва се...</div>
            )}
            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{submitError}</div>
            )}

            {editing ? (
              <button
                onClick={handlePhotoSubmit}
                disabled={!mediaFile || uploading || (!!question.allows_text && textValue.length > (question.max_length ?? 150))}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Качва се...' : 'Изпрати снимката'}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full border-2 border-indigo-300 text-indigo-600 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Смени снимката
              </button>
            )}
          </div>
        )}

        {/* ── Video question ─────────────────────────────────────────────── */}
        {isVideo && (
          <div className="space-y-4">
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

        {/* ── Text question ──────────────────────────────────────────────── */}
        {!isVideo && !isPhoto && (
          <div className="space-y-3">
            {(() => {
              const limit = question.max_length ?? 150
              const over = textValue.length > limit
              return (
                <>
                  <div className="relative">
                    <textarea
                      rows={5}
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Напишете отговора тук..."
                      disabled={isLocked || !editing}
                      className={`w-full bg-white border rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 resize-none disabled:opacity-60 disabled:bg-gray-50 disabled:cursor-default shadow-sm ${
                        over ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-400'
                      }`}
                    />
                    {editing && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-3">
                        <span className={`text-xs ${over ? 'text-red-500 font-semibold' : 'text-gray-300'}`}>
                          {textValue.length}/{limit}
                        </span>
                        {saveStatus === 'saving' && (
                          <span className="text-xs text-gray-400">Записва се...</span>
                        )}
                        {saveStatus === 'saved' && !over && (
                          <span className="text-xs text-green-500">Записано</span>
                        )}
                      </div>
                    )}
                  </div>

                  {over && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      Текстът е прекалено дълъг — моля съкратете до {limit} знака ({textValue.length - limit} в повече).
                    </div>
                  )}

                  {submitError && !over && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      {submitError}
                    </div>
                  )}

                  {!editing ? (
                    <button
                      onClick={handleStartEdit}
                      className="w-full border-2 border-indigo-300 text-indigo-600 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Редактирай
                    </button>
                  ) : (
                    <button
                      onClick={handleTextSubmit}
                      disabled={!textValue.trim() || submitting || over}
                      className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Изпращане...' : 'Изпрати'}
                    </button>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-5 border-t border-gray-200">
          {prevUrl ? (
            <button
              onClick={() => navigateTo(prevUrl)}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Предишен
            </button>
          ) : <span />}
          {nextUrl ? (
            <button
              onClick={() => navigateTo(nextUrl)}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Следващ
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo(`/my/${studentId}`)}
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
