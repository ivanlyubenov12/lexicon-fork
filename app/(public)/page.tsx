import Link from 'next/link'

const testimonials = [
  {
    text: 'Когато отворихме лексикона заедно с дъщеря ми, тя видя видеото на съученичката си и се разплака от радост. Това е нещо, което ще пазим за цял живот.',
    author: 'Мария Кирилова',
    role: 'Майка на Ива, 3Б клас',
  },
  {
    text: 'Като класен ръководител бях скептична дали родителите ще намерят време. Но почти всички деца попълниха профилите! Резултатът е изумителен.',
    author: 'Елена Петрова',
    role: 'Учителка, ОУ „Христо Ботев"',
  },
  {
    text: 'Синът ми е срамежлив и рядко говори за чувствата си. В лексикона обаче намерих стихче, което беше написал за класа. Не знаех, че го е в него.',
    author: 'Димитър Стоянов',
    role: 'Баща на Мартин, 4А клас',
  },
  {
    text: 'Организирах лексикона за нашия 4Б. Процесът беше лесен — системата ми спести огромно количество работа. Препоръчвам на всеки родителски актив.',
    author: 'Радостина Михайлова',
    role: 'Модератор, 4Б клас',
  },
]

const steps = [
  {
    number: '01',
    title: 'Регистрираш класа',
    desc: 'Въвеждаш имената на децата. Системата изпраща покани до родителите автоматично.',
  },
  {
    number: '02',
    title: 'Децата попълват профилите',
    desc: 'Всяко дете отговаря на въпроси с текст, видео или глас — у дома, заедно с родителите.',
  },
  {
    number: '03',
    title: 'Одобряваш и публикуваш',
    desc: 'Преглеждаш отговорите, одобряваш и с един клик лексиконът е готов за целия клас.',
  },
]

