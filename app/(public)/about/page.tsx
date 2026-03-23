// ─── Data ──────────────────────────────────────────────────────────────────

const team = [
  {
    name: 'Андрей Любенов',
    role: 'Основател',
    bio: 'Баща на момче в начален клас. Разбра, че снимките в телефона не са достатъчен спомен.',
  },
]

const values = [
  {
    icon: '💛',
    title: 'Детето в центъра',
    desc: 'Всеки инструмент, всяка функция е направена така, че детето да бъде видяно и чуто — не просто снимано.',
  },
  {
    icon: '🔒',
    title: 'Поверителност преди всичко',
    desc: 'Лексиконът е достъпен само от одобрените родители на класа. Нищо не е публично.',
  },
  {
    icon: '📱',
    title: 'Лесно за всеки',
    desc: 'Родителите попълват от телефона за под 10 минути. Без регистрации, без сложни форми.',
  },
  {
    icon: '🌱',
    title: 'Спомен, който расте',
    desc: 'След години детето ще може да чуе гласа си на 8 години. Това е подарък, който не избледнява.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-indigo-800/60 text-indigo-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            За нас
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Защо направихме<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">
              Един неразделен клас
            </span>
          </h1>
          <p className="text-indigo-200 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            Идеята се роди от едно просто наблюдение: краят на 4. клас е моментът,
            в който детските приятелства се разпръскват — и никой не го документира достатъчно добре.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="prose prose-gray max-w-none text-gray-600 text-base leading-relaxed space-y-5">
            <h2 className="text-2xl font-bold text-gray-900 not-prose">Историята</h2>
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
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Нашите ценности</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">Екипът</h2>
          <div className="flex flex-col items-center gap-4">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl mb-4">
                  👨‍💻
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-indigo-500 text-sm font-medium mb-2">{member.role}</p>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission statement */}
      <section className="bg-gradient-to-b from-indigo-950 to-indigo-900 py-20 sm:py-28 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-2xl sm:text-3xl font-bold leading-snug mb-6">
            Вярваме, че всяко дете заслужава да бъде запомнено<br />
            <span className="text-amber-300">точно такова, каквото е.</span>
          </p>
          <p className="text-indigo-300 text-lg">
            Не ретуширано, не стандартизирано — а живо, истинско и неповторимо.
          </p>
        </div>
      </section>
    </div>
  )
}
