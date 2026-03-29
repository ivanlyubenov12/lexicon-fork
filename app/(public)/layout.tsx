import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f8]" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <header className="w-full top-0 sticky z-50 bg-[#faf9f8]/90 backdrop-blur-md border-b border-[#eeeeed] transition-all duration-300">
      <nav className="flex justify-between items-center px-8 py-4 max-w-screen-xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold text-[#3632b7]"
          style={{ fontFamily: 'Noto Serif, serif' }}
        >
          Малки спомени
        </Link>

        <div className="hidden md:flex items-center space-x-10">
          <Link href="/how-it-works" className="text-[#464555] font-medium hover:text-[#3632b7] transition-colors text-sm">
            Как работи
          </Link>
          <Link href="/showcase" className="text-[#464555] font-medium hover:text-[#3632b7] transition-colors text-sm">
            Примери
          </Link>
          <Link href="/pricing" className="text-[#464555] font-medium hover:text-[#3632b7] transition-colors text-sm">
            Цени
          </Link>
          <Link href="/about" className="text-[#464555] font-medium hover:text-[#3632b7] transition-colors text-sm">
            За нас
          </Link>
          <Link href="/contact" className="text-[#464555] font-medium hover:text-[#3632b7] transition-colors text-sm">
            Контакти
          </Link>
        </div>

        <div className="flex items-center space-x-5">
          <Link
            href="/login"
            className="text-[#3632b7] font-semibold text-sm hover:text-[#1a1c1c] transition-colors"
          >
            Вход
          </Link>
          <Link
            href="/register"
            className="bg-[#3632b7] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#2c29a0] hover:scale-105 transition-all duration-200"
          >
            Създай лексикон
          </Link>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="w-full border-t border-[#eeeeed] bg-[#faf9f8]">
      <div className="max-w-7xl mx-auto py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start space-y-3">
          <div
            className="italic text-lg text-[#3632b7] font-bold"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Малки спомени.
          </div>
          <p className="text-xs uppercase tracking-widest text-[#464555]/50 text-center md:text-left">
            © {new Date().getFullYear()} Малки спомени. The Living Archive.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          <Link href="/how-it-works" className="text-xs uppercase tracking-widest text-[#464555]/50 hover:text-[#855300] transition-colors">Как работи</Link>
          <Link href="/about"        className="text-xs uppercase tracking-widest text-[#464555]/50 hover:text-[#855300] transition-colors">За нас</Link>
          <Link href="/pricing"      className="text-xs uppercase tracking-widest text-[#464555]/50 hover:text-[#855300] transition-colors">Цени</Link>
          <Link href="/showcase"     className="text-xs uppercase tracking-widest text-[#464555]/50 hover:text-[#855300] transition-colors">Примери</Link>
          <Link href="/contact"      className="text-xs uppercase tracking-widest text-[#464555]/50 hover:text-[#855300] transition-colors">Контакти</Link>
          <Link href="/register"     className="text-xs uppercase tracking-widest text-[#464555]/50 hover:text-[#855300] transition-colors">Регистрация</Link>
        </div>
      </div>
    </footer>
  )
}
