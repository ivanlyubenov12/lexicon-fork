'use client'

import { useRef, useState } from 'react'
import { updateStudentPhoto } from './actions'
import PhotoCropModal from '@/app/components/PhotoCropModal'

interface Props {
  studentId: string
  photoUrl: string | null
  firstName: string
  /** Show large camera + gallery buttons instead of the compact avatar edit button */
  wizardMode?: boolean
}

export default function PhotoUpload({ studentId, photoUrl, firstName, wizardMode }: Props) {
  const [preview, setPreview]     = useState<string | null>(photoUrl)
  const [cropSrc, setCropSrc]     = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const cameraRef  = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleCropConfirm(blob: Blob) {
    setCropSrc(null)
    setUploading(true)
    setPreview(URL.createObjectURL(blob))

    const formData = new FormData()
    formData.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }))

    try {
      const res  = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.error || !data.url) {
        setError('Качването не успя.')
        setPreview(photoUrl)
        return
      }

      const result = await updateStudentPhoto(studentId, data.url)
      if (result.error) {
        setError(result.error)
        setPreview(photoUrl)
      } else {
        setPreview(data.url)
      }
    } catch {
      setError('Качването не успя.')
      setPreview(photoUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Hidden gallery input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Hidden camera input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {wizardMode ? (
        /* ── Wizard: large prominent UI ── */
        <div className="w-full space-y-4">
          {/* Avatar preview */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              {preview ? (
                <img
                  src={preview}
                  alt={firstName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-sm"
                />
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

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              disabled={uploading}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="material-symbols-outlined text-indigo-500 text-3xl">photo_camera</span>
              <span className="text-xs font-semibold text-indigo-700">Снимай сега</span>
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-gray-500 text-3xl">photo_library</span>
              <span className="text-xs font-semibold text-gray-600">От галерия</span>
            </button>
          </div>

          {preview && !uploading && (
            <p className="text-center text-xs text-emerald-500 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Снимката е запазена
            </p>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
        </div>
      ) : (
        /* ── Compact: small avatar + edit icon ── */
        <div className="relative mx-auto mb-3 w-20 h-20">
          {preview ? (
            <img
              src={preview}
              alt={firstName}
              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100"
            />
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
            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
              {error}
            </p>
          )}
        </div>
      )}
    </>
  )
}
