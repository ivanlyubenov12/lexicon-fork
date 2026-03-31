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
    color: 'text-[#3632b7] bg-[#e2dfff]/40',
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
          <span className="inline-block bg-[#ffddb8] text-[#2a1700] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            За нас
          </span>
          <h1
            className="text-5xl sm:text-6xl font-bold text-[#3632b7] leading-tight mb-5"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Защо направихме<br />
            <em className="not-italic text-amber-500">Малки спомени</em>
          </h1>
          <p className="text-[#464555]/80 text-lg leading-relaxed max-w-xl mx-auto">
            Идеята се роди от едно просто наблюдение: затрупани сме със снимки от всякакви места. Но те се губят, изчезват, забравят. А е важно да документираме случките, пътя си и хората, които срещаме по него.

          </p>
        </div>
      </section>

      {/* ── Story ───────────────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-10 sm:p-14 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[#3632b7] mb-4">
              Историята
            </p>
            <h2
              className="text-3xl font-bold text-[#3632b7] mb-8"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Откъде всичко започна
            </h2>
            <div className="space-y-5 text-[#464555] text-base leading-relaxed">
              <p>
                Често гледаме назад и си спомняме хубавите моменти и хората, с които сме ги преживели. Спомените обаче избледняват, размиват се и променят усещанията ни за това какво е било и кога.
                Оказва се, че това е проблем на много хора, които искат "да върнат времето назад" и да преживеят момента отново.
              </p>
              <p>
                Малки спомени е точно това - дигитален лексикон, като онези от нашето детство. Страхотни парченца история, които могат да ни върнат назад и да преживеем моментите отново.
              </p>
              <p>
                И така - насладете му се. Дали ще го направите с групата от детската градина на детето, дали ще е подарък за края на учебната година - няма значение. Малки спомени са подходящи за запазване на всеки спомен, който искате да не изгубите.
              </p>
            </div>

            {/* Founder */}
            <div className="mt-10 pt-8 border-t border-[#eeeeed] flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#e2dfff] flex items-center justify-center text-[#3632b7] font-bold text-xl flex-shrink-0">
                А
              </div>
              <div>
                <p className="font-semibold text-[#1a1c1c]">Андрей Любенов</p>
                <p className="text-sm text-[#3632b7]">Основател</p>
                <p className="text-xs text-[#464555]/60 mt-0.5">
                  Баща на три деца с множество техни и свои разхвърляни снимки и спомени. </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#3632b7] mb-3">
              Принципи
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#3632b7]"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Нашите ценности
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-[#eeeeed] p-7 shadow-sm flex gap-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${v.color}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{v.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a1c1c] mb-1.5">{v.title}</h3>
                  <p className="text-[#464555]/80 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission quote ────────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#3632b7] rounded-[3rem] px-10 py-16 text-center text-white">
            <span className="material-symbols-outlined text-amber-400 text-4xl block mb-6">format_quote</span>
            <blockquote
              className="text-2xl sm:text-3xl font-bold leading-snug mb-5"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Вярваме, че всяко дете заслужава да бъде запомнено{' '}
              <em className="text-amber-300 not-italic">точно такова, каквото е.</em>
            </blockquote>
            <p className="text-[#a9a4ee] text-base">
              Не ретуширано, не стандартизирано — а живо, истинско и неповторимо.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
