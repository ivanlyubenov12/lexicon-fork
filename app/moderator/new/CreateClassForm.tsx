'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { createClass } from './actions'
import DateInput from '@/components/DateInput'

function currentSchoolYear(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  return m >= 9 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow"
    >
      <span className="material-symbols-outlined text-base">school</span>
      {pending ? 'Създаване...' : 'Създай класа →'}
    </button>
  )
}

export default function CreateClassForm({ defaultModeratorName = '' }: { defaultModeratorName?: string }) {
  const router = useRouter()
  const [state, action] = useFormState(createClass, { error: null, classId: null })

  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deadlineStr, setDeadlineStr] = useState('')

  useEffect(() => {
    if (state.classId) {
      router.push(`/moderator/${state.classId}`)
    }
  }, [state.classId, router])

  async function uploadFile(file: File, onDone: (url: string) => void, setLoading: (v: boolean) => void) {
    setLoading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        onDone(data.url)
      } else {
        setUploadError('Качването не успя.')
      }
    } catch {
      setUploadError('Качването не успя.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="cover_image_url" value={coverUrl ?? ''} />
      <input type="hidden" name="school_logo_url" value={logoUrl ?? ''} />
      <input type="hidden" name="deadline" value={deadlineStr} />

      {(uploadError || state.error) && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {uploadError ?? state.error}
        </div>
      )}

      {/* Required fields */}
      <div className="bg-indigo-50/50 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Задължително</p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Вашето име</label>
          <input
            name="moderator_name"
            type="text"
            required
            defaultValue={defaultModeratorName}
            placeholder="Мария Иванова"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">Ще се показва в поканата до родителите.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Паралелка</label>
          <input
            name="parallel"
            type="text"
            required
            placeholder="3А"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">Напр. 3А, 5Б, 7В</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Училище</label>
          <input
            name="school"
            type="text"
            required
            placeholder="ОУ Христо Ботев"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Брой деца в класа</label>
          <input
            name="expected_student_count"
            type="number"
            min={1}
            max={60}
            required
            placeholder="26"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">Ще се използва за проследяване на прогреса.</p>
        </div>
      </div>

      {/* Optional fields */}
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">По желание</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Град</label>
            <input
              name="city"
              type="text"
              placeholder="София"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Учебна година</label>
            <input
              name="school_year"
              type="text"
              defaultValue={currentSchoolYear()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Класен ръководител</label>
          <input
            name="teacher_name"
            type="text"
            placeholder="Мария Иванова"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Срок за попълване
            <span className="text-gray-400 font-normal ml-1">— крайна дата</span>
          </label>
          <DateInput
            value={deadlineStr}
            onChange={setDeadlineStr}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <p className="text-xs text-gray-400 mt-1">До кога родителите трябва да попълнят анкетата.</p>
        </div>

        {/* Cover photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Снимка на класа
            <span className="text-gray-400 font-normal ml-1">— кавър на лексикона</span>
          </label>
          {coverUrl ? (
            <div className="relative rounded-xl overflow-hidden aspect-video mb-2">
              <img src={coverUrl} alt="Кавър" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-lg px-2 py-1 text-xs hover:bg-black/70"
              >
                Смени
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 cursor-pointer bg-gray-50 hover:bg-indigo-50/30 transition-colors">
              {coverUploading ? (
                <span className="text-sm text-gray-400">Качване...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">add_photo_alternate</span>
                  <span className="text-sm text-gray-400">Кликнете за качване</span>
                  <span className="text-xs text-gray-300 mt-1">Групова снимка на класа</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={coverUploading}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadFile(f, setCoverUrl, setCoverUploading)
                }}
              />
            </label>
          )}
        </div>

        {/* School logo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Лого на училището</label>
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Лого"
                className="w-14 h-14 rounded-xl object-contain border border-gray-200 bg-white p-1"
              />
            )}
            <label className="inline-flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-base">upload</span>
              {logoUploading ? 'Качване...' : logoUrl ? 'Смени логото' : 'Качи лого'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={logoUploading}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadFile(f, setLogoUrl, setLogoUploading)
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
