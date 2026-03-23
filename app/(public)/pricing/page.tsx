import Link from 'next/link'

const included = [
  'Неограничен брой деца в класа',
  'Профил за всяко дете — текст, видео и глас',
  'Послания от съученици (модерирани)',
  'AI-генериран супергерой на класа',
  'Гласът на класа — анонимни въпроси',
  'По-добри заедно — колективни отговори',
  'Сваляне на PDF на лексикона',
  'Достъп само за родителите на класа',
  'Без абонамент — плащате веднъж',
  'Достъп завинаги',
]

const faqs = [
  {
    q: 'Кога плащам?',
    a: 'Регистрацията е безплатна. Плащате само когато сте готови да публикувате лексикона — преди да го видят родителите.',
  },
  {
    q: 'Какво се случва, ако не ми хареса?',
    a: 'Ако лексиконът не е публикуван и имате проблем, свържете се с нас — ще намерим решение.',
  },
  {
    q: 'Може ли да го ползват повече класове?',
    a: 'Всеки клас е отделен лексикон с отделно плащане от 19.99 EUR. Ако имате нужда от повече класове, пишете ни.',
  },
  {
    q: 'Какви начини на плащане се приемат?',
    a: 'Приемаме всички основни карти (Visa, Mastercard) чрез Stripe.',
  },
  {
    q: 'До кога е достъпен лексиконът?',
    a: 'Лексиконът е достъпен без ограничение — плащате веднъж и той остава онлайн.',
  },
]

export default function PricingPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-indigo-800/60 text-indigo-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Цени
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Просто и честно
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Един клас. Едно плащане. Спомен за цял живот.
          </p>
        </div>
      </section>

      {/* Pricing card */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border-2 border-indigo-600 shadow-xl overflow-hidden">
            {/* Card header */}
            <div className="bg-indigo-600 px-8 py-8 text-white text-center">
              <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-2">
                Един неразделен клас
              </p>
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-6xl font-black">19.99</span>
                <span className="text-2xl font-bold mb-2">EUR</span>
              </div>
              <p className="text-indigo-200 text-sm">еднократно · без абонамент</p>
            </div>

            {/* Included */}
            <div className="px-8 py-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Включва
              </p>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-indigo-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="mt-8 block w-full bg-indigo-600 text-white font-bold text-base text-center py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
              >
                Започни безплатно →
              </Link>
              <p className="text-gray-400 text-xs text-center mt-3">
                Регистрацията е безплатна — плащате само при публикуване
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Често задавани въпроси
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Готови ли сте?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Регистрацията отнема 2 минути. Плащате само когато лексиконът е готов.
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