export default function HomePage() {
  return (
    <div>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-[700px] lg:min-h-[800px] flex items-center overflow-hidden px-8 py-20 bg-[#faf9f8]">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Left */}
          <div className="lg:col-span-6 z-10 space-y-8">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest rounded-full">
              Дигиталната хроника на вашия клас
            </span>
            <h1
              className="text-5xl lg:text-7xl font-bold text-indigo-800 leading-tight"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Спомени, които не{' '}
              <br />
              <span className="italic text-amber-600">избледняват.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Традиционният училищен лексикон се преражда в модерна дигитална платформа.
              Съхранете гласовете, снимките и историите на своя клас в едно вечно, неразделено пространство.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-indigo-800 hover:scale-[1.02] transition-all duration-300"
              >
                Започнете архив
                <span className="material-symbols-outlined">auto_stories</span>
              </Link>
              <Link
                href="/showcase"
                className="inline-flex items-center justify-center bg-[#eeeeed] text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e3e2e1] transition-all duration-300"
              >
                Разгледайте демо
              </Link>
            </div>
            <p className="text-slate-400 text-sm">19.99 EUR · еднократно · без абонамент</p>
          </div>

          {/* Right — photo composition */}
          <div className="lg:col-span-6 relative pb-12 lg:pb-0 hidden lg:block">
            <div className="relative w-full aspect-[4/5] bg-[#f4f3f2] rounded-[2rem] overflow-hidden rotate-2 shadow-2xl">
              <img
                alt="Учебен коридор"
                className="w-full h-full object-cover"
                style={{ filter: 'grayscale(20%)' }}
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"
              />
            </div>
            {/* Polaroid overlay */}
            <div className="absolute bottom-4 -left-10 w-56 bg-white p-3 rounded-xl -rotate-6 shadow-xl z-20">
              <img
                alt="Деца заедно"
                className="w-full h-40 object-cover rounded-lg"
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80"
              />
              <p
                className="italic text-sm mt-2 text-amber-700"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                „Завинаги заедно..."
              </p>
            </div>
            {/* Video icon card */}
            <div className="absolute -top-8 -right-2 w-44 aspect-video bg-indigo-100 p-2 rounded-xl rotate-12 shadow-lg flex items-center justify-center">
              <span
                className="material-symbols-outlined text-indigo-500"
                style={{ fontSize: 48, fontVariationSettings: "'FILL' 1" }}
              >
                video_camera_back
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Features ─────────────────────────────────────────────── */}
      <section className="py-24 bg-[#f4f3f2] px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2
              className="text-4xl font-bold text-indigo-800"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Повече от просто албум
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Проектиран да улови духа на вашия клас чрез модерни технологии и дълбока емоционална връзка.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1 — wide */}
            <div className="md:col-span-7 bg-white p-10 rounded-3xl shadow-sm flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-4">
                <span className="material-symbols-outlined text-4xl text-amber-600">history_edu</span>
                <h3
                  className="text-2xl font-bold text-indigo-800"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  Дигитален Лексикон
                </h3>
                <p className="text-slate-500 leading-relaxed max-w-md">
                  Всеки ученик има свой профил с анкети, любими спомени и аудио записи, които съхраняват автентичния им глас през годините.
                </p>
              </div>
              <div className="mt-10 overflow-hidden rounded-2xl h-44 bg-[#f4f3f2] relative">
                <img
                  alt="Писане в тетрадка"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80"
                />
              </div>
            </div>

            {/* Card 2 — amber gradient */}
            <div className="md:col-span-5 bg-gradient-to-br from-amber-200 to-amber-300 p-10 rounded-3xl shadow-sm flex flex-col justify-center space-y-4 hover:scale-[1.01] transition-all duration-300">
              <span
                className="material-symbols-outlined text-4xl text-amber-900"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                volunteer_activism
              </span>
              <h3
                className="text-2xl font-bold text-amber-900"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                Послания между деца
              </h3>
              <p className="text-amber-800 leading-relaxed">
                Всяко дете пише нещо хубаво на своите съученици. Модераторът одобрява преди публикуване.
              </p>
              <div className="pt-2 flex -space-x-3">
                {['bg-indigo-200', 'bg-indigo-300', 'bg-indigo-400', 'bg-indigo-700'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-white ${c} flex items-center justify-center text-white text-xs font-bold`}>
                    {i === 3 ? '+' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 — indigo */}
            <div className="md:col-span-5 bg-indigo-700 text-white p-10 rounded-3xl shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 min-h-[280px]">
              <div className="space-y-4">
                <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
                <h3
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  Пълен Контрол
                </h3>
                <p className="text-indigo-200 leading-relaxed">
                  Модераторски панел за класния ръководител. Одобряване на всяко съдържание преди публикуване.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/10 p-4 rounded-xl mt-6">
                <span
                  className="material-symbols-outlined text-green-300"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="text-sm font-medium">Безопасно и затворено пространство</span>
              </div>
            </div>

            {/* Card 4 — wide with photo grid */}
            <div className="md:col-span-7 bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center overflow-hidden hover:-translate-y-1 transition-all duration-300">
              <div className="flex-1 space-y-4">
                <span className="material-symbols-outlined text-4xl text-indigo-600">photo_library</span>
                <h3
                  className="text-2xl font-bold text-indigo-800"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  AI Супергерой
                </h3>
                <p className="text-slate-500">
                  Децата описват учителката си като супергерой — AI рисува нейния образ и го вплита в лексикона.
                </p>
              </div>
              <div className="flex-shrink-0 w-48">
                <div className="grid grid-cols-2 gap-2 transform rotate-3 scale-90">
                  {[
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80',
                    'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=200&q=80',
                    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&q=80',
                    'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=200&q=80',
                  ].map((src, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-200">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold text-indigo-800 mb-4"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Как работи
            </h2>
            <p className="text-slate-500 text-lg">Три прости стъпки — без технически умения.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.number} className="relative">
                <span
                  className="text-7xl font-black text-indigo-50 leading-none block mb-4 select-none"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  {s.number}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-[#faf9f8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold text-indigo-800 mb-4"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Изберете вашия план
            </h2>
            <p
              className="text-slate-500 italic"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Инвестиция в спомените, които ще ви топлят след 20 години.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            {/* Free */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:scale-[1.01] transition-all">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Начален Клас</h3>
                <p className="text-slate-500 text-sm">За малки класове или начало на проекта.</p>
              </div>
              <div className="mb-8">
                <span
                  className="text-4xl font-bold text-indigo-700"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  0 лв.
                </span>
                <span className="text-slate-500"> /месец</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {['До 15 ученика', 'Дигитален лексикон (текст)', '1GB облачно пространство'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-green-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm text-slate-300 line-through">
                  <span className="material-symbols-outlined text-slate-300 text-lg">cancel</span>
                  Видео и аудио записи
                </li>
              </ul>
              <Link
                href="/register"
                className="w-full py-3 rounded-xl border-2 border-indigo-700 text-indigo-700 font-bold text-center hover:bg-indigo-50 transition-colors mt-auto"
              >
                Започнете безплатно
              </Link>
            </div>

            {/* Featured */}
            <div className="bg-indigo-700 text-white p-8 rounded-3xl shadow-2xl flex flex-col relative lg:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Най-популярно
              </div>
              <div className="mb-8 pt-2">
                <h3 className="text-xl font-bold mb-2">Неразделен Клас</h3>
                <p className="text-indigo-200 text-sm">Пълното изживяване за целия клас.</p>
              </div>
              <div className="mb-8">
                <span
                  className="text-4xl font-bold"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  19.99 EUR
                </span>
                <span className="text-indigo-300"> /еднократно</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  'Неограничен брой ученици',
                  'Видео & аудио съдържание',
                  '50GB облачно пространство',
                  'Модераторски панел',
                  'Послания между деца',
                  'AI Супергерой образ',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span
                      className="material-symbols-outlined text-amber-300 text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      stars
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="w-full py-4 rounded-xl bg-gradient-to-br from-amber-300 to-amber-400 text-amber-900 font-bold text-lg text-center shadow-lg hover:brightness-110 transition-all mt-auto"
              >
                Изберете за класа
              </Link>
            </div>

            {/* Print */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:scale-[1.01] transition-all">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Жив Архив</h3>
                <p className="text-slate-500 text-sm">За тези, които искат физическо копие на историята.</p>
              </div>
              <div className="mb-8">
                <span
                  className="text-4xl font-bold text-indigo-700"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  По заявка
                </span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  'Всичко от Неразделен Клас',
                  'Луксозен принтиран фотоалбум',
                  'Професионален дизайн',
                  'QR кодове към видео спомените',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-green-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="w-full py-3 rounded-xl border-2 border-indigo-700 text-indigo-700 font-bold text-center hover:bg-indigo-50 transition-colors mt-auto"
              >
                Свържете се с нас
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold text-indigo-800 mb-4"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Родители и учители говорят
            </h2>
            <p className="text-slate-500 text-lg">Реални истории от реални класове.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-[#faf9f8] border border-slate-100 rounded-2xl p-7">
                <p
                  className="text-slate-600 text-3xl mb-3 leading-none"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  "
                </p>
                <p
                  className="text-slate-700 leading-relaxed mb-5 italic"
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  {t.text}
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.author}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-[#faf9f8]">
        <div className="max-w-5xl mx-auto bg-[#f4f3f2] rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none">
            <span className="material-symbols-outlined" style={{ fontSize: 160 }}>favorite</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold text-indigo-800 max-w-2xl mx-auto leading-tight relative z-10"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Не позволявайте на времето да открадне{' '}
            <span className="italic text-amber-600">вашите моменти.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto relative z-10">
            Присъединете се към над 200 класа, които вече започнаха своя жив архив. Регистрацията е напълно безплатна.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2 relative z-10">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-indigo-800 hover:scale-105 transition-all duration-300"
            >
              Създай профил на класа
            </Link>
          </div>
          <p className="text-slate-400 text-sm relative z-10">19.99 EUR · еднократно · без абонамент</p>
        </div>
      </section>

    </div>
  )
}
