'use client'

import { useRef, useState } from 'react'

type MediaMode = 'record' | 'upload'
type RecordState = 'idle' | 'requesting' | 'recording' | 'preview'

const VIDEO_LIMIT_SEC = 30

interface Props {
  type: 'video' | 'audio'
  onReady: (file: File) => void          // called when user has a file ready to submit
  onClear: () => void                    // called when user clears the selection
  disabled?: boolean
}

export default function RecordMedia({ type, onReady, onClear, disabled }: Props) {
  const [mode, setMode] = useState<MediaMode>('record')
  const [recordState, setRecordState] = useState<RecordState>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const liveAudioRef = useRef<HTMLAudioElement>(null)

  // ── Recording ─────────────────────────────────────────────────────────────

  async function startRecording() {
    setError(null)
    setRecordState('requesting')
    try {
      const constraints = type === 'video'
        ? { video: true, audio: true }
        : { audio: true }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (type === 'video' && liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream
        liveVideoRef.current.play()
      }

      chunksRef.current = []
      const videoCandidates = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4']
      const audioCandidates = ['audio/webm', 'audio/mp4', 'audio/ogg']
      const candidates = type === 'video' ? videoCandidates : audioCandidates
      const mimeType = candidates.find(m => MediaRecorder.isTypeSupported(m)) ?? ''
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        const actualMime = recorderRef.current?.mimeType ?? mimeType
        const blob = new Blob(chunksRef.current, { type: actualMime })
        const ext = actualMime.includes('mp4') ? 'mp4' : 'webm'
        const file = new File([blob], `recording.${ext}`, { type: actualMime })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setRecordState('preview')
        onReady(file)
        stopStream()
      }

      recorder.start()
      setRecordState('recording')
      setElapsed(0)

      // Tick every second
      timerRef.current = setInterval(() => {
        setElapsed((s) => s + 1)
      }, 1000)

      // Auto-stop at limit for video
      if (type === 'video') {
        setTimeout(() => {
          if (recorderRef.current?.state === 'recording') {
            recorderRef.current.stop()
          }
        }, VIDEO_LIMIT_SEC * 1000)
      }
    } catch {
      setError('Няма достъп до камерата/микрофона. Проверете разрешенията.')
      setRecordState('idle')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  function resetRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setRecordState('idle')
    setElapsed(0)
    onClear()
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setUploadFile(file)
    if (file) onReady(file)
    else onClear()
  }

  function clearUpload() {
    setUploadFile(null)
    onClear()
  }

  // ── Mode switch ────────────────────────────────────────────────────────────

  function switchMode(next: MediaMode) {
    resetRecording()
    clearUpload()
    setError(null)
    setMode(next)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => switchMode('record')}
          disabled={disabled}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mode === 'record'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {type === 'video' ? '🎥' : '🎙️'} Запиши сега
        </button>
        <button
          onClick={() => switchMode('upload')}
          disabled={disabled}
          className={`flex-1 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
            mode === 'upload'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          📁 Качи файл
        </button>
      </div>

      {/* ── Record mode ── */}
      {mode === 'record' && (
        <div className="space-y-3">
          {/* Live preview */}
          {type === 'video' && (recordState === 'recording' || recordState === 'requesting') && (
            <video
              ref={liveVideoRef}
              muted
              playsInline
              className="w-full rounded-xl bg-black aspect-video object-cover"
            />
          )}

          {/* Recorded preview */}
          {recordState === 'preview' && previewUrl && (
            type === 'video' ? (
              <video
                src={previewUrl}
                controls
                className="w-full rounded-xl bg-black aspect-video object-cover"
              />
            ) : (
              <audio src={previewUrl} controls className="w-full" />
            )
          )}

          {/* Video limit notice */}
          {type === 'video' && recordState === 'idle' && (
            <p className="text-xs text-gray-400 text-center">
              Максималната дължина на видеото е {VIDEO_LIMIT_SEC} секунди
            </p>
          )}

          {/* Recording timer */}
          {recordState === 'recording' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-500 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Записва се
              </span>
              {type === 'video' && (
                <span className={`font-mono font-semibold ${elapsed >= VIDEO_LIMIT_SEC - 5 ? 'text-red-600' : 'text-gray-600'}`}>
                  {elapsed}s / {VIDEO_LIMIT_SEC}s
                </span>
              )}
            </div>
          )}

          {/* Idle placeholder for audio */}
          {type === 'audio' && recordState === 'idle' && (
            <div className="flex items-center justify-center h-20 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
              Готов за запис
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {recordState === 'idle' && (
              <button
                onClick={startRecording}
                disabled={disabled}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
              >
                <span className="w-2.5 h-2.5 bg-white rounded-full" />
                Започни запис
              </button>
            )}
            {recordState === 'requesting' && (
              <div className="flex-1 flex items-center justify-center py-3 text-sm text-gray-500">
                Изчакване на разрешение...
              </div>
            )}
            {recordState === 'recording' && (
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-medium text-sm transition-colors"
              >
                <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                Спри записа
              </button>
            )}
            {recordState === 'preview' && (
              <button
                onClick={resetRecording}
                disabled={disabled}
                className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                ↺ Запиши отново
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Upload mode ── */}
      {mode === 'upload' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-white">
            <p className="text-sm text-gray-500 mb-3">
              {type === 'video'
                ? 'Изберете видео файл от устройството'
                : 'Изберете аудио файл от устройството'}
            </p>
            <input
              type="file"
              accept={type === 'audio' ? 'audio/*' : 'video/*'}
              onChange={handleFileChange}
              disabled={disabled}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50"
            />
            {uploadFile && (
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <span>{uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                <button onClick={clearUpload} className="text-gray-400 hover:text-gray-600 ml-3">✕</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
