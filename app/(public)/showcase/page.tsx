import Link from 'next/link'

// ─── Mock data ──────────────────────────────────────────────────────────────

const mockStudents = [
  { name: 'Ива', initial: 'И', color: 'bg-pink-100 text-pink-500' },
  { name: 'Мартин', initial: 'М', color: 'bg-blue-100 text-blue-500' },
  { name: 'Радост', initial: 'Р', color: 'bg-amber-100 text-amber-500' },
  { name: 'Борис', initial: 'Б', color: 'bg-green-100 text-green-500' },
  { name: 'Симона', initial: 'С', color: 'bg-purple-100 text-purple-500' },
  { name: 'Алекс', initial: 'А', color: 'bg-indigo-100 text-indigo-500' },
]

const mockAnswers = [
  {
    question: 'Какво обичаш най-много в училище?',
    student: 'Ива',
    text: 'Обичам часовете по рисуване, защото тогава мога да правя каквото си искам и никой не ме поправя.',
  },
  {
    question: 'Какъв ще бъдеш като пораснеш?',
    student: 'Мартин',
    text: 'Ще съм пилот или може би ветеринар. Зависи дали ще ми харесат повече самолетите или кучетата.',
  },
  {
    question: 'Кое е най-доброто нещо в нашия клас?',
    student: 'Радост',
    text: 'Всички се смеем заедно дори когато нещо се обърка. Точно затова ни е хубаво.',
  },
]

const mockVoice = [
  { word: 'приятелство', count: 18, size: 'text-3xl font-black' },
  { word: 'смях', count: 15, size: 'text-2xl font-bold' },
  { word: 'футбол', count: 12, size: 'text-xl font-semibold' },
  { word: 'рисуване', count: 10, size: 'text-lg font-semibold' },
  { word: 'книги', count: 7, size: 'text-base font-medium' },
  { word: 'музика', count: 6, size: 'text-sm font-medium' },
  { word: 'природа', count: 5, size: 'text-sm' },
  { word: 'математика', count: 4, size: 'text-xs' },
]

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-indigo-800/60 text-indigo-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Пример
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Ето как изглежда<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">
              готовият лексикон
            </span>
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Разгледайте демо лексикон — точно така ще изглежда и вашият клас.
          </p>
        </div>
      </section>

      {/* Mock: Class home */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">Един неразделен клас</p>
            <h2 className="text-2xl font-extrabold text-gray-900">4Б клас · ОУ „Христо Ботев"</h2>
            <p className="text-sm text-gray-400 mt-1">Учебна година 2024/2025</p>
          </div>

          {/* Section nav cards */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { icon: '👦', label: 'Децата в класа', count: '22 деца' },
              { icon: '💬', label: 'Гласът на класа', count: null },
              { icon: '🌱', label: 'По-добри заедно', count: null },
              { icon: '🦸', label: 'Супергероят', count: null },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center"
              >
                <div className="text-4xl mb-2">{card.icon}</div>
                <p className="text-sm font-semibold text-gray-800">{card.label}</p>
                {card.count && <p className="text-xs text-gray-400 mt-1">{card.count}</p>}
              </div>
            ))}
          </div>

          {/* Student avatars */}
          <h3 className="text-lg font-bold text-gray-900 mb-5 text-center">Децата в класа</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {mockStudents.map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-full ${s.color} flex items-center justify-center text-xl font-bold`}>
                  {s.initial}
                </div>
                <p className="text-xs font-medium text-gray-700">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock: Student answers */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Профилите на децата</h2>
            <p className="text-sm text-gray-400 mt-1">Всяко дете отговаря на своите въпроси</p>
          </div>

          <div className="space-y-5">
            {mockAnswers.map((a, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">{a.question}</p>
                <p className="text-gray-800 text-sm leading-relaxed mb-3">{a.text}</p>
                <p className="text-xs text-gray-400 text-right">— {a.student}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock: Voice of the class */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Гласът на класа</h2>
            <p className="text-sm text-gray-400 mt-1">Думите, които децата споменават най-много</p>
          </div>

          <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-10 flex flex-wrap justify-center items-center gap-x-5 gap-y-4">
            {mockVoice.map((item) => (
              <span
                key={item.word}
                className={`${item.size} text-indigo-700 leading-none`}
                title={`×${item.count}`}
              >
                {item.word}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Mock: Superhero */}
      <section className="bg-gradient-to-b from-indigo-950 to-indigo-900 py-20 sm:py-28 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold mb-3">Супергероят на класа</h2>
          <p className="text-indigo-300 text-sm mb-8">Децата описват учителката — AI рисува образа</p>

          <div className="bg-indigo-800/40 border border-indigo-700/50 rounded-3xl p-8 mx-auto max-w-sm">
            <div className="w-48 h-48 rounded-2xl bg-indigo-700/50 flex items-center justify-center text-6xl mx-auto mb-5">
              🦸
            </div>
            <p className="text-indigo-200 text-sm italic leading-relaxed">
              „Жена с дълга кестенява коса и очи като морето. Носи синя наметка и държи книга в ръка.
              Около нея летят звезди."
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Готови за вашия клас?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Регистрацията е безплатна. 19.99 EUR при публикуване.
          </p>
          <Link
            href="/register"
            className="inline-block bg-amber-400 text-gray-900 font-bold text-base px-8 py-4 rounded-xl hover:bg-amber-300 transition-colors shadow-md"
          >
            Създай лексикона на класа →
          </Link>
        </div>
      </section>
    </div>
  )
}
