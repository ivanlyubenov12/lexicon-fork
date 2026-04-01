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

  const hasLogo = blocks.some(b => b.type === 'closing_logo')
  const hasTitle = blocks.some(b => b.type === 'closing_title')
  const hasYear = blocks.some(b => b.type === 'closing_year')
  const hasQuote = blocks.some(b => b.type === 'closing_quote')
  const hasCount = blocks.some(b => b.type === 'closing_student_count')
  const hasColophon = blocks.some(b => b.type === 'closing_colophon')
  const quoteText = (blocks.find(b => b.type === 'closing_quote')?.config as Record<string, unknown>)?.text as string | undefined
  const memberCount = lexiconData.studentList?.length ?? 0

  return (
    <div>
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#12082e', minHeight: 400 }}>
        <div className="h-2" style={{ background: '#3632b7' }} />

        <div className="flex flex-col items-center justify-center px-8 py-12 gap-4 min-h-[380px]">
          {hasLogo && (
            assets.schoolLogoUrl
              ? <img src={assets.schoolLogoUrl} alt="Лого" className="w-14 h-14 object-contain rounded-full bg-white/10 p-1" />
              : <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/40">school</span>
                </div>
          )}

          {hasTitle && (
            <p className="text-lg font-bold text-white text-center" style={{ fontFamily: 'Noto Serif, serif' }}>
              {lexiconData.namePart}
            </p>
          )}

          {hasYear && (
            <p className="text-sm font-bold" style={{ color: '#3632b7' }}>{lexiconData.classData?.name?.split(' — ')[1] ?? '2024/2025'}</p>
          )}

          {hasCount && memberCount > 0 && (
            <p className="text-xs text-white/50 text-center">
              Тази книга пази спомените на {memberCount} {lexiconData.memberLabel ?? 'ученика'}
            </p>
          )}

          {hasQuote && (
            <p className="text-xs italic text-white/40 text-center" style={{ fontFamily: 'Noto Serif, serif' }}>
              „{quoteText || 'Цитат...'}"
            </p>
          )}

          {hasColophon && (
            <p className="text-[10px] text-white/20 text-center mt-4">© mini-memories.com</p>
          )}
        </div>

        <div className="h-2" style={{ background: '#3632b7' }} />
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">Превю на задната корица</p>
    </div>
  )
}
