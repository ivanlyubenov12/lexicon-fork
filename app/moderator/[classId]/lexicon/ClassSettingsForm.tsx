'use client'

import { useState, useTransition } from 'react'
import { updateClassInfo, setDeadline } from '../actions'
import DateInput from '@/components/DateInput'

const TEMPLATE_FIELD_LABELS: Record<string, { group: string; school: string; year: string }> = {
  primary:      { group: 'Клас',  school: 'Училище',        year: 'Учебна година' },
  classic:      { group: 'Клас',  school: 'Училище',        year: 'Учебна година' },
  teens:        { group: 'Клас',  school: 'Училище',        year: 'Учебна година' },
  kindergarten: { group: 'Група', school: 'Детска градина', year: 'Учебна година' },
  custom:       { group: 'Група', school: 'Организация',    year: 'Период' },
}

interface Props {
  classId: string
  initialName: string
  initialSchoolYear: string
  initialTeacherName: string
  initialLogoUrl: string | null
  initialCoverUrl: string | null
  initialDeadline: string | null
  templateId: string | null
}

export default function ClassSettingsForm({
  classId,
  initialName,
  initialSchoolYear,
  initialTeacherName,
  initialLogoUrl,
  initialCoverUrl,
  initialDeadline,
  templateId,
}: Props) {
  const [namePart, schoolPart] = initialName.includes(' — ')
    ? initialName.split(' — ')
    : [initialName, '']

  const fieldLabels = TEMPLATE_FIELD_LABELS[templateId ?? 'primary'] ?? TEMPLATE_FIELD_LABELS.primary

  const [className, setClassName] = useState(namePart)
  const [school, setSchool] = useState(schoolPart)
  const [schoolYear, setSchoolYear] = useState(initialSchoolYear)
  const [teacherName, setTeacherName] = useState(initialTeacherName)
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl)
  const [logoUploading, setLogoUploading] = useState(false)
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl)
  const [coverUploading, setCoverUploading] = useState(false)
  const [deadlineStr, setDeadlineStr] = useState<string>(
    initialDeadline ? new Date(initialDeadline).toISOString().split('T')[0] : ''
  )
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setCoverUrl(data.url)
    } finally {
      setCoverUploading(false)
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setLogoUrl(data.url)
    } finally {
      setLogoUploading(false)
    }
  }

  function handleSave() {
    if (!className.trim() || !deadlineStr) {
      setSaveError('Моля попълнете задължителните полета.')
      return
    }
    setSaveError(null)
    setSaved(false)
    startTransition(async () => {
      const [infoResult, deadlineResult] = await Promise.all([
        updateClassInfo(classId, {
          name: `${className.trim()} — ${school.trim()}`,
          school_year: schoolYear.trim(),
          school_logo_url: logoUrl ?? undefined,
          cover_image_url: coverUrl,
          teacher_name: teacherName.trim() || null,
        }),
        setDeadline(classId, deadlineStr ? new Date(deadlineStr).toISOString() : null),
      ])
      const err = infoResult.error || deadlineResult.error
      if (err) setSaveError(err)
      else setSaved(true)
    })
  }

  return (
    <div>
      {saveError && <p className="text-red-600 text-sm mb-3">{saveError}</p>}
      {saved && <p className="text-emerald-600 text-sm mb-3 font-medium">Запазено успешно.</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {fieldLabels.group} <span className="text-red-400">*</span>
          </label>
          <input
            value={className}
            onChange={e => setClassName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{fieldLabels.school}</label>
          <input
            value={school}
            onChange={e => setSchool(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{fieldLabels.year}</label>
          <input
            value={schoolYear}
            onChange={e => setSchoolYear(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Краен срок <span className="text-red-400">*</span>
          </label>
          <DateInput
            value={deadlineStr}
            onChange={setDeadlineStr}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Класен ръководител</label>
          <input
            value={teacherName}
            onChange={e => setTeacherName(e.target.value)}
            placeholder="Напр. Мария Иванова"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      <div className="flex items-start gap-6 flex-wrap mb-4">
        {/* Cover image */}
        <div className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[200px]">
          <p className="text-xs font-medium text-gray-500 mb-2">Снимка на класа</p>
          {coverUrl ? (
            <div className="relative rounded-xl overflow-hidden aspect-video mb-2 max-w-xs">
              <img src={coverUrl} alt="Кавър" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-lg px-2 py-0.5 text-xs hover:bg-black/70"
              >
                Премахни
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors max-w-xs">
              <span className="material-symbols-outlined text-base">add_photo_alternate</span>
              {coverUploading ? 'Качване...' : 'Качи снимка на класа'}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} disabled={coverUploading} />
            </label>
          )}
        </div>

        {/* Logo */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Лого на училището</p>
            <div className="flex items-center gap-3">
              {logoUrl && (
                <img src={logoUrl} alt="Лого" className="w-10 h-10 rounded-lg object-contain border border-gray-100 bg-white p-1" />
              )}
              <label className="cursor-pointer border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                {logoUploading ? 'Качване...' : logoUrl ? 'Смени лого' : 'Качи лого'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} disabled={logoUploading} />
              </label>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl(null)} className="text-xs text-gray-400 hover:text-red-500">
                  Премахни
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending || logoUploading || coverUploading}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Запазване...' : 'Запази'}
        </button>
      </div>
    </div>
  )
}
