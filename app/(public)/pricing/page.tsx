import Link from 'next/link'

const tiers = [
  {
    name: 'Пробен',
    price: null,
    priceNote: 'Безплатно',
    desc: 'Регистрирайте се и попълнете лексикона без никакво плащане.',
    features: [
      'До 30 деца в класа',
      'Всички въпроси и профили',
      'Послания от съученици',
      'Преглед на лексикона',
    ],
    cta: 'Започни безплатно',
    ctaHref: '/register',
    featured: false,
  },
  {
    name: 'Един клас',
    price: '69.99',
    priceNote: 'EUR · еднократно',
    desc: 'Публикувайте завършения лексикон и го споделете с родителите.',
    features: [
      'Всичко от Пробен',
      'Публикуване за родителите',
      'AI-генериран супергерой',
      'Сваляне на PDF',
      'Достъп завинаги',
      'Без абонамент',
    ],
    cta: 'Създай лексикон →',
    ctaHref: '/register',
    featured: true,
  },
  {
    name: 'По заявка',
    price: null,
    priceNote: 'Свържете се',
    desc: 'За училища с много паралелки или специални изисквания.',
    features: [
      'Неограничени класове',
      'Персонализиран дизайн',
      'Приоритетна поддръжка',
      'Фактура за юридическо лице',
    ],
    cta: 'Пишете ни',
    ctaHref: '/contact',
    featured: false,
  },
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
    a: 'Всеки клас е отделен лексикон с отделно плащане от 69.99 EUR. Ако имате нужда от повече класове, пишете ни.',
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
            Един клас. Едно плащане. Спомен за цял живот.
          </p>
        </div>
      </section>

      {/* ── Pricing tiers ─────────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-3xl p-8 shadow-sm ${
                tier.featured
                  ? 'bg-indigo-700 text-white ring-2 ring-indigo-600 lg:scale-105'
                  : 'bg-white text-gray-900'
              }`}
            >
              <div className="mb-6">
                <p
                  className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                    tier.featured ? 'text-indigo-200' : 'text-indigo-500'
                  }`}
                >
                  {tier.name}
                </p>
                {tier.price ? (
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
                ) : (
                  <p
                    className={`text-3xl font-bold mb-1 ${tier.featured ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Noto Serif, serif' }}
                  >
                    {tier.priceNote}
                  </p>
                )}
                {tier.price && (
                  <p className={`text-xs ${tier.featured ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {tier.priceNote}
                  </p>
                )}
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
                      style={{ fontSize: 16 }}
                    >
                      check_circle
                    </span>
                    <span className={tier.featured ? 'text-indigo-100' : 'text-gray-700'}>
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
        <p className="text-center text-xs text-gray-400 mt-6">
          Регистрацията е безплатна — плащате само при публикуване
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
