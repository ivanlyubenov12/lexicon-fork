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

const TYPE_META: Record<string, {
  groupLabel: string; memberLabel: string; groupPlaceholder: string
  orgLabel: string; orgPlaceholder: string; orgRequired: boolean
  countLabel: string
  yearLabel: string | null   // null = hide field
  leaderLabel: string | null // null = hide field
  coverLabel: string; logoLabel: string | null
}> = {
  primary:      { groupLabel: 'Паралелка', memberLabel: 'ученик',   groupPlaceholder: '3А',          orgLabel: 'Училище',                 orgPlaceholder: 'ОУ Христо Ботев',       orgRequired: true,  countLabel: 'Брой деца в класа',   yearLabel: 'Учебна година',  leaderLabel: 'Класен ръководител', coverLabel: 'Снимка на класа',   logoLabel: 'Лого на училището' },
  teens:        { groupLabel: 'Паралелка', memberLabel: 'ученик',   groupPlaceholder: '9А',          orgLabel: 'Училище',                 orgPlaceholder: 'СУ Климент Охридски',   orgRequired: true,  countLabel: 'Брой деца в класа',   yearLabel: 'Учебна година',  leaderLabel: 'Класен ръководител', coverLabel: 'Снимка на класа',   logoLabel: 'Лого на училището' },
  kindergarten: { groupLabel: 'Група',     memberLabel: 'дете',     groupPlaceholder: 'Слончета',    orgLabel: 'Детска градина',          orgPlaceholder: 'ДГ Дъга',               orgRequired: true,  countLabel: 'Брой деца в групата', yearLabel: 'Учебна година',  leaderLabel: 'Учител',             coverLabel: 'Снимка на групата', logoLabel: 'Лого на градината' },
  sports:       { groupLabel: 'Отбор',     memberLabel: 'играч',    groupPlaceholder: 'Левски U12',  orgLabel: 'Клуб / Организация',      orgPlaceholder: 'ФК Левски',             orgRequired: true,  countLabel: 'Брой играчи',         yearLabel: 'Сезон',          leaderLabel: 'Треньор',            coverLabel: 'Снимка на отбора',  logoLabel: 'Лого на клуба' },
  friends:      { groupLabel: 'Група',     memberLabel: 'приятел',  groupPlaceholder: 'Наши хора',   orgLabel: 'Организация (по желание)', orgPlaceholder: 'Не е задължително',    orgRequired: false, countLabel: 'Брой членове',        yearLabel: null,             leaderLabel: null,                 coverLabel: 'Снимка на групата', logoLabel: null },
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow"
    >
      <span className="material-symbols-outlined text-base">auto_stories</span>
      {pending ? 'Създаване...' : 'Създай лексикона →'}
    </button>
  )
}

export default function CreateClassForm({ defaultModeratorName = '', lexiconType = 'primary' }: { defaultModeratorName?: string; lexiconType?: string }) {
  const meta = TYPE_META[lexiconType] ?? TYPE_META.primary
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
      <input type="hidden" name="preset" value={lexiconType} />

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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{meta.groupLabel}</label>
          <input
            name="parallel"
            type="text"
            required
            placeholder={meta.groupPlaceholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{meta.orgLabel}</label>
          <input
            name="school"
            type="text"
            required={meta.orgRequired}
            placeholder={meta.orgPlaceholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{meta.countLabel}</label>
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

        <div className={`grid gap-4 ${meta.yearLabel ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Град</label>
            <input
              name="city"
              type="text"
              placeholder="София"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {meta.yearLabel && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{meta.yearLabel}</label>
              <input
                name="school_year"
                type="text"
                defaultValue={currentSchoolYear()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}
        </div>

        {meta.leaderLabel && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{meta.leaderLabel}</label>
            <input
              name="teacher_name"
              type="text"
              placeholder="Мария Иванова"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        )}

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
            {meta.coverLabel}
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
                  <span className="text-xs text-gray-300 mt-1">Групова снимка</span>
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

        {/* Logo */}
        {meta.logoLabel && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{meta.logoLabel}</label>
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
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
