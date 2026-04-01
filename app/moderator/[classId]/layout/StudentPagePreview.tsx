'use client'

import type { Block, LayoutAssets } from '@/lib/templates/types'
import type { LexiconData } from '@/app/lexicon/[classId]/LexiconBlocks'

export default function StudentPagePreview({ blocks, assets, lexiconData }: {
  blocks: Block[]
  assets: LayoutAssets
  lexiconData: LexiconData
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

  const accent = '#3632b7'

  function renderBlock(block: Block) {
    const cfg = block.config as Record<string, unknown>
    switch (block.type) {
      case 'sp_name':
        return (
          <div className="border-b border-gray-100 pb-2 mb-2">
            <div className="text-sm font-bold text-gray-800">Мария Иванова</div>
            <div className="text-xs text-gray-400">{lexiconData.namePart ?? 'Клас'}</div>
          </div>
        )
      case 'sp_question': {
        const q = cfg.questionId ? assets.questions.find(q => q.id === cfg.questionId) : null
        return (
          <div className="mb-1.5">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{q?.label ?? 'Въпрос'}</div>
            <div className="h-2 bg-gray-100 rounded w-3/4" />
          </div>
        )
      }
      case 'sp_event': {
        const ev = cfg.eventId ? assets.events.find(e => e.id === cfg.eventId) : null
        return (
          <div className="mb-1.5 flex gap-1.5 items-start">
            <div className="w-8 h-8 bg-gray-100 rounded flex-none" />
            <div>
              <div className="text-[10px] font-bold text-gray-500">{ev?.label ?? 'Събитие'}</div>
              <div className="h-1.5 bg-gray-100 rounded w-16 mt-0.5" />
            </div>
          </div>
        )
      }
      case 'sp_accents':
        return (
          <div className="mb-1.5">
            <div className="text-[10px] font-bold text-yellow-600 uppercase tracking-wide mb-1">Акценти</div>
            <div className="flex flex-col gap-1">
              {(assets.accentQuestions.length > 0 ? assets.accentQuestions : [{ id: '1', label: 'Акцент 1', type: 'better_together' }, { id: '2', label: 'Акцент 2', type: 'better_together' }]).slice(0, 3).map((q) => (
                <div key={q.id} className="flex items-center gap-1.5">
                  <span className="text-yellow-400 text-[10px]">★</span>
                  <div className="text-[10px] text-gray-500 truncate">{q.label}</div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'sp_peer_messages':
        return (
          <div className="mt-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Послания</div>
            <div className="grid grid-cols-2 gap-1">
              {[0, 1].map(i => (
                <div key={i} className="bg-gray-50 rounded p-1.5">
                  <div className="h-1.5 bg-gray-200 rounded w-full mb-1" />
                  <div className="h-1.5 bg-gray-200 rounded w-2/3" />
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
    const leftBlocks = pageBlocks.filter(b => b.type === 'sp_photo')
    const rightBlocks = pageBlocks.filter(b => b.type !== 'sp_photo')

    return (
      <div className="flex-1 min-w-0">
        <div className="text-center mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Страница {pageNum}</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm" style={{ minHeight: 280 }}>
          {/* Page header strip */}
          <div className="px-3 py-1.5" style={{ backgroundColor: accent }}>
            <div className="text-[8px] font-bold text-white/70 uppercase tracking-widest">Малки спомени</div>
          </div>
          {/* Two-column body */}
          {pageBlocks.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-xs">Няма блокове</div>
          ) : (
            <div className="flex gap-0" style={{ minHeight: 240 }}>
              {/* Narrow left column */}
              <div className="w-16 flex-none bg-gray-50 border-r border-gray-100 p-2 flex flex-col gap-2">
                {leftBlocks.length > 0 ? (
                  leftBlocks.map(b => (
                    <div key={b.id} className="w-12 h-14 rounded-lg bg-gray-200 mx-auto flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 18 }}>portrait</span>
                    </div>
                  ))
                ) : (
                  <div className="w-12 h-14 rounded-lg border-2 border-dashed border-gray-200 mx-auto" />
                )}
              </div>
              {/* Wide right column */}
              <div className="flex-1 p-3">
                {rightBlocks.length === 0 ? (
                  <div className="text-gray-200 text-xs text-center mt-8">Добавете блокове</div>
                ) : (
                  rightBlocks.map(b => (
                    <div key={b.id}>{renderBlock(b)}</div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-4 mb-3">
        <PageLayout pageNum={1} pageBlocks={page1Blocks} />
        <PageLayout pageNum={2} pageBlocks={page2Blocks} />
      </div>
      <p className="text-center text-xs text-gray-400">
        Изберете блок → настройки → Страница 1 или 2
      </p>
    </div>
  )
}
