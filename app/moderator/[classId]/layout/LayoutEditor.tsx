'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { saveLayout } from './actions'
import type { Block, BlockType, LayoutAssets } from '@/lib/templates/types'
import LayoutCanvas from './LayoutCanvas'
import AddBlockDrawer from './AddBlockDrawer'
import BlockConfigDrawer from './BlockConfigDrawer'
import { nanoid } from 'nanoid'
import { templatePresets } from '@/lib/templates/presets'
import type { LayoutAssets as LA } from '@/lib/templates/types'

const TEMPLATE_UI = [
  { id: 'primary',       name: 'Начално училище', subtitle: '1–4 клас',   icon: 'school',      color: 'bg-[#e2dfff]', accent: 'text-[#3632b7]', border: 'border-[#3632b7]' },
  { id: 'kindergarten',  name: 'Детска градина',  subtitle: 'ПУК',        icon: 'child_care',  color: 'bg-[#ffedd5]', accent: 'text-[#c2410c]', border: 'border-[#c2410c]' },
  { id: 'teens',         name: 'Тийновете',       subtitle: '5–9 клас',   icon: 'groups',      color: 'bg-[#d1fae5]', accent: 'text-[#065f46]', border: 'border-[#065f46]' },
  { id: 'custom',        name: 'Собствен',        subtitle: '',           icon: 'tune',        color: 'bg-gray-100',  accent: 'text-gray-600',  border: 'border-gray-400'  },
]

interface Props {
  classId: string
  className: string
  initialBlocks: Block[]
  templateId: string
  assets: LayoutAssets
}

export default function LayoutEditor({ classId, className, initialBlocks, templateId: initialTemplateId, assets }: Props) {
  const [blocks, setBlocks]           = useState<Block[]>(initialBlocks)
  // Map legacy 'classic' to 'primary' so the template picker highlights correctly
  const [activeTemplate, setActiveTemplate] = useState(
    initialTemplateId === 'classic' || !initialTemplateId ? 'primary' : initialTemplateId
  )
  const [activeBlockId, setActiveBlockId]   = useState<string | null>(null)
  const [addDrawerOpen, setAddDrawerOpen]   = useState(false)
  const [confirmTemplate, setConfirmTemplate] = useState<string | null>(null)
  const [saved, setSaved]             = useState(true)
  const [saveError, setSaveError]     = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

  const activeBlock = blocks.find(b => b.id === activeBlockId) ?? null

  function removeBlock(id: string) {
    setBlocks(prev => prev.filter(b => b.id !== id))
    setActiveBlockId(null)
    setActiveTemplate('custom')
    setSaved(false)
  }

  function updateBlock(id: string, config: Record<string, unknown>) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, config } : b))
    setSaved(false)
  }

  function moveBlock(id: string, dir: 'up' | 'down') {
    setBlocks(prev => {
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

  const FULL_WIDTH_TYPES: Set<BlockType> = new Set(['hero', 'superhero', 'students_grid', 'polls_grid', 'events'])

  function addBlock(type: BlockType) {
    const b: Block = { id: nanoid(8), type, config: {} }
    if (FULL_WIDTH_TYPES.has(type)) {
      setBlocks(prev => [...prev, b])
      setActiveBlockId(b.id)
    } else {
      // Add a pair of empty blocks in a row
      const b2: Block = { id: nanoid(8), type, config: {} }
      setBlocks(prev => [...prev, b, b2])
      setActiveBlockId(null)
    }
    setActiveTemplate('custom')
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
    setBlocks(preset.blocks.map(b => ({ ...b, id: nanoid(8) })))
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
      const result = await saveLayout(classId, blocks, activeTemplate)
      if (result.error) setSaveError(result.error)
      else setSaved(true)
    })
  }, [classId, blocks, activeTemplate])

  return (
    <div className="min-h-screen bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/moderator/${classId}`} className="text-gray-400 hover:text-gray-700 transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Редактор</p>
          <p className="font-bold text-gray-800 text-sm truncate">{className}</p>
        </div>
        <Link
          href={`/moderator/${classId}/preview`}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-2 transition-colors"
        >
          <span className="material-symbols-outlined text-base">visibility</span>
          Преглед
        </Link>
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

      {/* ── Template picker ─────────────────────────────────────────── */}
      <div className="max-w-screen-sm mx-auto px-4 pt-6 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Шаблон</p>
        <div className="grid grid-cols-4 gap-2">
          {TEMPLATE_UI.map(t => {
            const isActive = activeTemplate === t.id
            return (
              <button
                key={t.id}
                onClick={() => handleTemplateClick(t.id)}
                className={`relative flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border-2 transition-all ${
                  isActive ? `${t.border} ${t.color}` : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                {isActive && <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-xs text-green-500">check_circle</span>}
                <span className={`material-symbols-outlined text-xl ${isActive ? t.accent : 'text-gray-300'}`}>{t.icon}</span>
                <span className={`text-[10px] font-bold text-center leading-tight ${isActive ? t.accent : 'text-gray-400'}`}>{t.name}</span>
                {t.subtitle && <span className={`text-[9px] text-center leading-tight ${isActive ? t.accent : 'text-gray-300'} opacity-80`}>{t.subtitle}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Visual canvas ───────────────────────────────────────────── */}
      <main className="max-w-screen-sm mx-auto px-4 py-6 pb-32">
        {blocks.length === 0 ? (
          <div className="dashed-placeholder rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-200">view_quilt</span>
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
          />
        )}
      </main>

      {/* ── FAB: add block ──────────────────────────────────────────── */}
      <div className="fixed bottom-8 right-5 z-30">
        <button
          onClick={() => setAddDrawerOpen(true)}
          className="w-14 h-14 bg-[#3632b7] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
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
          onAdd={addBlock}
          onClose={() => setAddDrawerOpen(false)}
          existingTypes={blocks.map(b => b.type)}
        />
      )}

      {/* ── Confirm template switch ─────────────────────────────────── */}
      {confirmTemplate && (
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
