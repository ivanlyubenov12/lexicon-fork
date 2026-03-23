import Link from 'next/link'

// ─── Data ──────────────────────────────────────────────────────────────────

const schools = [
  'ОУ „Христо Ботев" — Пловдив',
  '5 ОУ „Братя Миладинови" — Варна',
  'ОУ „Кирил и Методий" — Sofia',
  '2 ОУ „Никола Вапцаров" — Бургас',
  'ОУ „Пенчо Славейков" — Русе',
  '10 ОУ „Алеко Константинов" — Стара Загора',
  'ОУ „Иван Вазов" — Плевен',
  '3 ОУ „Димитър Благоев" — Велико Търново',
]

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
    desc: 'Въвеждаш имената и имейлите на децата. Системата изпраща покани до родителите автоматично.',
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

const features = [
  { icon: '🎥', title: 'Видео и глас', desc: 'Детето разказва с думи, глас или видео — не само текст.' },
  { icon: '✉️', title: 'Послания от съученици', desc: 'Всеки пише нещо хубаво на всеки — модерирано от учителя.' },
  { icon: '🦸', title: 'AI супергерой', desc: 'Децата описват учителката, AI рисува образа й.' },
  { icon: '💬', title: 'Гласът на класа', desc: 'Анонимни въпроси показват колективната личност на класа.' },
  { icon: '📱', title: 'Mobile-first', desc: 'Родителите попълват от телефона за под 10 минути.' },
  { icon: '🔒', title: 'Само за класа', desc: 'Лексиконът е достъпен само за регистрираните родители.' },
]

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #818cf8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c084fc 0%, transparent 40%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-36 text-center">
          <span className="inline-block bg-indigo-800/60 text-indigo-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Дигитален лексикон за начален клас
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
            Спомен, който{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">
              говори
            </span>
            ,<br />смее се и пее
          </h1>
          <p className="text-indigo-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Дигиталният лексикон на класа, в който всяко дете разказва за себе си —
            с текст, видео и глас. Спомен за цял живот.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-amber-400 text-gray-900 font-bold text-base px-8 py-4 rounded-xl hover:bg-amber-300 transition-colors shadow-lg"
            >
              Създай лексикона на класа →
            </Link>
            <Link
              href="/showcase"
              className="border border-indigo-400 text-indigo-200 font-medium text-base px-8 py-4 rounded-xl hover:bg-indigo-800/40 transition-colors"
            >
              Виж пример
            </Link>
          </div>
          <p className="text-indigo-400 text-sm mt-6">19.99 EUR · еднократно · без абонамент</p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Как работи</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Три прости стъпки — без технически умения.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.number} className="relative">
                <span className="text-6xl font-black text-indigo-100 leading-none block mb-4">{s.number}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Какво включва лексиконът</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Много повече от снимка и текст.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools strip */}
      <section className="bg-white border-y border-gray-100 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Някои от училищата с неразделни класове
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {schools.map((school) => (
              <div key={school} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-xs flex-shrink-0">
                  🏫
                </div>
                <span className="text-sm text-gray-600 font-medium">{school}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-indigo-950 to-indigo-900 py-20 sm:py-28 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Родители и учители говорят</h2>
            <p className="text-indigo-300 text-lg max-w-xl mx-auto">Реални истории от реални класове.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-indigo-800/40 border border-indigo-700/50 rounded-2xl p-6">
                <div className="text-indigo-300 text-3xl mb-4">"</div>
                <p className="text-indigo-100 leading-relaxed mb-5 text-sm sm:text-base">{t.text}</p>
                <div>
                  <p className="font-semibold text-white text-sm">{t.author}</p>
                  <p className="text-indigo-400 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Готови ли сте да направите лексикона?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Регистрацията е безплатна. Плащате само когато лексиконът е готов.
          </p>
          <Link
            href="/register"
            className="inline-block bg-indigo-600 text-white font-bold text-base px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
          >
            Започни безплатно →
          </Link>
          <p className="text-gray-400 text-sm mt-4">19.99 EUR · еднократно · без абонамент</p>
        </div>
      </section>
    </div>
  )
}
