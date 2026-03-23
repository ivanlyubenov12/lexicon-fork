import Link from 'next/link'

// ─── Mock data ──────────────────────────────────────────────────────────────

const mockStudents = [
  { name: 'Ива', initial: 'И', color: 'bg-pink-100 text-pink-600' },
  { name: 'Мартин', initial: 'М', color: 'bg-blue-100 text-blue-600' },
  { name: 'Радост', initial: 'Р', color: 'bg-amber-100 text-amber-600' },
  { name: 'Борис', initial: 'Б', color: 'bg-green-100 text-green-600' },
  { name: 'Симона', initial: 'С', color: 'bg-purple-100 text-purple-600' },
  { name: 'Алекс', initial: 'А', color: 'bg-indigo-100 text-indigo-600' },
]

const mockAnswers = [
  {
    question: 'Какво обичаш най-много в училище?',
    student: 'Ива',
    initial: 'И',
    color: 'bg-pink-100 text-pink-600',
    text: 'Обичам часовете по рисуване, защото тогава мога да правя каквото си искам и никой не ме поправя.',
  },
  {
    question: 'Какъв ще бъдеш като пораснеш?',
    student: 'Мартин',
    initial: 'М',
    color: 'bg-blue-100 text-blue-600',
    text: 'Ще съм пилот или може би ветеринар. Зависи дали ще ми харесат повече самолетите или кучетата.',
  },
  {
    question: 'Кое е най-доброто нещо в нашия клас?',
    student: 'Радост',
    initial: 'Р',
    color: 'bg-amber-100 text-amber-600',
    text: 'Всички се смеем заедно дори когато нещо се обърка. Точно затова ни е хубаво.',
  },
]

const mockVoice = [
  { word: 'приятелство', size: 'text-3xl font-black' },
  { word: 'смях', size: 'text-2xl font-bold' },
  { word: 'футбол', size: 'text-xl font-semibold' },
  { word: 'рисуване', size: 'text-lg font-semibold' },
  { word: 'книги', size: 'text-base font-medium' },
  { word: 'музика', size: 'text-sm font-medium' },
  { word: 'природа', size: 'text-sm' },
  { word: 'математика', size: 'text-xs' },
]

const navCards = [
  { icon: 'group', label: 'Децата в класа', count: '22 деца', color: 'text-indigo-500 bg-indigo-50' },
  { icon: 'record_voice_over', label: 'Гласът на класа', count: null, color: 'text-amber-500 bg-amber-50' },
  { icon: 'diversity_3', label: 'По-добри заедно', count: null, color: 'text-green-500 bg-green-50' },
  { icon: 'auto_awesome', label: 'Супергероят', count: null, color: 'text-rose-500 bg-rose-50' },
]

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Примери
          </span>
          <h1
            className="text-5xl sm:text-6xl font-bold text-indigo-900 leading-tight mb-5"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Ето как изглежда{' '}
            <em className="not-italic text-amber-500">готовият лексикон</em>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Разгледайте демо лексикон — точно така ще изглежда и вашият клас.
          </p>
        </div>
      </section>

      {/* ── Mock: Class home ─────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">
                Един неразделен клас
              </p>
              <h2
                className="text-2xl font-bold text-indigo-900"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                4Б клас · ОУ „Христо Ботев"
              </h2>
              <p className="text-sm text-gray-400 mt-1">Учебна година 2024/2025</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {navCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-[#faf9f8] border border-gray-100 rounded-2xl p-5 text-center"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${card.color}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{card.icon}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{card.label}</p>
                  {card.count && <p className="text-xs text-gray-400 mt-1">{card.count}</p>}
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Децата в класа
              </p>
              <div className="grid grid-cols-6 gap-3">
                {mockStudents.map((s) => (
                  <div key={s.name} className="flex flex-col items-center gap-1.5">
                    <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center font-bold text-base`}>
                      {s.initial}
                    </div>
                    <p className="text-xs font-medium text-gray-600">{s.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mock: Student answers ─────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 text-center">
            Профили
          </p>
          <h2
            className="text-3xl font-bold text-indigo-900 text-center mb-10"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Профилите на децата
          </h2>

          <div className="space-y-4">
            {mockAnswers.map((a, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-3">
                  {a.question}
                </p>
                <p className="text-gray-700 text-sm leading-relaxed italic mb-4">
                  „{a.text}"
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${a.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {a.initial}
                  </div>
                  <span className="text-xs font-semibold text-gray-500">— {a.student}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mock: Voice of the class ─────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 text-center">
            Гласът на класа
          </p>
          <h2
            className="text-3xl font-bold text-indigo-900 text-center mb-10"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Думите, с които живеят
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
            {mockVoice.map((item) => (
              <span
                key={item.word}
                className={`${item.size} text-indigo-700 leading-none`}
              >
                {item.word}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mock: Superhero ──────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 text-center">
            AI функция
          </p>
          <h2
            className="text-3xl font-bold text-indigo-900 text-center mb-10"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Супергероят на класа
          </h2>

          <div className="bg-indigo-700 rounded-3xl p-10 text-white max-w-sm mx-auto text-center">
            <div className="w-48 h-48 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-indigo-300" style={{ fontSize: 80 }}>
                auto_awesome
              </span>
            </div>
            <p className="text-indigo-200 text-sm italic leading-relaxed">
              „Жена с дълга кестенява коса и очи като морето. Носи синя наметка и държи книга в ръка.
              Около нея летят звезди."
            </p>
            <p className="text-xs text-indigo-400 mt-3">— описание от децата в класа</p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-12 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#faf9f8] rounded-[3rem] px-10 py-14 text-center">
            <span className="material-symbols-outlined text-amber-400 text-4xl block mb-4">
              star
            </span>
            <h2
              className="text-3xl font-bold text-indigo-900 mb-4"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Готови за вашия клас?
            </h2>
            <p className="text-gray-500 text-base mb-8 leading-relaxed">
              Регистрацията е безплатна.<br />19.99 EUR при публикуване.
            </p>
            <Link
              href="/register"
              className="inline-block bg-indigo-700 text-white font-bold text-sm px-8 py-4 rounded-xl hover:bg-indigo-800 transition-colors shadow-md"
            >
              Създай лексикона на класа →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
