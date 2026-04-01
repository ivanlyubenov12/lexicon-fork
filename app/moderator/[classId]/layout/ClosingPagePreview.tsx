'use client'

import type { Block, LayoutAssets } from '@/lib/templates/types'
import type { LexiconData } from '@/app/lexicon/[classId]/LexiconBlocks'

export default function ClosingPagePreview({ blocks, assets, lexiconData }: { blocks: Block[]; assets: LayoutAssets; lexiconData: LexiconData }) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <span className="material-symbols-outlined text-4xl">menu_book</span>
        <p>Добавете блокове за задната корица</p>
      </div>
    )
  }

  const hasLogo     = blocks.some(b => b.type === 'closing_logo')
  const hasTitle    = blocks.some(b => b.type === 'closing_title')
  const hasYear     = blocks.some(b => b.type === 'closing_year')
  const hasQuote    = blocks.some(b => b.type === 'closing_quote')
  const hasCount    = blocks.some(b => b.type === 'closing_student_count')
  const hasColophon = blocks.some(b => b.type === 'closing_colophon')
  const quoteText   = (blocks.find(b => b.type === 'closing_quote')?.config as Record<string, unknown>)?.text as string | undefined
  const memberCount = lexiconData.studentList?.length ?? 0

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: '#12082e' }}>
      <div className="h-2" style={{ background: '#3632b7' }} />

      <div className="flex flex-col items-center justify-center px-10 py-16 gap-6 min-h-[480px]">
        {hasLogo && (
          assets.schoolLogoUrl
            ? <img src={assets.schoolLogoUrl} alt="Лого" className="w-20 h-20 object-contain rounded-full bg-white/10 p-1.5" />
            : <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white/30" style={{ fontSize: 36 }}>school</span>
              </div>
        )}

        {hasTitle && (
          <p className="text-3xl font-bold text-white text-center" style={{ fontFamily: 'Noto Serif, serif' }}>
            {lexiconData.namePart ?? 'Клас / Група'}
          </p>
        )}

        {hasYear && (
          <p className="text-lg font-bold" style={{ color: '#3632b7' }}>
            {lexiconData.classData?.name?.split(' — ')[1] ?? '2024/2025'}
          </p>
        )}

        {hasCount && memberCount > 0 && (
          <p className="text-sm text-white/40 text-center max-w-sm">
            Тази книга пази спомените на {memberCount} {lexiconData.memberLabel ?? 'ученика'}
          </p>
        )}

        {hasQuote && (
          <p className="text-base italic text-white/30 text-center max-w-md" style={{ fontFamily: 'Noto Serif, serif' }}>
            „{quoteText || 'Цитат...'}"
          </p>
        )}

        {hasColophon && (
          <p className="text-xs text-white/15 text-center mt-4">© mini-memories.com</p>
        )}
      </div>

      <div className="h-2" style={{ background: '#3632b7' }} />
    </div>
  )
}
