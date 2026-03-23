// ─── Data ──────────────────────────────────────────────────────────────────

const values = [
  {
    icon: 'favorite',
    color: 'text-amber-500 bg-amber-50',
    title: 'Детето в центъра',
    desc: 'Всеки инструмент, всяка функция е направена така, че детето да бъде видяно и чуто — не просто снимано.',
  },
  {
    icon: 'lock',
    color: 'text-indigo-500 bg-indigo-50',
    title: 'Поверителност преди всичко',
    desc: 'Лексиконът е достъпен само от одобрените родители на класа. Нищо не е публично.',
  },
  {
    icon: 'phone_iphone',
    color: 'text-green-500 bg-green-50',
    title: 'Лесно за всеки',
    desc: 'Родителите попълват от телефона за под 10 минути. Без регистрации, без сложни форми.',
  },
  {
    icon: 'local_florist',
    color: 'text-rose-500 bg-rose-50',
    title: 'Спомен, който расте',
    desc: 'След години детето ще може да чуе гласа си на 8 години. Това е подарък, който не избледнява.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            За нас
          </span>
          <h1
            className="text-5xl sm:text-6xl font-bold text-indigo-900 leading-tight mb-5"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Защо направихме<br />
            <em className="not-italic text-amber-500">Един неразделен клас</em>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
            Идеята се роди от едно просто наблюдение: краят на 4. клас е моментът,
            в който детските приятелства се разпръскват — и никой не го документира достатъчно добре.
          </p>
        </div>
      </section>

      {/* ── Story ───────────────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-10 sm:p-14 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">
              Историята
            </p>
            <h2
              className="text-3xl font-bold text-indigo-900 mb-8"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Откъде всичко започна
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>
                Синът ми завърши 4. клас. Имахме снимки — стотици. Имахме спомени — размити.
                Но нямахме нищо, което да ни върне точно към онзи момент: как говореше, какво мечтаеше,
                как звучеше гласът му на 9 години.
              </p>
              <p>
                Разговарях с класния ръководител и с другите родители. Всички искаха същото.
                Никой не знаеше как да го направи по начин, по който да е лесно, красиво и на достъпна цена.
              </p>
              <p>
                Така се роди идеята за дигитален лексикон — не просто книга с снимки, а нещо живо:
                с гласове, видеа, рисунки и думи на самите деца. Нещо, което ще бъде пазено за цял живот.
              </p>
            </div>

            {/* Founder */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl flex-shrink-0">
                А
              </div>
              <div>
                <p className="font-semibold text-gray-900">Андрей Любенов</p>
                <p className="text-sm text-indigo-500">Основател</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Баща на момче в начален клас. Разбра, че снимките в телефона не са достатъчен спомен.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">
              Принципи
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-indigo-900"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Нашите ценности
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm flex gap-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${v.color}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{v.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission quote ────────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-indigo-700 rounded-[3rem] px-10 py-16 text-center text-white">
            <span className="material-symbols-outlined text-amber-400 text-4xl block mb-6">format_quote</span>
            <blockquote
              className="text-2xl sm:text-3xl font-bold leading-snug mb-5"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Вярваме, че всяко дете заслужава да бъде запомнено{' '}
              <em className="text-amber-300 not-italic">точно такова, каквото е.</em>
            </blockquote>
            <p className="text-indigo-300 text-base">
              Не ретуширано, не стандартизирано — а живо, истинско и неповторимо.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
