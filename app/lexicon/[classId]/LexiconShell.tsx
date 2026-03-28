import { LexiconHeaderNav, LexiconBottomNav } from './LexiconNav'
import { themes, defaultTheme } from '@/lib/templates/themes'
import LexiconDevPanel from './LexiconDevPanel'
import SchoolPattern from './SchoolPattern'
import KindergartenPattern from './KindergartenPattern'
import TeensPattern from './TeensPattern'

interface Props {
  classId: string
  logoUrl?: string | null
  themeId?: string | null
  basePath?: string
  children: React.ReactNode
}

export default function LexiconShell({ classId, logoUrl, themeId, basePath, children }: Props) {
  const theme = (themeId && themes[themeId]) ? themes[themeId] : defaultTheme

  const showSchoolPattern = !themeId || themeId === 'primary' || themeId === 'classic'
  const showKinderPattern = themeId === 'kindergarten'
  const showTeensPattern  = themeId === 'teens'

  return (
    <div
      className="min-h-screen pb-36 relative"
      style={{
        fontFamily: 'Manrope, sans-serif',
        backgroundColor: 'var(--lex-bg)',
        color: 'var(--lex-text)',
        ...theme.vars,
      } as React.CSSProperties}
    >
      {showSchoolPattern && <SchoolPattern />}
      {showKinderPattern && <KindergartenPattern />}
      {showTeensPattern  && <TeensPattern />}
      {/* ── Sticky header ────────────────────────────────────────────── */}
      <header
        className="flex flex-col items-center w-full pt-2 md:pt-4 px-4 md:px-6 max-w-screen-xl mx-auto sticky top-0 z-40 relative"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--lex-bg) 82%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as React.CSSProperties}
      >
        <div className="flex items-center justify-between w-full pb-1 md:pb-4">
          <div className="flex items-center gap-2 md:gap-3">
            {logoUrl ? (
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-surface-container-low">
                <img src={logoUrl} alt="" className="w-full h-full object-contain p-0.5" />
              </div>
            ) : (
              <span className="material-symbols-outlined text-base md:text-xl" style={{ color: 'var(--lex-primary)' }}>school</span>
            )}
            <h1
              className="text-base md:text-2xl italic"
              style={{ fontFamily: 'Noto Serif, serif', color: 'var(--lex-primary)' }}
            >
              {themeId === 'kindergarten' ? 'Нашата страхотна група' : 'Един неразделен клас'}
            </h1>
          </div>
        </div>
        <LexiconHeaderNav classId={classId} basePath={basePath} themeId={themeId} />
      </header>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-6 pt-8 relative z-10">
        {children}
      </main>

      {/* ── Dev panel — remove before going live ────────────────────── */}
      <LexiconDevPanel classId={classId} />

      {/* ── Fixed bottom navigation ──────────────────────────────────── */}
      <footer
        className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-5 pt-2"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--lex-bg) 88%, transparent)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 -1px 0 rgba(0,0,0,0.06)',
        }}
      >
        <LexiconBottomNav classId={classId} basePath={basePath} themeId={themeId} />
      </footer>
    </div>
  )
}
