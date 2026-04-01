'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Block, BlockType, LayoutAssets } from '@/lib/templates/types'
import { createEvent, updateEvent } from '../events/actions'
import DateInput from '@/components/DateInput'
import { updateCoverImage } from './actions'

// ── Constants ─────────────────────────────────────────────────────────────

const FULL_WIDTH: Set<BlockType> = new Set([
  'hero', 'superhero', 'students_grid', 'polls_grid', 'events',
  'cover_photo', 'cover_logo', 'cover_class_name', 'cover_year', 'cover_tagline',
  'closing_logo', 'closing_title', 'closing_year', 'closing_quote', 'closing_student_count', 'closing_colophon',
  'sp_photo', 'sp_name', 'sp_question', 'sp_event', 'sp_peer_messages',
  'mem_photos', 'mem_note', 'mem_comments',
])

const BLOCK_META: Record<BlockType, { label: string; icon: string; addLabel: string }> = {
  hero:                  { label: 'Корица',           icon: 'add_a_photo',       addLabel: 'Добави корица' },
  students_grid:         { label: 'Ученици',          icon: 'group',             addLabel: 'Ученици на класа' },
  question:              { label: 'Въпрос',           icon: 'quiz',              addLabel: 'Избери въпрос' },
  photo_gallery:         { label: 'Галерия',          icon: 'photo_library',     addLabel: 'Избери въпрос за снимки' },
  poll:                  { label: 'Анкета',           icon: 'poll',              addLabel: 'Добави анкета' },
  polls_grid:            { label: 'Победители',       icon: 'emoji_events',      addLabel: 'Победители в анкети' },
  class_voice:           { label: 'Анонимен въпрос — облак', icon: 'record_voice_over', addLabel: 'Анонимен въпрос (облак)' },
  subjects_bar:          { label: 'Анонимен въпрос — графика', icon: 'bar_chart',      addLabel: 'Анонимен въпрос (графика)' },
  events:                { label: 'Събития',          icon: 'photo_album',       addLabel: 'Добави събитие' },
  superhero:             { label: 'Супергерой',       icon: 'bolt',              addLabel: 'AI изображение на класа' },
  cover_photo:           { label: 'Корична снимка',   icon: 'image',             addLabel: 'Корична снимка' },
  cover_logo:            { label: 'Лого',             icon: 'school',            addLabel: 'Лого' },
  cover_class_name:      { label: 'Клас / Група',     icon: 'badge',             addLabel: 'Клас' },
  cover_year:            { label: 'Учебна година',    icon: 'calendar_today',    addLabel: 'Учебна година' },
  cover_tagline:         { label: 'Слоган',           icon: 'format_quote',      addLabel: 'Слоган' },
  closing_logo:          { label: 'Лого',             icon: 'school',            addLabel: 'Лого' },
  closing_title:         { label: 'Заглавие',         icon: 'title',             addLabel: 'Заглавие' },
  closing_year:          { label: 'Учебна година',    icon: 'calendar_today',    addLabel: 'Учебна година' },
  closing_quote:         { label: 'Цитат',            icon: 'format_quote',      addLabel: 'Цитат' },
  closing_student_count: { label: 'Брой участници',  icon: 'people',            addLabel: 'Брой участници' },
  closing_colophon:      { label: 'Колофон',          icon: 'copyright',         addLabel: 'Колофон' },
  sp_photo:         { label: 'Снимка',   icon: 'portrait',    addLabel: 'Снимка' },
  sp_name:          { label: 'Име',      icon: 'badge',       addLabel: 'Име' },
  sp_question:      { label: 'Въпрос',  icon: 'quiz',        addLabel: 'Въпрос' },
  sp_accents:       { label: 'Акценти', icon: 'star',        addLabel: 'Акценти' },
  sp_event:         { label: 'Събитие', icon: 'photo_album', addLabel: 'Събитие' },
  sp_peer_messages: { label: 'Послания',icon: 'mail',        addLabel: 'Послания' },
  mem_photos:   { label: 'Снимки',    icon: 'photo_library', addLabel: 'Снимки' },
  mem_note:     { label: 'Бележка',   icon: 'notes',         addLabel: 'Бележка' },
  mem_comments: { label: 'Коментари', icon: 'chat',          addLabel: 'Коментари' },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function linkedLabel(type: BlockType, cfg: Record<string, unknown>, assets: LayoutAssets): string | null {
  switch (type) {
    case 'question':
    case 'photo_gallery': {
      const id = cfg.questionId as string | null
      return id ? (assets.questions.find(q => q.id === id)?.label ?? null) : null
    }
    case 'poll': {
      const id = cfg.pollId as string | null
      return id ? (assets.polls.find(p => p.id === id)?.label ?? null) : null
    }
    case 'class_voice':
    case 'subjects_bar': {
      const id = cfg.questionId as string | null
      return id ? (assets.voiceQuestions.find(q => q.id === id)?.label ?? null) : null
    }
    case 'sp_question': {
      const id = cfg.questionId as string | null
      return id ? (assets.questions.find(q => q.id === id)?.label ?? null) : null
    }
    case 'sp_event': {
      const id = cfg.eventId as string | null
      return id ? (assets.events.find(e => e.id === id)?.label ?? null) : null
    }
    default: return null
  }
}

function pickerOptions(type: BlockType, assets: LayoutAssets): { id: string; label: string }[] {
  switch (type) {
    case 'question':
    case 'photo_gallery':  return assets.questions
    case 'class_voice':    return assets.voiceQuestions.filter(q => q.voice_display !== 'barchart')
    case 'subjects_bar':   return assets.voiceQuestions.filter(q => q.voice_display === 'barchart')
    case 'poll':           return assets.polls
    default:               return []
  }
}

function assignConfig(type: BlockType, assetId: string): Record<string, unknown> {
  switch (type) {
    case 'poll':           return { pollId: assetId }
    default:               return { questionId: assetId }
  }
}

// ── Shell ──────────────────────────────────────────────────────────────────

interface CanvasProps {
  blocks: Block[]
  assets: LayoutAssets
  classId: string
  activeId: string | null
  onSelect: (id: string) => void
  onAssign: (blockId: string, config: Record<string, unknown>) => void
  onReorder: (blocks: Block[]) => void
  memberLabel?: string | null
  memoriesLabel?: string | null
  starsLabel?: string | null
}

export default function LayoutCanvas({ blocks, assets, classId, activeId, onSelect, onAssign, onReorder, memberLabel, memoriesLabel, starsLabel }: CanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex(b => b.id === active.id)
    const newIndex = blocks.findIndex(b => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(blocks, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {blocks.map((block) => (
            <SortableCanvasBlock
              key={block.id}
              block={block}
              assets={assets}
              classId={classId}
              isActive={activeId === block.id}
              onSelect={() => onSelect(block.id)}
              onAssign={(config) => onAssign(block.id, config)}
              memberLabel={memberLabel}
              memoriesLabel={memoriesLabel}
              starsLabel={starsLabel}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// ── Sortable wrapper ──────────────────────────────────────────────────────────

function SortableCanvasBlock(props: {
  block: Block
  assets: LayoutAssets
  classId: string
  isActive: boolean
  onSelect: () => void
  onAssign: (config: Record<string, unknown>) => void
  memberLabel?: string | null
  memoriesLabel?: string | null
  starsLabel?: string | null
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const isFullWidth = FULL_WIDTH.has(props.block.type) || (props.block.config as Record<string, unknown>).fullWidth

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isFullWidth ? 'col-span-2' : ''}
    >
      <CanvasBlock {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

// ── Per-block wrapper ──────────────────────────────────────────────────────

function CanvasBlock({ block, assets, classId, isActive, onSelect, onAssign, dragHandleProps, memberLabel, memoriesLabel, starsLabel }: {
  block: Block
  dragHandleProps?: Record<string, unknown>
  assets: LayoutAssets
  classId: string
  isActive: boolean
  onSelect: () => void
  onAssign: (config: Record<string, unknown>) => void
  memberLabel?: string | null
  memoriesLabel?: string | null
  starsLabel?: string | null
}) {
  const cfg = block.config as Record<string, unknown>
  const linked = linkedLabel(block.type, cfg, assets)
  const baseMeta = BLOCK_META[block.type] ?? { label: block.type, icon: 'help_outline', addLabel: block.type }
  const meta = {
    ...baseMeta,
    label:
      block.type === 'students_grid' && memberLabel ? memberLabel :
      block.type === 'polls_grid'    && starsLabel  ? starsLabel  :
      block.type === 'events'        && memoriesLabel ? memoriesLabel :
      baseMeta.label,
  }
  const options = pickerOptions(block.type, assets)
  const isAssignable = options.length > 0
  const needsPicker = isAssignable && !linked

  // Cover / Closing / Student Page static blocks — no picker needed, show styled placeholder
  const isCoverClosing = block.type.startsWith('cover_') || block.type.startsWith('closing_')
  const isStudentPage = block.type.startsWith('sp_')
  if (isCoverClosing || isStudentPage) {
    const cfg = block.config as Record<string, unknown>
    const pageNum = cfg.page as number | undefined
    const isDark = block.type.startsWith('closing_')
    const pageLabel = isStudentPage ? (pageNum === 2 ? 'Стр. 2' : 'Стр. 1') : null
    // Get linked label for question/event
    const linkedName = linkedLabel(block.type, cfg, assets)
    return (
      <div
        onClick={onSelect}
        className={`relative cursor-pointer rounded-2xl transition-all duration-200 ${
          isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2'
        } ${isDark ? 'bg-[#12082e] border border-[#3632b7]/30' : isStudentPage ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-800 border border-slate-600/30'} min-h-[60px] flex items-center px-4 gap-3`}
      >
        <span
          {...(dragHandleProps ?? {})}
          onClick={e => e.stopPropagation()}
          className={`material-symbols-outlined text-base cursor-grab active:cursor-grabbing flex-none ${isStudentPage ? 'text-indigo-300' : 'text-white/20'}`}
        >drag_indicator</span>
        <span className={`material-symbols-outlined text-lg ${isStudentPage ? 'text-indigo-400' : 'text-white/40'}`}>{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold uppercase tracking-widest ${isStudentPage ? 'text-indigo-600' : 'text-white/60'}`}>{meta.label}</span>
          {linkedName && <p className="text-xs text-gray-500 truncate mt-0.5">{linkedName}</p>}
        </div>
        {pageLabel && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-500 flex-none">{pageLabel}</span>
        )}
        {isActive && !pageLabel && (
          <span className={`ml-auto text-[10px] ${isStudentPage ? 'text-indigo-400' : 'text-white/40'}`}>Избрано</span>
        )}
      </div>
    )
  }

  // Hero/cover block has its own interactive component
  if (block.type === 'hero') {
    return (
      <HeroCoverCanvas
        classId={classId}
        assets={assets}
        isActive={isActive}
        onSelect={onSelect}
      />
    )
  }

  // Events block has its own interactive component
  if (block.type === 'events') {
    return (
      <EventsBlockCanvas
        block={block}
        assets={assets}
        classId={classId}
        isActive={isActive}
        onSelect={onSelect}
        memoriesLabel={memoriesLabel}
      />
    )
  }

  // Empty assignable block → show inline picker, not selectable for config
  if (needsPicker) {
    return (
      <InlinePicker
        meta={meta}
        options={options}
        type={block.type}
        onPick={(id) => onAssign(assignConfig(block.type, id))}
      />
    )
  }

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl transition-all duration-200 ${
        isActive
          ? 'ring-2 ring-indigo-500 ring-offset-2'
          : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2'
      }`}
    >
      {/* Block label badge + drag handle */}
      <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5">
        <span
          {...(dragHandleProps ?? {})}
          onClick={e => e.stopPropagation()}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing material-symbols-outlined text-base"
          title="Премести"
        >drag_indicator</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
          isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-200'
        }`}>
          {meta.label}
        </span>
      </div>

      <BlockVisual block={block} assets={assets} linked={linked} memberLabel={memberLabel} memoriesLabel={memoriesLabel} starsLabel={starsLabel} />
    </div>
  )
}

// ── Picker placeholder + drawer ────────────────────────────────────────────

const PICKER_ACCENT: Record<string, { bg: string; border: string; iconBg: string; iconText: string; titleText: string; emptyText: string; hoverBorder: string; hoverBg: string; hoverText: string; optionBorder: string; optionHover: string }> = {
  voice:    { bg: 'bg-purple-50',    border: 'border-purple-200',      iconBg: 'bg-purple-600',    iconText: 'text-white',        titleText: 'text-purple-800', emptyText: 'text-purple-300', hoverBorder: 'hover:border-purple-400', hoverBg: 'hover:bg-purple-50',   hoverText: 'hover:text-purple-700', optionBorder: 'border-purple-100', optionHover: 'hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700' },
  poll:     { bg: 'bg-green-50',     border: 'border-green-200',       iconBg: 'bg-green-600',     iconText: 'text-white',        titleText: 'text-green-800',  emptyText: 'text-green-300',  hoverBorder: 'hover:border-green-400',  hoverBg: 'hover:bg-green-50',    hoverText: 'hover:text-green-700',  optionBorder: 'border-green-100',  optionHover: 'hover:border-green-400 hover:bg-green-50 hover:text-green-700' },
  default:  { bg: 'bg-[#e2dfff]',   border: 'border-[#3632b7]/20',    iconBg: 'bg-[#3632b7]',    iconText: 'text-white',        titleText: 'text-[#3632b7]',  emptyText: 'text-[#3632b7]/30', hoverBorder: 'hover:border-indigo-400', hoverBg: 'hover:bg-white',       hoverText: 'hover:text-indigo-700', optionBorder: 'border-indigo-100', optionHover: 'hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700' },
}

function accentFor(type: BlockType) {
  if (type === 'class_voice' || type === 'subjects_bar') return PICKER_ACCENT.voice
  if (type === 'poll') return PICKER_ACCENT.poll
  return PICKER_ACCENT.default
}

function InlinePicker({ meta, options, type, onPick }: {
  meta: { label: string; icon: string }
  options: { id: string; label: string }[]
  type: BlockType
  onPick: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const a = accentFor(type)
  const emptyLabel = type === 'poll' ? 'Няма създадени анкети' : 'Няма налични въпроси'

  return (
    <>
      {/* Skeleton placeholder */}
      <button
        onClick={() => setOpen(true)}
        className={`w-full rounded-2xl border-2 border-dashed ${a.border} ${a.bg} flex flex-col items-center justify-center gap-3 min-h-[140px] group transition-all ${a.hoverBorder} hover:shadow-sm`}
      >
        <div className={`w-10 h-10 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center ${a.iconBg} group-hover:scale-110 transition-transform`}>
          <span className={`material-symbols-outlined text-xl ${a.iconText}`}>add</span>
        </div>
        <div className="text-center">
          <p className={`text-xs font-bold uppercase tracking-widest ${a.titleText}`}>{meta.label}</p>
          <p className={`text-[10px] mt-0.5 ${a.emptyText}`}>Избери от банката</p>
        </div>
      </button>

      {/* Picker drawer */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-screen-sm mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${a.iconBg}`}>
                  <span className={`material-symbols-outlined text-sm ${a.iconText}`}>{meta.icon}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base">{meta.label}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              {options.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-6">{emptyLabel}</p>
              ) : (
                options.map(q => (
                  <button
                    key={q.id}
                    onClick={() => { onPick(q.id); setOpen(false) }}
                    className={`w-full text-left text-sm px-4 py-3 rounded-xl border ${a.optionBorder} ${a.optionHover} text-gray-600 font-medium transition-all flex items-center gap-3`}
                  >
                    <span className={`material-symbols-outlined text-base ${a.iconBg} ${a.iconText} w-7 h-7 rounded-lg flex items-center justify-center flex-none`} style={{ fontSize: 14 }}>{meta.icon}</span>
                    {q.label}
                  </button>
                ))
              )}
            </div>
            <div className="px-6 pb-6 pt-2">
              <button onClick={() => setOpen(false)} className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500">
                Затвори
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Hero / Cover block ─────────────────────────────────────────────────────

function HeroCoverCanvas({ classId, assets, isActive, onSelect }: {
  classId: string
  assets: LayoutAssets
  isActive: boolean
  onSelect: () => void
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(assets.coverImageUrl)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) {
      await updateCoverImage(classId, data.url)
      setImageUrl(data.url)
    }
    setUploading(false)
  }

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl transition-all duration-200 ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2'}`}
    >
      <div className="absolute -top-3 left-4 z-10">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
          Корица
        </span>
      </div>

      <div className="w-full h-[200px] sm:h-[260px] rounded-xl overflow-hidden relative group">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Корица" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-3">
              <label
                onClick={e => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-xl shadow-lg hover:bg-indigo-600 hover:text-white flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                {uploading ? 'Качване...' : 'Смени корицата'}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
          </>
        ) : (
          <label
            onClick={e => e.stopPropagation()}
            className="w-full h-full bg-[#f4f3f2] dashed-placeholder flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white transition-colors group/upload"
          >
            <div className="w-14 h-14 rounded-full bg-[#e2dfff] flex items-center justify-center group-hover/upload:bg-[#3632b7] transition-colors">
              <span className="material-symbols-outlined text-[#3632b7] group-hover/upload:text-white text-3xl transition-colors">
                {uploading ? 'hourglass_empty' : 'add_a_photo'}
              </span>
            </div>
            <span className="font-semibold text-[#3632b7]" style={{ fontFamily: 'Noto Serif, serif' }}>
              {uploading ? 'Качване...' : 'Добави корица'}
            </span>
            <p className="text-xs text-gray-400">Препоръчителен размер: 1920×1080px</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  )
}

// ── Events block with inline creation ─────────────────────────────────────

const ROTATIONS = ['rotate-1', '-rotate-1', '-rotate-1', 'rotate-1']

interface LocalEvent { id: string; title: string; event_date: string | null; note: string | null; photos: string[] }

function EventsBlockCanvas({ block, assets, classId, isActive, onSelect, memoriesLabel }: {
  block: Block
  assets: LayoutAssets
  classId: string
  isActive: boolean
  onSelect: () => void
  memoriesLabel?: string | null
}) {
  const cfg = block.config as { limit?: number; style?: string }
  const limit = Math.min(cfg.limit ?? 4, 4)
  const [events, setEvents] = useState<LocalEvent[]>(
    assets.events.slice(0, limit).map(e => ({ id: e.id, title: e.label, event_date: null, note: null, photos: [] }))
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null)
  const [form, setForm] = useState({ title: '', event_date: '', note: '' })
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function openDrawer() {
    setEditingEvent(null)
    setForm({ title: '', event_date: '', note: '' })
    setExistingPhotos([]); setNewPhotos([]); setNewPreviews([]); setError(null)
    setDrawerOpen(true)
  }
  function openEditDrawer(ev: LocalEvent) {
    setEditingEvent(ev)
    setForm({ title: ev.title, event_date: ev.event_date ?? '', note: ev.note ?? '' })
    setExistingPhotos(ev.photos); setNewPhotos([]); setNewPreviews([]); setError(null)
    setDrawerOpen(true)
  }
  function closeDrawer() { setDrawerOpen(false); setEditingEvent(null) }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const slots = 5 - existingPhotos.length
    const files = Array.from(e.target.files ?? []).slice(0, slots)
    setNewPhotos(files)
    setNewPreviews(files.map(f => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function handleRemoveExisting(url: string) {
    setExistingPhotos(prev => prev.filter(p => p !== url))
  }

  async function uploadNewPhotos(): Promise<string[]> {
    const uploaded: string[] = []
    for (const file of newPhotos) {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/media/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) uploaded.push(data.url)
    }
    return uploaded
  }

  function handleSave() {
    if (!form.title.trim()) return
    setError(null); setUploading(true)
    startTransition(async () => {
      if (editingEvent) {
        // Edit mode
        const newUrls = await uploadNewPhotos()
        const allPhotos = [...existingPhotos, ...newUrls]
        const result = await updateEvent(classId, editingEvent.id, {
          title: form.title.trim(),
          event_date: form.event_date || null,
          note: form.note || null,
          photos: allPhotos,
        })
        if (result.error) { setError(result.error); setUploading(false); return }
        setEvents(prev => prev.map(e => e.id === editingEvent.id
          ? { ...e, title: form.title.trim(), event_date: form.event_date || null, note: form.note || null, photos: allPhotos }
          : e
        ))
      } else {
        // Create mode
        const result = await createEvent(classId, {
          title: form.title.trim(),
          event_date: form.event_date || null,
          note: form.note || null,
          order_index: events.length + 1,
        })
        if (result.error || !result.id) { setError(result.error ?? 'Грешка'); setUploading(false); return }
        const uploadedUrls = await uploadNewPhotos()
        if (uploadedUrls.length > 0) {
          await updateEvent(classId, result.id, {
            title: form.title.trim(),
            event_date: form.event_date || null,
            note: form.note || null,
            photos: uploadedUrls,
          })
        }
        setEvents(prev => [...prev, {
          id: result.id!,
          title: form.title.trim(),
          event_date: form.event_date || null,
          note: form.note || null,
          photos: uploadedUrls,
        }])
      }
      setUploading(false); closeDrawer()
    })
  }

  const slots = Array.from({ length: limit })

  return (
    <>
      <div
        onClick={onSelect}
        className={`relative cursor-pointer rounded-2xl transition-all duration-200 ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-2'}`}
      >
        <div className="absolute -top-3 left-4 z-10">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
            Събития
          </span>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif, serif' }}>{memoriesLabel || 'Нашите събития'}</h2>
            <span className="text-xs text-gray-400 uppercase tracking-widest">{events.length} / {cfg.limit ?? 20}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {slots.map((_, i) => {
              const ev = events[i]
              const rot = ROTATIONS[i % ROTATIONS.length]
              if (ev) {
                return (
                  <button
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); openEditDrawer(ev) }}
                    className={`aspect-square bg-white rounded-xl shadow-md overflow-hidden flex flex-col ${rot} transition-transform group relative`}
                  >
                    {ev.photos[0] ? (
                      <img src={ev.photos[0]} alt={ev.title} className="flex-1 w-full object-cover" />
                    ) : (
                      <div className="flex-1 bg-[#e2dfff] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#3632b7] text-3xl">photo_camera</span>
                      </div>
                    )}
                    <div className="px-3 py-2 bg-white text-left">
                      <p className="text-xs font-bold text-gray-800 leading-tight truncate">{ev.title}</p>
                      {ev.event_date && <p className="text-[10px] text-gray-400">{new Date(ev.event_date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}</p>}
                    </div>
                    {/* Edit overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-700 text-base">edit</span>
                      </div>
                    </div>
                  </button>
                )
              }
              return (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); openDrawer() }}
                  className={`aspect-square dashed-placeholder bg-[#f4f3f2] rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white hover:shadow-md transition-all ${rot} group`}
                >
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-colors">
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-400 text-xl transition-colors">add</span>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-indigo-500 font-medium transition-colors">Добави спомен</span>
                </button>
              )
            })}
          </div>
          {events.length >= limit && (
            <button
              onClick={(e) => { e.stopPropagation(); openDrawer() }}
              className="w-full text-xs text-indigo-500 hover:text-indigo-700 font-medium py-2 transition-colors"
            >
              + Добави още спомен
            </button>
          )}
        </div>
      </div>

      {/* ── Creation drawer ── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 space-y-4 max-w-screen-sm mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">{editingEvent ? 'Редактирай спомен' : 'Нов спомен'}</h3>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Название *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Напр. Коледно тържество"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Дата <span className="font-normal text-gray-400">(по желание)</span></label>
                <DateInput
                  value={form.event_date}
                  onChange={v => setForm(f => ({ ...f, event_date: v }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Бележка <span className="font-normal text-gray-400">(по желание)</span></label>
                <input
                  type="text"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Напр. Актова зала"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Снимки <span className="font-normal text-gray-400">(до 5)</span></label>
              <div className="flex items-center gap-3 flex-wrap">
                {existingPhotos.map((src) => (
                  <div key={src} className="relative group/photo">
                    <img src={src} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                    <button
                      onClick={() => handleRemoveExisting(src)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover/photo:flex items-center justify-center"
                    >×</button>
                  </div>
                ))}
                {newPreviews.map((src, i) => (
                  <img key={`new-${i}`} src={src} alt="" className="w-16 h-16 rounded-xl object-cover border border-indigo-200" />
                ))}
                {existingPhotos.length + newPhotos.length < 5 && (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-gray-400 text-xl">add_photo_alternate</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || isPending || uploading}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors"
              >
                {uploading || isPending ? 'Запазване...' : editingEvent ? 'Запази промените' : 'Запази'}
              </button>
              <button onClick={closeDrawer} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
                Отказ
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Visual skeletons per block type ───────────────────────────────────────

function BlockVisual({ block, assets, linked, memberLabel, memoriesLabel, starsLabel }: { block: Block; assets: LayoutAssets; linked: string | null; memberLabel?: string | null; memoriesLabel?: string | null; starsLabel?: string | null }) {
  const cfg = block.config as Record<string, unknown>
  const meta = BLOCK_META[block.type] ?? { label: block.type, icon: 'help_outline', addLabel: block.type }

  switch (block.type) {

    case 'hero':
      // Handled by HeroCoverCanvas above CanvasBlock
      return null

    case 'superhero':
      return (
        <div className="w-full h-[200px] sm:h-[260px] dashed-placeholder rounded-xl bg-[#fef9c3] flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors">
          <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-yellow-600 text-3xl">bolt</span>
          </div>
          <span className="font-semibold text-yellow-700" style={{ fontFamily: 'Noto Serif, serif' }}>AI Супергерой на класа</span>
          <p className="text-xs text-yellow-500">Генерира се автоматично след настройка</p>
        </div>
      )

    case 'students_grid':
      return (
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif, serif' }}>{memberLabel || 'Учениците'}</h2>
            <span className="text-xs uppercase tracking-widest text-gray-400">{memberLabel || 'ученици'} →</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-3 gap-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5" style={{ opacity: 1 - i * 0.07 }}>
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <span className="material-symbols-outlined text-gray-300 text-base">person</span>
                </div>
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )

    case 'question': {
      return (
        <div className="bg-[#e2dfff] border-2 border-[#3632b7]/30 rounded-xl p-5 flex flex-col items-center justify-center min-h-[140px] gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3632b7] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-white">quiz</span>
          </div>
          <span className="font-semibold text-center text-[#3632b7]" style={{ fontFamily: 'Noto Serif, serif' }}>
            „{linked}"
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#3632b7]/70">
            <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>
            {(cfg.layout as string) ?? 'grid'} оформление
          </div>
        </div>
      )
    }

    case 'photo_gallery': {
      return (
        <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 flex items-center gap-3 min-h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-none">
            <span className="material-symbols-outlined text-pink-500">photo_library</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{linked}</p>
            <p className="text-xs text-pink-500">Фото галерия · {String(cfg.columns ?? 3)} колони</p>
          </div>
          <span className="material-symbols-outlined text-sm text-green-500 ml-auto">check_circle</span>
        </div>
      )
    }

    case 'class_voice': {
      return (
        <div className={`border-2 rounded-xl p-5 flex flex-col items-center justify-center min-h-[130px] gap-3 ${linked ? 'bg-purple-50 border-purple-200' : 'bg-purple-50/40 border-dashed border-purple-200'}`}>
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-white">record_voice_over</span>
          </div>
          {linked ? (
            <>
              <span className="font-semibold text-center text-purple-800" style={{ fontFamily: 'Noto Serif, serif' }}>
                „{linked}"
              </span>
              <span className="text-xs text-purple-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>Свързан
              </span>
            </>
          ) : (
            <span className="text-xs text-purple-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-amber-400">warning</span>Не е свързан
            </span>
          )}
        </div>
      )
    }

    case 'subjects_bar': {
      return (
        <div className={`border-2 rounded-xl p-5 flex flex-col items-center justify-center min-h-[130px] gap-3 ${linked ? 'bg-teal-50 border-teal-200' : 'bg-teal-50/40 border-dashed border-teal-200'}`}>
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-white">bar_chart</span>
          </div>
          {linked ? (
            <>
              <span className="font-semibold text-center text-teal-800" style={{ fontFamily: 'Noto Serif, serif' }}>
                „{linked}"
              </span>
              <span className="text-xs text-teal-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>Свързан
              </span>
            </>
          ) : (
            <span className="text-xs text-teal-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-amber-400">warning</span>Не е свързан
            </span>
          )}
        </div>
      )
    }

    case 'poll': {
      return (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 flex flex-col items-center justify-center min-h-[130px] gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-white">poll</span>
          </div>
          <span className="font-semibold text-center text-green-800" style={{ fontFamily: 'Noto Serif, serif' }}>
            „{linked}"
          </span>
          <span className="text-xs text-green-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>Свързана анкета
          </span>
        </div>
      )
    }

    case 'polls_grid': {
      const polls = assets.polls
      return (
        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center flex-none">
              <span className="material-symbols-outlined text-sm text-white">emoji_events</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">{starsLabel || 'Победители в анкети'}</span>
          </div>
          {polls.length === 0 ? (
            <p className="text-xs text-amber-400 italic px-1">Все още няма създадени анкети</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {polls.map(p => (
                <div
                  key={p.id}
                  className="text-xs px-3 py-2 rounded-xl border border-amber-200 bg-white text-amber-800 font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 14 }}>trophy</span>
                  {p.label}
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-amber-400 px-1">Победителите от всички анкети ще се покажат автоматично</p>
        </div>
      )
    }

    case 'events':
      // Handled by EventsBlockCanvas above CanvasBlock
      return null

    default:
      return (
        <div className="dashed-placeholder bg-[#f4f3f2] rounded-xl p-8 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-gray-300">{meta.icon}</span>
          <span className="text-sm text-gray-400">{meta.addLabel}</span>
        </div>
      )
  }
}
