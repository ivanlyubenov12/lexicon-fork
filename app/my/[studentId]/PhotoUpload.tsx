'use client'

import { useRef, useState, useEffect } from 'react'
import { updateStudentPhoto } from './actions'
import PhotoCropModal from '@/app/components/PhotoCropModal'

interface Props {
  studentId: string
  photoUrl: string | null
  firstName: string
  wizardMode?: boolean
}

export default function PhotoUpload({ studentId, photoUrl, firstName, wizardMode }: Props) {
  const [preview, setPreview]           = useState<string | null>(photoUrl)
  const [cropSrc, setCropSrc]           = useState<string | null>(null)
  const [uploading, setUploading]       = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError]   = useState<string | null>(null)

  const inputRef  = useRef<HTMLInputElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Attach stream to video element once camera is active
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraActive])

  // ── File from library ──────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  // ── Camera ─────────────────────────────────────────────────────────────────

  async function startCamera() {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      setCameraActive(true) // useEffect will attach stream after DOM updates
    } catch {
      setCameraError('Няма достъп до камерата. Проверете разрешенията или изберете снимка от галерия.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const reader = new FileReader()
      reader.onload = () => setCropSrc(reader.result as string)
      reader.readAsDataURL(blob)
    }, 'image/jpeg', 0.92)
    stopCamera()
  }

  // ── Upload after crop ──────────────────────────────────────────────────────

  async function handleCropConfirm(blob: Blob) {
    setCropSrc(null)
    setUploading(true)
    setPreview(URL.createObjectURL(blob))
    const formData = new FormData()
    formData.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
    try {
      const res  = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error || !data.url) { setError('Качването не успя.'); setPreview(photoUrl); return }
      const result = await updateStudentPhoto(studentId, data.url)
      if (result.error) { setError(result.error); setPreview(photoUrl) }
      else setPreview(data.url)
    } catch {
      setError('Качването не успя.')
      setPreview(photoUrl)
    } finally {
      setUploading(false)
    }
  }

  // ── Remove photo ───────────────────────────────────────────────────────────

  async function handleRemove() {
    setUploading(true)
    setError(null)
    const result = await updateStudentPhoto(studentId, null)
    if (result.error) setError(result.error)
    else setPreview(null)
    setUploading(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {cropSrc && (
        <PhotoCropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <canvas ref={canvasRef} className="hidden" />

      {wizardMode ? (
        <div className="w-full space-y-4">
          {/* Avatar preview */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              {preview ? (
                <img src={preview} alt={firstName} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                  {firstName.charAt(0)}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                  <span className="text-indigo-500 text-sm animate-spin">↻</span>
                </div>
              )}
            </div>
          </div>

          {/* Live camera view */}
          {cameraActive && (
            <div className="space-y-3">
              <video ref={videoRef} playsInline muted className="w-full rounded-2xl aspect-video object-cover bg-black" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                  Снимай
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Откажи
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          {!cameraActive && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={startCamera}
                disabled={uploading}
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-indigo-500 text-3xl">photo_camera</span>
                <span className="text-xs font-semibold text-indigo-700">Снимай сега</span>
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-gray-500 text-3xl">photo_library</span>
                <span className="text-xs font-semibold text-gray-600">От галерия</span>
              </button>
            </div>
          )}

          {cameraError && <p className="text-xs text-red-500 text-center">{cameraError}</p>}
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          {preview && !uploading && !cameraActive && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Снимката е запазена
              </p>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                Премахни снимката
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Compact mode ── */
        <div className="relative mx-auto mb-3 w-20 h-20">
          {preview ? (
            <img src={preview} alt={firstName} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
              {firstName.charAt(0)}
            </div>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Смени снимката"
            className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <span className="text-xs animate-spin">↻</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            )}
          </button>
          {error && (
            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">{error}</p>
          )}
        </div>
      )}
    </>
  )
}
