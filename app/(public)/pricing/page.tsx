import Link from 'next/link'

const tiers = [
  {
    name: 'Basic',
    badge: 'Дигитален',
    price: '29.99',
    priceNote: 'EUR · еднократно',
    desc: 'Пълен дигитален лексикон, достъпен онлайн за целия клас.',
    features: [
      'Неограничен брой ученици',
      'Дигитален лексикон онлайн',
      'Профили с текст и аудио',
      'Послания между съученици',
      'AI Супергерой образ',
      'Модераторски панел',
      'Достъп завинаги',
    ],
    missing: ['Видео въпроси', 'PDF за сваляне'],
    cta: 'Започни с Basic →',
    ctaHref: '/register',
    featured: false,
  },
  {
    name: 'Premium',
    badge: 'Дигитален + PDF + Видео',
    price: '59.99',
    priceNote: 'EUR · еднократно',
    desc: 'Пълното изживяване — с видео спомени и PDF лексикон за печат.',
    features: [
      'Всичко от Basic',
      'Видео въпроси в анкетата',
      'PDF лексикон за сваляне',
      'Подходящ за печат',
    ],
    missing: [],
    cta: 'Започни с Premium →',
    ctaHref: '/register',
    featured: true,
  },
]

const faqs = [
  {
    q: 'Кога плащам?',
    a: 'Регистрацията е безплатна. Плащате само когато сте готови да публикувате лексикона — преди да го видят родителите.',
  },
  {
    q: 'Каква е разликата между Basic и Premium?',
    a: 'Basic включва пълен дигитален лексикон с текст и аудио (29.99 EUR). Premium добавя видео въпроси в анкетата и PDF лексикон за сваляне и печат (59.99 EUR).',
  },
  {
    q: 'Мога ли да надградя от Basic към Premium?',
    a: 'Да — доплащате само разликата от 30 EUR. Можете да надградите по всяко време след публикуване.',
  },
  {
    q: 'Може ли да го ползват повече класове?',
    a: 'Всеки клас е отделен лексикон с отделно плащане. Ако имате нужда от повече класове, пишете ни.',
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
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Цени
          </span>
          <h1
            className="text-5xl sm:text-6xl font-bold text-indigo-900 leading-tight mb-5"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Просто и честно
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Два плана. Едно плащане. Спомен за цял живот.
          </p>
        </div>
      </section>

      {/* ── Pricing tiers ─────────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-3xl p-8 shadow-sm relative ${
                tier.featured
                  ? 'bg-indigo-700 text-white ring-2 ring-indigo-600 lg:scale-105'
                  : 'bg-white text-gray-900'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                  Най-пълен
                </div>
              )}
              <div className="mb-6 pt-2">
                <p
                  className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                    tier.featured ? 'text-indigo-300' : 'text-indigo-400'
                  }`}
                >
                  {tier.badge}
                </p>
                <p
                  className={`text-2xl font-bold mb-4 ${tier.featured ? 'text-white' : 'text-gray-900'}`}
                  style={{ fontFamily: 'Noto Serif, serif' }}
                >
                  {tier.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span
                    className="text-5xl font-black"
                    style={{ fontFamily: 'Noto Serif, serif' }}
                  >
                    {tier.price}
                  </span>
                  <span className={`text-lg font-bold mb-1.5 ${tier.featured ? 'text-indigo-200' : 'text-gray-400'}`}>
                    EUR
                  </span>
                </div>
                <p className={`text-xs ${tier.featured ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {tier.priceNote}
                </p>
                <p className={`text-sm mt-3 leading-relaxed ${tier.featured ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {tier.desc}
                </p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={`material-symbols-outlined flex-shrink-0 mt-0.5 ${
                        tier.featured ? 'text-amber-300' : 'text-indigo-400'
                      }`}
                      style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className={tier.featured ? 'text-indigo-100' : 'text-gray-700'}>
                      {f}
                    </span>
                  </li>
                ))}
                {tier.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                    <span
                      className="material-symbols-outlined flex-shrink-0 mt-0.5"
                      style={{ fontSize: 16 }}
                    >
                      cancel
                    </span>
                    <span className={tier.featured ? 'text-indigo-200' : 'text-gray-500'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={`block text-center font-bold text-sm py-3.5 rounded-xl transition-all ${
                  tier.featured
                    ? 'bg-amber-400 text-gray-900 hover:bg-amber-300'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">
          Регистрацията е безплатна — плащате само при публикуване · Надграждане от Basic към Premium по всяко време (доплащате само 30 EUR)
        </p>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 text-center">
            Въпроси и отговори
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-indigo-900 text-center mb-12"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Често задавани въпроси
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] py-12 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#f4f3f2] rounded-[3rem] px-10 py-14 text-center">
            <span
              className="material-symbols-outlined text-amber-400 text-4xl block mb-4"
            >
              favorite
            </span>
            <h2
              className="text-3xl font-bold text-indigo-900 mb-4"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Готови ли сте?
            </h2>
            <p className="text-gray-500 text-base mb-8 leading-relaxed">
              Регистрацията отнема 2 минути.<br />Плащате само когато лексиконът е готов.
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
