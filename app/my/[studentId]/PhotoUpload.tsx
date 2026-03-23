'use client'

import { useRef, useState } from 'react'
import { updateStudentPhoto } from './actions'

interface Props {
  studentId: string
  photoUrl: string | null
  firstName: string
}

export default function PhotoUpload({ studentId, photoUrl, firstName }: Props) {
  const [preview, setPreview] = useState<string | null>(photoUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData })
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
    <div className="relative mx-auto mb-3 w-20 h-20">
      {/* Avatar or photo */}
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

      {/* Upload overlay button */}
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

      {/* Hidden file input — accepts images and GIFs */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error tooltip */}
      {error && (
        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  )
}
