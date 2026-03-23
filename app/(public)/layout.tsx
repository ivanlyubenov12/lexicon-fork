import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight">
          Един неразделен клас
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/showcase" className="hover:text-gray-900 transition-colors">Примери</Link>
          <Link href="/pricing" className="hover:text-gray-900 transition-colors">Цени</Link>
          <Link href="/about" className="hover:text-gray-900 transition-colors">За нас</Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">Контакти</Link>
        </nav>
        <Link
          href="/register"
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Започни сега
        </Link>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-white font-semibold mb-2">Един неразделен клас</p>
            <p className="text-sm leading-relaxed">
              Дигитален спомен за всеки клас — текст, видео, глас.
            </p>
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-3">Продукт</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/showcase" className="hover:text-white transition-colors">Примери</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Цени</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-3">Компания</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">За нас</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Контакти</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-3">Акаунт</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Регистрация</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Вход</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-xs text-gray-600 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Един неразделен клас. Всички права запазени.</p>
          <p>Направено с любов за българските класни стаи 🇧🇬</p>
        </div>
      </div>
    </footer>
  )
}
