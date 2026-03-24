import { LexiconHeaderNav, LexiconBottomNav } from './LexiconNav'

interface Props {
  classId: string
  logoUrl?: string | null
  children: React.ReactNode
}

export default function LexiconShell({ classId, logoUrl, children }: Props) {
  return (
    <div
      className="min-h-screen pb-32"
      style={{ fontFamily: 'Manrope, sans-serif', backgroundColor: '#faf9f8', color: '#1a1c1c' }}
    >
      {/* ── Sticky header ────────────────────────────────────────────── */}
      <header className="bg-[#faf9f8] flex flex-col items-center w-full pt-4 px-6 max-w-screen-xl mx-auto sticky top-0 z-40">
        <div className="flex items-center justify-between w-full pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#3632b7]/20 bg-[#e2dfff] flex items-center justify-center flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[#3632b7] text-xl">school</span>
              )}
            </div>
            <h1
              className="text-2xl italic text-[#3632b7]"
              style={{ fontFamily: 'Noto Serif, serif' }}
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
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 pb-8 pt-4 bg-[#faf9f8]/80 backdrop-blur-xl shadow-[0_-4px_40px_rgba(26,28,28,0.06)] rounded-t-[2rem]">
        <LexiconBottomNav classId={classId} />
      </footer>
    </div>
  )
}
