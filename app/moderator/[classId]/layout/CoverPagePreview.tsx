'use client'

import type { Block, LayoutAssets } from '@/lib/templates/types'
import type { LexiconData } from '@/app/lexicon/[classId]/LexiconBlocks'

export default function CoverPagePreview({ blocks, assets, lexiconData }: { blocks: Block[]; assets: LayoutAssets; lexiconData: LexiconData }) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <span className="material-symbols-outlined text-4xl">auto_stories</span>
        <p>Добавете блокове за корицата</p>
      </div>
    )
  }

  function renderBlock(block: Block) {
    const cfg = block.config as Record<string, unknown>
    switch (block.type) {
      case 'cover_photo':
        return assets.coverImageUrl
          ? <img src={assets.coverImageUrl} alt="Корица" className="w-full object-cover" style={{ maxHeight: 420 }} />
          : <div className="w-full flex items-center justify-center" style={{ height: 320, background: 'rgba(255,255,255,0.04)' }}>
              <span className="material-symbols-outlined text-white/10" style={{ fontSize: 80 }}>image</span>
            </div>

      case 'cover_logo':
        return (
          <div className="flex justify-center py-4">
            {assets.schoolLogoUrl
              ? <img src={assets.schoolLogoUrl} alt="Лого" className="w-20 h-20 object-contain rounded-full bg-white/10 p-1.5" />
              : <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/30" style={{ fontSize: 36 }}>school</span>
                </div>
            }
          </div>
        )

      case 'cover_tagline':
        return (
          <div className="text-center px-10 py-2">
            <p className="text-base italic" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Noto Serif, serif' }}>
              {(cfg.text as string) || 'Малки спомени'}
            </p>
          </div>
        )

      case 'cover_class_name':
        return (
          <div className="text-center px-10 py-3">
            <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Noto Serif, serif' }}>{lexiconData.namePart}</p>
            {lexiconData.schoolPart && <p className="text-base text-white/40 mt-1">{lexiconData.schoolPart}</p>}
          </div>
        )

      case 'cover_year':
        return (
          <div className="text-center py-2">
            <p className="text-lg font-bold" style={{ color: '#3632b7' }}>
              {lexiconData.classData?.name?.split(' — ')[1] ?? '2024/2025'}
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: '#12082e' }}>
      <div className="h-2" style={{ background: '#3632b7' }} />
      {blocks.map(b => (
        <div key={b.id}>{renderBlock(b)}</div>
      ))}
      <div className="pb-8" />
      <div className="h-2" style={{ background: '#3632b7' }} />
    </div>
  )
}
