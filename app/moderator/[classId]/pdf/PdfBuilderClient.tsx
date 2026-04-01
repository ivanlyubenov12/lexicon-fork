'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PDFData } from '@/lib/pdf/types'
import {
  DEFAULT_THEME,
  DEFAULT_OPTIONS,
  THEME_PRESETS,
  type PDFTheme,
  type PageOptions,
  type CoverOptions,
  type OverviewOptions,
  type StudentOptions,
  type MemoriesOptions,
} from '@/lib/pdf/builder-types'

export type SectionType =
  | 'cover'
  | 'overview'
  | 'students_grid'
  | 'student'
  | 'polls'
  | 'memories'
  | 'closing'

export interface Section {
  id: string
  type: SectionType
  label: string
  visible: boolean
  studentId?: string
  eventId?: string
}

const PdfPreview = dynamic(() => import('./PdfPreview'), { ssr: false })

function buildSections(data: PDFData): Section[] {
  const sections: Section[] = [
    { id: 'cover', type: 'cover', label: 'Корица', visible: true },
    { id: 'overview', type: 'overview', label: 'Класът', visible: true },
    {
      id: 'students_grid',
      type: 'students_grid',
      label: 'Всички участници',
      visible: true,
    },
    ...data.students.map((s) => ({
      id: `student-${s.id}`,
      type: 'student' as SectionType,
      label: `${s.first_name} ${s.last_name}`,
      visible: true,
      studentId: s.id,
    })),
  ]

  if (data.polls.length > 0) {
    sections.push({ id: 'polls', type: 'polls', label: 'Анкети', visible: true })
  }

  for (const ev of data.events) {
    sections.push({
      id: `memories-${ev.id}`,
      type: 'memories',
      label: ev.title,
      visible: true,
      eventId: ev.id,
    })
  }

  sections.push({ id: 'closing', type: 'closing', label: 'Финална страница', visible: true })

  return sections
}

// ─── Sortable row ────────────────────────────────────────────────────────────

interface SortableRowProps {
  section: Section
  isActive: boolean
  onSelect: () => void
  onToggle: () => void
}

