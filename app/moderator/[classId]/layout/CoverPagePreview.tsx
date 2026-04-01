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

  // Render a styled page-like preview
  const hasPhoto = blocks.some(b => b.type === 'cover_photo')
  const hasLogo = blocks.some(b => b.type === 'cover_logo')
  const hasTitle = blocks.some(b => b.type === 'cover_class_name')
  const hasYear = blocks.some(b => b.type === 'cover_year')
  const hasTagline = blocks.some(b => b.type === 'cover_tagline')
  const taglineText = (blocks.find(b => b.type === 'cover_tagline')?.config as Record<string, unknown>)?.text as string | undefined

  return (
    <div className="max-w-xs mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#12082e', minHeight: 400 }}>
        {/* top bar */}
        <div className="h-2" style={{ background: '#3632b7' }} />

        <div className="flex flex-col items-center justify-center px-8 py-12 gap-4 min-h-[380px]">
          {hasLogo && (
            assets.schoolLogoUrl
              ? <img src={assets.schoolLogoUrl} alt="Лого" className="w-14 h-14 object-contain rounded-full bg-white/10 p-1" />
              : <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/40">school</span>
                </div>
          )}

          {hasPhoto && (
            assets.coverImageUrl
              ? <img src={assets.coverImageUrl} alt="Корица" className="w-full rounded-xl object-cover" style={{ maxHeight: 160 }} />
              : <div className="w-full h-28 rounded-xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/20 text-4xl">image</span>
                </div>
          )}

          {hasTagline && (
            <p className="text-xs italic text-center" style={{ color: '#3632b7', fontFamily: 'Noto Serif, serif' }}>
              {taglineText || 'Малки спомени'}
            </p>
          )}

          {hasTitle && (
            <div className="text-center">
              <p className="text-lg font-bold text-white" style={{ fontFamily: 'Noto Serif, serif' }}>Клас / Група</p>
              <p className="text-xs text-white/40">Училище</p>
            </div>
          )}

          {hasYear && (
            <p className="text-sm font-bold" style={{ color: '#3632b7' }}>2024/2025</p>
          )}
        </div>

        {/* bottom bar */}
        <div className="h-2" style={{ background: '#3632b7' }} />
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">Превю на корицата</p>
    </div>
  )
}
