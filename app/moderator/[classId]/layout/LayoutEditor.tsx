'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import { saveLayout, savePageLayout } from './actions'
import type { Block, BlockType, LayoutAssets, PageId, PageLayouts } from '@/lib/templates/types'
import type { LexiconData } from '@/app/lexicon/[classId]/LexiconBlocks'
import LexiconBlocks from '@/app/lexicon/[classId]/LexiconBlocks'
import LayoutCanvas from './LayoutCanvas'
import AddBlockDrawer from './AddBlockDrawer'
import BlockConfigDrawer from './BlockConfigDrawer'
import CoverPagePreview from './CoverPagePreview'
import ClosingPagePreview from './ClosingPagePreview'
import StudentPagePreview from './StudentPagePreview'
import MemoriesPagePreview from './MemoriesPagePreview'
import { nanoid } from 'nanoid'
import { templatePresets } from '@/lib/templates/presets'
import { themes, defaultTheme } from '@/lib/templates/themes'

const TEMPLATE_UI = [
  { id: 'primary',       name: 'Начално училище', subtitle: '1–4 клас',   icon: 'school',      color: 'bg-[#e2dfff]', accent: 'text-[#3632b7]', border: 'border-[#3632b7]' },
  { id: 'kindergarten',  name: 'Детска градина',  subtitle: 'ПУК',        icon: 'child_care',  color: 'bg-[#ffedd5]', accent: 'text-[#c2410c]', border: 'border-[#c2410c]' },
  { id: 'teens',         name: 'Тийновете',       subtitle: '5–9 клас',   icon: 'groups',      color: 'bg-[#d1fae5]', accent: 'text-[#065f46]', border: 'border-[#065f46]' },
  { id: 'custom',        name: 'Собствен',        subtitle: '',           icon: 'tune',        color: 'bg-gray-100',  accent: 'text-gray-600',  border: 'border-gray-400'  },
]

const PAGES: Array<{ id: PageId; label: string; icon: string; available: boolean }> = [
  { id: 'cover',        label: 'Корица',          icon: 'auto_stories',  available: true  },
  { id: 'group',        label: 'Групата',          icon: 'groups',        available: true  },
  { id: 'students',     label: 'Участници',        icon: 'people',        available: false },
  { id: 'student_page', label: 'Лични страници',   icon: 'person',        available: true  },
  { id: 'memories',     label: 'Спомени',          icon: 'photo_album',   available: true  },
  { id: 'closing',      label: 'Задна корица',     icon: 'menu_book',     available: true  },
]

const FULL_WIDTH_TYPES: Set<BlockType> = new Set([
  'hero', 'superhero', 'students_grid', 'polls_grid', 'events',
  'cover_photo', 'cover_logo', 'cover_class_name', 'cover_year', 'cover_tagline',
  'closing_logo', 'closing_title', 'closing_year', 'closing_quote', 'closing_student_count', 'closing_colophon',
  'mem_photos', 'mem_note', 'mem_comments',
])

interface Props {
  classId: string
  className: string
  initialBlocks: Block[]
  templateId: string
  initialThemeVars: Record<string, string>
  assets: LayoutAssets
  lexiconData: LexiconData
  pageLayouts: PageLayouts
}

const VALID_SP_TYPES: ReadonlySet<BlockType> = new Set(['sp_photo', 'sp_name', 'sp_question', 'sp_accents', 'sp_event', 'sp_peer_messages'])

function defaultStudentPageBlocks(assets: LayoutAssets): Block[] {
  const blocks: Block[] = []
  blocks.push({ id: nanoid(8), type: 'sp_photo', config: { page: 1 } })
  blocks.push({ id: nanoid(8), type: 'sp_name', config: { page: 1 } })
  for (const q of assets.questions) {
    blocks.push({ id: nanoid(8), type: 'sp_question', config: { questionId: q.id, page: 1 } })
  }
  if (assets.accentQuestions.length > 0) {
    blocks.push({ id: nanoid(8), type: 'sp_accents', config: { page: 1 } })
  }
  for (const e of assets.events) {
    blocks.push({ id: nanoid(8), type: 'sp_event', config: { eventId: e.id, page: 2 } })
  }
  blocks.push({ id: nanoid(8), type: 'sp_peer_messages', config: { page: 2 } })
  return blocks
}