function SortableRow({ section, isActive, onSelect, onToggle }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer select-none transition-colors ${
        isActive
          ? 'bg-white shadow-sm text-indigo-700 font-semibold'
          : 'text-slate-500 hover:bg-white/60'
      }`}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
        onClick={(e) => e.stopPropagation()}
        title="Дръж и влачи"
      >
        <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
          <circle cx="4" cy="3" r="1.5" />
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="4" cy="13" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </span>

      {/* Eye toggle */}
      <button
        type="button"
        className="shrink-0 text-slate-300 hover:text-slate-600 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        title={section.visible ? 'Скрий' : 'Покажи'}
      >
        <span className="material-symbols-outlined text-base">
          {section.visible ? 'visibility' : 'visibility_off'}
        </span>
      </button>

      {/* Label */}
      <span
        className={`text-sm truncate flex-1 ${!section.visible ? 'line-through opacity-40' : ''}`}
      >
        {section.label}
      </span>
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-indigo-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

// ─── Options panel ────────────────────────────────────────────────────────────

interface OptionRow {
  label: string
  key: string
}

const SECTION_OPTIONS: Record<string, OptionRow[]> = {
  cover: [
    { label: 'Лого на училище', key: 'showLogo' },
    { label: 'Мото/цитат', key: 'showQuote' },
  ],
  overview: [
    { label: 'Гласови въпроси', key: 'showVoice' },
    { label: 'Анкети / Звезди', key: 'showPolls' },
    { label: 'Наши спомени', key: 'showEvents' },
  ],
  student: [
    { label: 'Снимка', key: 'showPhoto' },
    { label: 'QR кодове за видео', key: 'showQRCodes' },
    { label: 'Коментари към спомени', key: 'showEventComments' },
    { label: 'Послания', key: 'showMessages' },
  ],
  memories: [
    { label: 'Дата', key: 'showDate' },
    { label: 'Описание', key: 'showNote' },
    { label: 'Снимки', key: 'showPhotos' },
    { label: 'Коментари', key: 'showComments' },
  ],
}

const NO_OPTIONS_TYPES = new Set(['students_grid', 'polls', 'closing'])

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
  classId: string
}

export default function PdfBuilderClient({ classId }: Props) {
  const [pdfData, setPdfData] = useState<PDFData | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [activeSection, setActiveSection] = useState<string>('cover')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Level 3: theme
  const [globalTheme, setGlobalTheme] = useState<PDFTheme>(DEFAULT_THEME)
  const [themeOpen, setThemeOpen] = useState(false)

  // Level 2: per-section options
  const [sectionOpts, setSectionOpts] = useState<Record<string, PageOptions>>({})

  // Load preview data on mount
  useEffect(() => {
    setLoading(true)
    fetch(`/api/pdf/preview-data/${classId}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: PDFData) => {
        console.log('[PDF Builder] coverBlocks from API:', JSON.stringify(data.coverBlocks))
        console.log('[PDF Builder] closingBlocks from API:', JSON.stringify(data.closingBlocks))
        setPdfData(data)
        const built = buildSections(data)
        setSections(built)
        // Initialise sectionOpts from DEFAULT_OPTIONS keyed by section type
        const initOpts: Record<string, PageOptions> = {}
        for (const sec of built) {
          initOpts[sec.id] = { ...(DEFAULT_OPTIONS[sec.type] ?? {}) }
        }
        setSectionOpts(initOpts)
        setLoading(false)
      })
      .catch((err) => {
        setError(String(err))
        setLoading(false)
      })
  }, [classId])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const toggleVisible = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    )
  }, [])

  function getOpts(section: Section): PageOptions {
    return sectionOpts[section.id] ?? DEFAULT_OPTIONS[section.type] ?? {}
  }

  function setOpt(sectionId: string, sectionType: string, key: string, value: boolean) {
    setSectionOpts((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] ?? DEFAULT_OPTIONS[sectionType] ?? {}),
        [key]: value,
      } as PageOptions,
    }))
  }

  const currentSection = sections.find((s) => s.id === activeSection) ?? sections[0] ?? null

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className="w-[280px] shrink-0 h-screen bg-[#f4f3f2] flex flex-col border-r border-slate-200 overflow-hidden"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-slate-200">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">
            PDF Builder
          </p>
          <h2 className="text-base font-bold text-slate-800">Секции</h2>
          <p className="text-xs text-slate-400 mt-1">
            Влачете, за да наредите. Кликнете, за да прегледате.
          </p>
        </div>

        {/* ── Theme panel ── */}
        <div className="border-b border-slate-200">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
            onClick={() => setThemeOpen((v) => !v)}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base" style={{ fontSize: 15 }}>palette</span>
              Тема
            </span>
            <span className="material-symbols-outlined text-sm">
              {themeOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {themeOpen && (
            <div className="px-4 pb-3 space-y-3">
              {/* Preset swatches */}
              <div className="flex gap-2 flex-wrap">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    title={preset.label}
                    onClick={() => setGlobalTheme(preset.theme)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <span
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        globalTheme.accentColor === preset.theme.accentColor &&
                        globalTheme.coverBg === preset.theme.coverBg
                          ? 'border-slate-500 scale-110'
                          : 'border-transparent group-hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.theme.accentColor }}
                    />
                    <span className="text-[10px] text-slate-400 leading-none">{preset.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom color pickers */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs text-slate-500">
                  <span>Акцентен цвят</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                      style={{ backgroundColor: globalTheme.accentColor }}
                    />
                    <input
                      type="color"
                      value={globalTheme.accentColor}
                      onChange={(e) =>
                        setGlobalTheme((t) => ({ ...t, accentColor: e.target.value }))
                      }
                      className="w-6 h-5 cursor-pointer rounded border-0 p-0 bg-transparent"
                    />
                  </span>
                </label>
                <label className="flex items-center justify-between text-xs text-slate-500">
                  <span>Фон на корицата</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                      style={{ backgroundColor: globalTheme.coverBg }}
                    />
                    <input
                      type="color"
                      value={globalTheme.coverBg}
                      onChange={(e) =>
                        setGlobalTheme((t) => ({ ...t, coverBg: e.target.value }))
                      }
                      className="w-6 h-5 cursor-pointer rounded border-0 p-0 bg-transparent"
                    />
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              Зареждане…
            </div>
          ) : error ? (
            <div className="p-4 text-red-500 text-sm">{error}</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section) => (
                  <SortableRow
                    key={section.id}
                    section={section}
                    isActive={activeSection === section.id}
                    onSelect={() => setActiveSection(section.id)}
                    onToggle={() => toggleVisible(section.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* ── Options panel ── */}
        {!loading && !error && currentSection && (
          <div className="border-t border-slate-200 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Опции за секцията
            </p>
            {NO_OPTIONS_TYPES.has(currentSection.type) ? (
              <p className="text-xs text-slate-400 italic">Няма опции за тази секция.</p>
            ) : (
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {(SECTION_OPTIONS[currentSection.type] ?? []).map((row) => {
                  const opts = getOpts(currentSection) as Record<string, boolean>
                  const defaultVal = (DEFAULT_OPTIONS[currentSection.type] as Record<string, boolean>)?.[row.key] ?? true
                  const checked = opts[row.key] !== undefined ? opts[row.key] : defaultVal
                  return (
                    <div key={row.key} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 leading-tight">{row.label}</span>
                      <Toggle
                        checked={checked}
                        onChange={(v) => setOpt(currentSection.id, currentSection.type, row.key, v)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <div className="p-4 border-t border-slate-200">
          <a
            href={`/api/pdf/${classId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-center shadow bg-gradient-to-br from-indigo-600 to-indigo-500 text-white hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Генерирай PDF
          </a>
          <p className="text-xs text-slate-400 text-center mt-2">
            Генерира пълния PDF с всички секции
          </p>
        </div>
      </aside>

      {/* ── Preview area ── */}
      <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 shrink-0 flex items-center px-5 bg-white border-b border-slate-200 gap-3">
          <span className="material-symbols-outlined text-indigo-500 text-xl">
            preview
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {currentSection?.label ?? '—'}
          </span>
          {currentSection && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {currentSection.type}
            </span>
          )}
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-hidden p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full gap-3 text-slate-400">
              <svg
                className="animate-spin h-6 w-6 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="text-sm">Зареждане на данните…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400 text-sm">
              Грешка при зареждане: {error}
            </div>
          ) : pdfData && currentSection ? (
            <div className="h-full rounded-xl overflow-hidden shadow-lg">
              <PdfPreview
                key={`${currentSection.id}-${JSON.stringify(pdfData.coverBlocks)}-${JSON.stringify(pdfData.closingBlocks)}`}
                section={currentSection}
                pdfData={pdfData}
                theme={globalTheme}
                options={getOpts(currentSection)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Изберете секция от списъка вляво.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
