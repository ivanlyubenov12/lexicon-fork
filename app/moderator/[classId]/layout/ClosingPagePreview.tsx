'use client'

import type { Block, LayoutAssets } from '@/lib/templates/types'
import type { LexiconData } from '@/app/lexicon/[classId]/LexiconBlocks'

export default function ClosingPagePreview({ blocks, assets, lexiconData, themeVars = {} }: { blocks: Block[]; assets: LayoutAssets; lexiconData: LexiconData; themeVars?: Record<string, string> }) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <span className="material-symbols-outlined text-4xl">menu_book</span>
        <p>Добавете блокове за задната корица</p>
      </div>
    )
  }

  const memberCount = lexiconData.studentList?.length ?? 0

  function renderBlock(block: Block) {
    const cfg = block.config as Record<string, unknown>
    switch (block.type) {
      case 'closing_logo': {
        const logoUrl = lexiconData.classData?.school_logo_url ?? assets.schoolLogoUrl ?? null
        return (
          <div className="flex justify-center py-4">
            {logoUrl
              ? <img src={logoUrl} alt="Лого" className="w-20 h-20 object-contain rounded-full bg-white/10 p-1.5" />
              : <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white/30" style={{ fontSize: 36 }}>school</span>
                </div>
            }
          </div>
        )
      }

      case 'closing_title':
        return (
          <div className="text-center px-10 py-3">
            <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Noto Serif, serif' }}>
              {lexiconData.namePart ?? 'Клас / Група'}
            </p>
          </div>
        )

      case 'closing_year':
        return (
          <div className="text-center py-2">
            <p className="text-lg font-bold" style={{ color: themeVars['--lex-primary'] ?? '#3632b7' }}>
              {lexiconData.classData?.school_year ?? '2024/2025'}
            </p>
          </div>
        )

      case 'closing_student_count':
        return memberCount > 0 ? (
          <div className="text-center px-10 py-2">
            <p className="text-sm text-white/40">
              Тази книга пази спомените на {memberCount} {lexiconData.memberLabel ?? 'ученика'}
            </p>
          </div>
        ) : null

      case 'closing_quote':
        return (
          <div className="text-center px-10 py-3">
            <p className="text-base italic text-white/30" style={{ fontFamily: 'Noto Serif, serif' }}>
              „{(cfg.text as string) || 'Цитат...'}"
            </p>
          </div>
        )

      case 'closing_colophon':
        return (
          <div className="text-center py-4">
            <p className="text-xs text-white/15">© mini-memories.com</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: themeVars['--lex-cover-bg'] ?? '#12082e' }}>
      <div className="h-2" style={{ background: themeVars['--lex-primary'] ?? '#3632b7' }} />
      <div className="py-8">
        {blocks.map(b => (
          <div key={b.id}>{renderBlock(b)}</div>
        ))}
      </div>
      <div className="h-2" style={{ background: themeVars['--lex-primary'] ?? '#3632b7' }} />
    </div>
  )
}
