import { LexiconHeaderNav, LexiconBottomNav } from './LexiconNav'
import { themes, defaultTheme } from '@/lib/templates/themes'

interface Props {
  classId: string
  logoUrl?: string | null
  themeId?: string | null
  children: React.ReactNode
}

export default function LexiconShell({ classId, logoUrl, themeId, children }: Props) {
  const theme = (themeId && themes[themeId]) ? themes[themeId] : defaultTheme

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        fontFamily: 'Manrope, sans-serif',
        backgroundColor: 'var(--lex-bg)',
        color: 'var(--lex-text)',
        ...theme.vars,
      } as React.CSSProperties}
    >
      {/* ── Sticky header ────────────────────────────────────────────── */}
      <header
        className="flex flex-col items-center w-full pt-4 px-6 max-w-screen-xl mx-auto sticky top-0 z-40"
        style={{ backgroundColor: 'var(--lex-bg)' }}
      >
        <div className="flex items-center justify-between w-full pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ border: '2px solid color-mix(in srgb, var(--lex-primary) 20%, transparent)', backgroundColor: 'var(--lex-primary-light)' }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-xl" style={{ color: 'var(--lex-primary)' }}>school</span>
              )}
            </div>
            <h1
              className="text-2xl italic"
              style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}
            >
              Един неразделен клас
            </h1>
          </div>
        </div>
        <LexiconHeaderNav classId={classId} />
      </header>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-6 pt-8">
        {children}
      </main>

      {/* ── Fixed bottom navigation ──────────────────────────────────── */}
      <footer
        className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 pb-8 pt-4 rounded-t-[2rem]"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--lex-bg) 80%, transparent)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 40px rgba(26,28,28,0.06)',
        }}
      >
        <LexiconBottomNav classId={classId} />
      </footer>
    </div>
  )
}
