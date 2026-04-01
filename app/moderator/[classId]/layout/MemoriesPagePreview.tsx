'use client'
import type { Block } from '@/lib/templates/types'

export default function MemoriesPagePreview({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <span className="material-symbols-outlined text-4xl">photo_album</span>
        <p>Добавете блокове за страниците със спомени</p>
        <p className="text-xs text-gray-300">Шаблонът се прилага за всяко събитие</p>
      </div>
    )
  }

  const accent = '#3632b7'

  function renderBlock(block: Block) {
    const cfg = block.config as Record<string, unknown>
    switch (block.type) {
      case 'mem_photos': {
        const cols = (cfg.cols as number) ?? 3
        return (
          <div className="mb-3">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Снимки</div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols * 2 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded aspect-[4/3] flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-300" style={{ fontSize: 14 }}>image</span>
                </div>
              ))}
            </div>
          </div>
        )
      }
      case 'mem_note':
        return (
          <div className="mb-3">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Бележка</div>
            <div className="space-y-1">
              <div className="h-1.5 bg-gray-100 rounded w-full" />
              <div className="h-1.5 bg-gray-100 rounded w-5/6" />
              <div className="h-1.5 bg-gray-100 rounded w-4/5" />
            </div>
          </div>
        )
      case 'mem_comments':
        return (
          <div className="mb-2">
            <div className="text-[9px] font-bold uppercase tracking-wide mb-1.5" style={{ color: accent }}>Коментари от класа</div>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex gap-1.5 items-start">
                  <div className="w-4 h-4 rounded-full bg-gray-200 flex-none" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1 bg-gray-200 rounded w-2/3" />
                    <div className="h-1 bg-gray-100 rounded w-full" />
                    <div className="h-1 bg-gray-100 rounded w-5/6" />
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

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Header strip */}
        <div className="px-4 py-3" style={{ backgroundColor: accent }}>
          <div className="text-[8px] font-bold text-white/60 uppercase tracking-widest mb-0.5">Нашите спомени</div>
          <div className="text-sm font-bold text-white">Пролетен поход</div>
          <div className="text-[8px] text-white/60 mt-0.5">18 април 2025</div>
        </div>
        {/* Content */}
        <div className="p-4">
          {blocks.map(b => (
            <div key={b.id}>{renderBlock(b)}</div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">Шаблонът се прилага за всяко събитие</p>
    </div>
  )
}
