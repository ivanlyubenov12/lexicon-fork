'use client'

import type { Block, LayoutAssets } from '@/lib/templates/types'
import type { LexiconData } from '@/app/lexicon/[classId]/LexiconBlocks'

const SP_BLOCK_META: Record<string, { label: string; icon: string; color: string }> = {
  sp_photo:              { label: 'Снимка',           icon: 'portrait',    color: 'bg-indigo-100 text-indigo-700' },
  sp_name:               { label: 'Име',              icon: 'badge',       color: 'bg-blue-100 text-blue-700' },
  sp_featured_questions: { label: 'Основни въпроси',  icon: 'star',        color: 'bg-amber-100 text-amber-700' },
  sp_questions:          { label: 'Останали въпроси', icon: 'quiz',        color: 'bg-purple-100 text-purple-700' },
  sp_event_comments:     { label: 'Спомени',          icon: 'photo_album', color: 'bg-teal-100 text-teal-700' },
  sp_peer_messages:      { label: 'Послания',         icon: 'mail',        color: 'bg-rose-100 text-rose-700' },
}

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

  const renderBlockPill = (block: Block) => {
    const meta = SP_BLOCK_META[block.type] ?? { label: block.type, icon: 'widgets', color: 'bg-gray-100 text-gray-600' }
    return (
      <div key={block.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${meta.color} text-xs font-semibold`}>
        <span className="material-symbols-outlined text-sm">{meta.icon}</span>
        {meta.label}
      </div>
    )
  }

  const PagePreview = ({ pageNum, pageBlocks }: { pageNum: number; pageBlocks: Block[] }) => (
    <div className="flex-1">
      <div className="text-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Страница {pageNum}</span>
      </div>
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white min-h-[320px] p-3 flex flex-col gap-2">
        {pageBlocks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-300 text-xs text-center">
            Няма блокове за<br />страница {pageNum}
          </div>
        ) : (
          pageBlocks.map(renderBlockPill)
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex gap-3 mb-4">
        <PagePreview pageNum={1} pageBlocks={page1Blocks} />
        <PagePreview pageNum={2} pageBlocks={page2Blocks} />
      </div>
      <p className="text-center text-xs text-gray-400">
        Изберете блок и сменете „Страница" в настройките → Стр. 1 или Стр. 2
      </p>
    </div>
  )
}
