'use client'

import type { Block, LayoutAssets } from '@/lib/templates/types'

export default function CoverPagePreview({ blocks, assets }: { blocks: Block[]; assets: LayoutAssets }) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <span className="material-symbols-outlined text-4xl">auto_stories</span>
        <p>Добавете блокове за корицата</p>
      </div>
    )
  }

  const hasPhoto    = blocks.some(b => b.type === 'cover_photo')
  const hasLogo     = blocks.some(b => b.type === 'cover_logo')
  const hasTitle    = blocks.some(b => b.type === 'cover_class_name')
  const hasYear     = blocks.some(b => b.type === 'cover_year')
  const hasTagline  = blocks.some(b => b.type === 'cover_tagline')
  const taglineText = (blocks.find(b => b.type === 'cover_tagline')?.config as Record<string, unknown>)?.text as string | undefined

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: '#12082e' }}>
      <div className="h-2" style={{ background: '#3632b7' }} />

      {/* Cover photo — full width, tall */}
      {hasPhoto && (
        assets.coverImageUrl
          ? <img src={assets.coverImageUrl} alt="Корица" className="w-full object-cover" style={{ maxHeight: 420 }} />
          : <div className="w-full flex items-center justify-center" style={{ height: 420, background: 'rgba(255,255,255,0.04)' }}>
              <span className="material-symbols-outlined text-white/10" style={{ fontSize: 80 }}>image</span>
            </div>
      )}

      <div className="flex flex-col items-center justify-center px-10 py-12 gap-5">
        {hasLogo && (
          assets.schoolLogoUrl
            ? <img src={assets.schoolLogoUrl} alt="Лого" className="w-20 h-20 object-contain rounded-full bg-white/10 p-1.5" />
            : <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white/30" style={{ fontSize: 36 }}>school</span>
              </div>
        )}

        {hasTagline && (
          <p className="text-base italic text-center" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Noto Serif, serif' }}>
            {taglineText || 'Малки спомени'}
          </p>
        )}

        {hasTitle && (
          <div className="text-center">
            <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Noto Serif, serif' }}>Клас / Група</p>
            <p className="text-base text-white/40 mt-1">Училище</p>
          </div>
        )}

        {hasYear && (
          <p className="text-lg font-bold" style={{ color: '#3632b7' }}>2024/2025</p>
        )}
      </div>

      <div className="h-2" style={{ background: '#3632b7' }} />
    </div>
  )
}
