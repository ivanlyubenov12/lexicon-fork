'use client'

import type { Block, LayoutAssets } from '@/lib/templates/types'
import type { LexiconData } from '@/app/lexicon/[classId]/LexiconBlocks'

export default function StudentPagePreview({ blocks, assets, lexiconData, themeVars = {} }: {
  blocks: Block[]
  assets: LayoutAssets
  lexiconData: LexiconData
  themeVars?: Record<string, string>
}) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <span className="material-symbols-outlined text-4xl">person</span>
        <p>Добавете блокове за личната страница</p>
        <p className="text-xs text-gray-300">Шаблонът се прилага за всеки участник</p>
      </div>
    )
  }

  const page1Blocks = blocks.filter(b => (b.config as Record<string, unknown>).page !== 2)
  const page2Blocks = blocks.filter(b => (b.config as Record<string, unknown>).page === 2)

  const accent = themeVars['--lex-primary'] ?? '#3632b7'

  function renderBlock(block: Block) {
    const cfg = block.config as Record<string, unknown>
    switch (block.type) {
      case 'sp_name':
        return (
          <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif, serif' }}>Мария Иванова</div>
            <div className="text-sm text-gray-400 mt-0.5">{lexiconData.namePart ?? 'Клас'}</div>
          </div>
        )
      case 'sp_question': {
        const q = cfg.questionId ? assets.questions.find(q => q.id === cfg.questionId) : null
        return (
          <div className="mb-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{q?.label ?? 'Въпрос'}</div>
            <div className="space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          </div>
        )
      }
      case 'sp_event': {
        const ev = cfg.eventId ? assets.events.find(e => e.id === cfg.eventId) : null
        return (
          <div className="mb-4 flex gap-3 items-start">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-none flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300">photo_album</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-700">{ev?.label ?? 'Събитие'}</div>
              <div className="space-y-1 mt-1.5">
                <div className="h-2.5 bg-gray-100 rounded w-full" />
                <div className="h-2.5 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          </div>
        )
      }
      case 'sp_accents':
        return (
          <div className="mb-4">
            <div className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-2">★ Акценти</div>
            <div className="flex flex-col gap-2">
              {(assets.accentQuestions.length > 0
                ? assets.accentQuestions
                : [{ id: '1', label: 'Акцент 1', type: 'better_together' }, { id: '2', label: 'Акцент 2', type: 'better_together' }]
              ).slice(0, 3).map((q) => (
                <div key={q.id} className="flex items-center gap-2">
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className="text-yellow-300 text-sm">★</span>)}</div>
                  <div className="text-sm text-gray-500">{q.label}</div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'sp_peer_messages':
        return (
          <div className="mb-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Послания</div>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex-none" />
                    <div className="h-2.5 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-5/6" />
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  function PageLayout({ pageNum, pageBlocks }: { pageNum: number; pageBlocks: Block[] }) {
    const photoBlock = pageBlocks.find(b => b.type === 'sp_photo')
    const rightBlocks = pageBlocks.filter(b => b.type !== 'sp_photo')

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Страница {pageNum}</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {/* Page header */}
          <div className="px-6 py-3" style={{ backgroundColor: accent }}>
            <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Малки спомени</div>
          </div>
          {/* Two-column body */}
          {pageBlocks.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Няма блокове на тази страница</div>
          ) : (
            <div className="flex">
              {/* Narrow left column — photo */}
              <div className="flex-none bg-gray-50 border-r border-gray-100 p-4 flex flex-col gap-3" style={{ width: 120 }}>
                {photoBlock ? (
                  <div className="w-full rounded-xl bg-gray-200 flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
                    <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 32 }}>portrait</span>
                  </div>
                ) : (
                  <div className="w-full rounded-xl border-2 border-dashed border-gray-200" style={{ aspectRatio: '3/4' }} />
                )}
              </div>
              {/* Wide right column */}
              <div className="flex-1 p-5">
                {rightBlocks.length === 0 ? (
                  <div className="text-gray-200 text-sm text-center mt-12">Добавете блокове</div>
                ) : (() => {
                  // Group consecutive featured / video sp_question blocks
                  type Grp = { kind: 'featured' | 'video' | 'plain'; blocks: Block[] }
                  const groups: Grp[] = []
                  for (const b of rightBlocks) {
                    const cfg = b.config as Record<string, unknown>
                    const q = b.type === 'sp_question' && cfg.questionId
                      ? assets.questions.find(q => q.id === cfg.questionId) : null
                    const kind = q?.is_featured ? 'featured' : q?.type === 'video' ? 'video' : 'plain'
                    const last = groups[groups.length - 1]
                    if (last && last.kind === kind) last.blocks.push(b)
                    else groups.push({ kind, blocks: [b] })
                  }
                  return groups.map((grp, gi) => {
                    if (grp.kind === 'plain') {
                      return grp.blocks.map(b => <div key={b.id}>{renderBlock(b)}</div>)
                    }
                    const borderCls = grp.kind === 'featured'
                      ? 'border border-amber-300 rounded-xl overflow-hidden mb-4'
                      : 'border border-indigo-200 rounded-xl overflow-hidden mb-4'
                    const headerCls = grp.kind === 'featured'
                      ? 'bg-amber-50 px-3 py-1.5 border-b border-amber-200 flex items-center gap-1.5'
                      : 'bg-indigo-50 px-3 py-1.5 border-b border-indigo-200 flex items-center gap-1.5'
                    const iconCls = grp.kind === 'featured' ? 'text-amber-400' : 'text-indigo-400'
                    const labelCls = grp.kind === 'featured'
                      ? 'text-[10px] font-bold uppercase tracking-widest text-amber-500'
                      : 'text-[10px] font-bold uppercase tracking-widest text-indigo-500'
                    const icon = grp.kind === 'featured' ? 'star' : 'videocam'
                    const label = grp.kind === 'featured' ? 'Профилни въпроси' : 'Видео въпрос'
                    return (
                      <div key={gi} className={borderCls}>
                        <div className={headerCls}>
                          <span className={`material-symbols-outlined text-sm ${iconCls}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                          <p className={labelCls}>{label}</p>
                        </div>
                        <div className="p-3">
                          {grp.blocks.map(b => <div key={b.id}>{renderBlock(b)}</div>)}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageLayout pageNum={1} pageBlocks={page1Blocks} />
      <PageLayout pageNum={2} pageBlocks={page2Blocks} />
      <p className="text-center text-xs text-gray-400">
        Изберете блок → настройки → Страница 1 или 2
      </p>
    </div>
  )
}