function defaultMemoriesBlocks(): Block[] {
  return [
    { id: nanoid(8), type: 'mem_photos', config: { cols: 3 } },
    { id: nanoid(8), type: 'mem_note', config: {} },
    { id: nanoid(8), type: 'mem_comments', config: {} },
  ]
}

export default function LayoutEditor({ classId, className, initialBlocks, templateId: initialTemplateId, initialThemeVars, assets, lexiconData, pageLayouts }: Props) {
  const [activePage, setActivePage] = useState<PageId>('group')
  const [allPageBlocks, setAllPageBlocks] = useState<Record<string, Block[]>>(() => {
    const saved = (pageLayouts as Record<string, Block[]>) ?? {}
    // Clean stale sp_* block types from saved student_page layout
    const cleanedStudentPage = (saved.student_page ?? []).filter(b => VALID_SP_TYPES.has(b.type as BlockType))
    const studentPageBlocks = cleanedStudentPage.length > 0
      ? cleanedStudentPage
      : defaultStudentPageBlocks(assets)
    const memoriesBlocks = (saved.memories ?? []).length > 0 ? saved.memories : defaultMemoriesBlocks()
    return {
      group: initialBlocks,
      cover: [],
      closing: [],
      ...saved,
      student_page: studentPageBlocks,
      memories: memoriesBlocks,
    }
  })

  // Derived: blocks for the active page
  const blocks = allPageBlocks[activePage] ?? []

  function setPageBlocks(newBlocks: Block[] | ((prev: Block[]) => Block[])) {
    setAllPageBlocks(prev => {
      const current = prev[activePage] ?? []
      const next = typeof newBlocks === 'function' ? newBlocks(current) : newBlocks
      return { ...prev, [activePage]: next }
    })
  }

  // Map legacy 'classic' to 'primary' so the template picker highlights correctly
  const [activeTemplate, setActiveTemplate] = useState(
    initialTemplateId === 'classic' || !initialTemplateId ? 'primary' : initialTemplateId
  )
  const [themeVars, setThemeVars] = useState<Record<string, string>>(initialThemeVars)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    if (activeTemplate === 'custom') return
    const preset = templatePresets.find(t => t.id === activeTemplate)
    const themeId = preset?.themeId ?? 'classic'
    setThemeVars((themes[themeId] ?? defaultTheme).vars)
  }, [activeTemplate])

  const [activeBlockId, setActiveBlockId]   = useState<string | null>(null)
  const [addDrawerOpen, setAddDrawerOpen]   = useState(false)
  const [confirmTemplate, setConfirmTemplate] = useState<string | null>(null)
  const [saved, setSaved]             = useState(true)
  const [saveError, setSaveError]     = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

  // Reset saved state when switching pages (the new page may have unsaved edits)
  useEffect(() => {
    setSaved(true)
    setActiveBlockId(null)
  }, [activePage])

  const activeBlock = blocks.find(b => b.id === activeBlockId) ?? null

  function removeBlock(id: string) {
    setPageBlocks(prev => prev.filter(b => b.id !== id))
    setActiveBlockId(null)
    if (activePage === 'group') setActiveTemplate('custom')
    setSaved(false)
  }

  function updateBlock(id: string, config: Record<string, unknown>) {
    setPageBlocks(prev => prev.map(b => b.id === id ? { ...b, config } : b))
    setSaved(false)
  }

  function moveBlock(id: string, dir: 'up' | 'down') {
    setPageBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id)
      if (idx === -1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
    setSaved(false)
  }

  function addBlock(type: BlockType, config?: Record<string, unknown>) {
    const b: Block = { id: nanoid(8), type, config: config ?? {} }
    if (FULL_WIDTH_TYPES.has(type) || activePage === 'cover' || activePage === 'closing' || activePage === 'student_page' || activePage === 'memories') {
      setPageBlocks(prev => [...prev, b])
      setActiveBlockId(b.id)
    } else {
      // Add a pair of empty blocks in a row
      const b2: Block = { id: nanoid(8), type, config: {} }
      setPageBlocks(prev => [...prev, b, b2])
      setActiveBlockId(null)
    }
    if (activePage === 'group') setActiveTemplate('custom')
    setAddDrawerOpen(false)
    setSaved(false)
  }

  function assignBlock(blockId: string, config: Record<string, unknown>) {
    updateBlock(blockId, config)
  }

  function applyTemplate(id: string) {
    if (id === 'custom') { setActiveTemplate('custom'); setConfirmTemplate(null); return }
    const preset = templatePresets.find(t => t.id === id)
    if (!preset) return

    // Auto-assign voice questions by display type
    const barchartQs = assets.voiceQuestions.filter(q => q.voice_display === 'barchart')
    const wordcloudQs = assets.voiceQuestions.filter(q => q.voice_display !== 'barchart')
    let barchartIdx = 0
    let wordcloudIdx = 0

    setPageBlocks(preset.blocks.map(b => {
      const newId = nanoid(8)
      if (b.type === 'subjects_bar' && barchartQs[barchartIdx]) {
        return { ...b, id: newId, config: { questionId: barchartQs[barchartIdx++].id } }
      }
      if (b.type === 'class_voice' && wordcloudQs[wordcloudIdx]) {
        return { ...b, id: newId, config: { questionId: wordcloudQs[wordcloudIdx++].id } }
      }
      return { ...b, id: newId }
    }))
    setActiveTemplate(id)
    setActiveBlockId(null)
    setConfirmTemplate(null)
    setSaved(false)
  }

  function handleTemplateClick(id: string) {
    if (id === 'custom') { setActiveTemplate('custom'); return }
    // Re-apply even if same template when canvas is empty
    if (id === activeTemplate && blocks.length > 0) return
    if (!saved || activeTemplate === 'custom') { setConfirmTemplate(id) } else { applyTemplate(id) }
  }

  const handleSave = useCallback(() => {
    setSaveError(null)
    startTransition(async () => {
      const result = await savePageLayout(classId, activePage, blocks, activePage === 'group' ? activeTemplate : undefined)
      if (result.error) setSaveError(result.error)
      else setSaved(true)
    })
  }, [classId, activePage, blocks, activeTemplate])

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/moderator/${classId}`} className="text-gray-400 hover:text-gray-700 transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Редактор на оформлението</p>
          <p className="font-bold text-gray-800 text-sm truncate">{className}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || saved}
          className={`inline-flex items-center gap-1.5 text-sm font-bold rounded-xl px-4 py-2 transition-all disabled:opacity-50 ${
            saved
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow'
          }`}
        >
          <span className="material-symbols-outlined text-base">{saved ? 'check' : 'save'}</span>
          {isPending ? 'Запазване...' : saved ? 'Запазено' : 'Запази'}
        </button>
      </header>

      {saveError && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{saveError}</div>
      )}

      {/* ── Split layout ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: block editor */}
        <aside className="w-full lg:w-96 lg:flex-shrink-0 flex flex-col overflow-y-auto border-r border-gray-100 bg-[#faf9f8]">

          {/* Page selector */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Страница</p>
            <div className="flex flex-col gap-1">
              {PAGES.map(p => (
                <button
                  key={p.id}
                  onClick={() => { if (p.available) setActivePage(p.id) }}
                  disabled={!p.available}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    activePage === p.id
                      ? 'bg-indigo-600 text-white'
                      : p.available
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{p.icon}</span>
                  {p.label}
                  {!p.available && <span className="ml-auto text-[9px] font-bold uppercase tracking-wider opacity-60">скоро</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Block list */}
          <div className="px-4 py-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Блокове</p>
              <button
                onClick={() => setAddDrawerOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Добави
              </button>
            </div>
            {blocks.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center justify-center gap-3 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-200">view_quilt</span>
                <p className="text-gray-400 text-sm">Изберете шаблон или добавете блокове</p>
              </div>
            ) : (
              <LayoutCanvas
                blocks={blocks}
                assets={assets}
                classId={classId}
                activeId={activeBlockId}
                onSelect={id => setActiveBlockId(prev => prev === id ? null : id)}
                onAssign={assignBlock}
                onReorder={newBlocks => { setPageBlocks(newBlocks); setSaved(false) }}
                memberLabel={lexiconData.memberLabel}
                memoriesLabel={lexiconData.memoriesLabel}
                starsLabel={lexiconData.starsLabel}
              />
            )}
          </div>
        </aside>

        {/* Right: live preview */}
        <div className="hidden lg:block flex-1 overflow-y-auto bg-gray-50">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-gray-400">visibility</span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Живо превю</span>
            {!saved && <span className="ml-auto text-xs text-amber-500 font-medium">Незапазени промени</span>}
          </div>
          <div className="max-w-3xl mx-auto py-6 px-4">
            {activePage === 'group' && (
              <LexiconBlocks
                blocks={blocks}
                data={lexiconData}
                basePath={`/moderator/${classId}/preview`}
                previewMode
              />
            )}
            {activePage === 'cover' && (
              <CoverPagePreview blocks={blocks} assets={assets} lexiconData={lexiconData} themeVars={themeVars} />
            )}
            {activePage === 'closing' && (
              <ClosingPagePreview blocks={blocks} assets={assets} lexiconData={lexiconData} themeVars={themeVars} />
            )}
            {activePage === 'student_page' && (
              <StudentPagePreview blocks={blocks} assets={assets} lexiconData={lexiconData} themeVars={themeVars} />
            )}
            {activePage === 'memories' && (
              <MemoriesPagePreview blocks={blocks} themeVars={themeVars} />
            )}
            {activePage !== 'group' && activePage !== 'cover' && activePage !== 'closing' && activePage !== 'student_page' && activePage !== 'memories' && (
              <div className="p-8 text-center text-gray-400 text-sm">Тази страница ще бъде налична скоро.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Block config drawer (slide from bottom) ─────────────────── */}
      {activeBlock && (
        <BlockConfigDrawer
          block={activeBlock}
          assets={assets}
          classId={classId}
          blockIndex={blocks.findIndex(b => b.id === activeBlock.id)}
          blocksTotal={blocks.length}
          onUpdate={config => updateBlock(activeBlock.id, config)}
          onRemove={() => removeBlock(activeBlock.id)}
          onMove={dir => moveBlock(activeBlock.id, dir)}
          onClose={() => setActiveBlockId(null)}
        />
      )}

      {/* ── Add block drawer ────────────────────────────────────────── */}
      {addDrawerOpen && (
        <AddBlockDrawer
          pageId={activePage}
          onAdd={addBlock}
          onClose={() => setAddDrawerOpen(false)}
          existingTypes={blocks.map(b => b.type)}
          assets={assets}
        />
      )}

      {/* ── Confirm template switch (group page only) ───────────────── */}
      {confirmTemplate && activePage === 'group' && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => setConfirmTemplate(null)} />
          <div className="fixed inset-x-0 bottom-0 z-[51] bg-white rounded-t-3xl shadow-2xl p-6 max-w-screen-sm mx-auto">
            <h3 className="font-bold text-gray-900 text-center mb-1">Смяна на шаблон?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Блоковете ще се заменят с тези на шаблон „{TEMPLATE_UI.find(t => t.id === confirmTemplate)?.name}". Незапазените промени ще се изгубят.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmTemplate(null)} className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Отказ</button>
              <button onClick={() => applyTemplate(confirmTemplate)} className="py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold">Смени</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
