'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateStudent, updateStudentPhoto } from '../../../actions'
import PhotoCropModal from '@/app/components/PhotoCropModal'

interface Props {
  classId: string
  photoUrl: string | null
  student: {
    id: string
    first_name: string
    last_name: string
    parent_email: string | null
  }
}

export default function EditStudentForm({ classId, student, photoUrl }: Props) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(student.first_name)
  const [lastName, setLastName]   = useState(student.last_name)
  const [parentEmail, setParentEmail] = useState(student.parent_email ?? '')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // Photo upload state
  const [preview, setPreview]     = useState<string | null>(photoUrl)
  const [cropSrc, setCropSrc]     = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photoSaved, setPhotoSaved] = useState(false)
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPhotoError(null)
    setPhotoSaved(false)
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleCropConfirm(blob: Blob) {
    setCropSrc(null)
    setUploading(true)
    setPreview(URL.createObjectURL(blob))
    try {
      const fd = new FormData()
      fd.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
      const res  = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.url) { setPhotoError('Качването не успя.'); setPreview(photoUrl); return }
      startTransition(async () => {
        const result = await updateStudentPhoto(classId, student.id, data.url)
        if (result.error) { setPhotoError(result.error); setPreview(photoUrl) }
        else { setPreview(data.url); setPhotoSaved(true) }
      })
    } catch {
      setPhotoError('Качването не успя.')
      setPreview(photoUrl)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await updateStudent(classId, student.id, {
      first_name: firstName,
      last_name: lastName,
      parent_email: parentEmail,
    })
    setSubmitting(false)
    if (result.error) { setError(result.error); return }
    router.push(`/moderator/${classId}/students`)
  }

  const initials = `${student.first_name[0] ?? ''}${student.last_name?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="max-w-md space-y-6">
      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* ── Photo upload ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Профилна снимка
        </p>

        <div className="flex items-center gap-5">
          {/* Preview */}
          <div className="relative flex-shrink-0">
            {preview ? (
              <img
                src={preview}
                alt={student.first_name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-dashed border-indigo-200">
                <span className="text-indigo-300 font-bold text-2xl" style={{ fontFamily: 'Noto Serif, serif' }}>
                  {initials}
                </span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-500 animate-spin text-2xl">progress_activity</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">upload</span>
              {preview ? 'Смени снимката' : 'Качи снимка'}
            </button>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Показва се в лексикона ако родителят не е качил собствена снимка.
            </p>
            {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
            {photoSaved && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Снимката е запазена
              </p>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* ── Text fields ──────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">
          Данни на детето
        </p>
        <div className="flex flex-col gap-5">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Име <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Фамилия
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Имейл на родителя
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="roditel@example.com"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? 'Запазване...' : 'Запази промените'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/moderator/${classId}/students`)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Отказ
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
