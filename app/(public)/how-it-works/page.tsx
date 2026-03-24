import Link from 'next/link'

// ─── Data ──────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    role: 'Модераторът',
    title: 'Регистрираш класа',
    desc: 'Един родител или учителят поема ролята на модератор. Регистрира се безплатно, въвежда имената на децата и задава въпросите, на които ще отговарят. Системата автоматично генерира уникални покани за всяко семейство.',
    icon: 'edit_note',
    color: 'bg-[#e2dfff] text-[#3632b7]',
    accent: '#3632b7',
  },
  {
    number: '02',
    role: 'Децата и родителите',
    title: 'Попълват профилите',
    desc: 'Всяко семейство получава личен линк. Детето отговаря на въпроси с текст, снима снимка, записва гласово или видео послание. Съучениците оставят пожелания едно за друго. Всичко — у дома, без акаунти.',
    icon: 'family_restroom',
    color: 'bg-[#ffddb8] text-[#855300]',
    accent: '#855300',
  },
  {
    number: '03',
    role: 'Модераторът',
    title: 'Преглежда и одобрява',
    desc: 'В личния панел модераторът вижда всички отговори и пожелания. Одобрява подходящото съдържание, може да добави снимки от класни мероприятия, бележки и спомени от годината.',
    icon: 'task_alt',
    color: 'bg-[#e2dfff] text-[#3632b7]',
    accent: '#3632b7',
  },
  {
    number: '04',
    role: 'Целият клас',
    title: 'Получава живия лексикон',
    desc: 'След еднократно плащане лексиконът се публикува. Всяко семейство получава личен линк — без регистрация, без реклами. Отваря се на телефон, таблет или компютър и остава достъпен завинаги.',
    icon: 'auto_stories',
    color: 'bg-[#ffddb8] text-[#855300]',
    accent: '#855300',
  },
]

const WHAT_IS = [
  {
    icon: 'person',
    title: 'Профил на всяко дете',
    desc: 'Снимка, отговори на лични въпроси, мечти, любими неща — разказана от самото дете.',
  },
  {
    icon: 'mail',
    title: 'Послания от съучениците',
    desc: 'Всяко дете получава лични пожелания от класа — одобрени и красиво наредени.',
  },
  {
    icon: 'record_voice_over',
    title: 'Гласът на класа',
    desc: 'Анонимни отговори на общи въпроси — визуализирани като облак от думи и графики.',
  },
  {
    icon: 'auto_awesome',
    title: 'AI супергерой',
    desc: 'Класът получава уникален AI образ — супергерой, роден от историите на всички деца.',
  },
  {
    icon: 'photo_library',
    title: 'Спомени от годината',
    desc: 'Снимки, бележки и истории от мероприятия — събрани в красива галерия от спомени.',
  },
  {
    icon: 'how_to_vote',
    title: 'Класни суперлативи',
    desc: 'Гласуване за „Най-голям шегаджия", „Звездата на класа" и още — само сред децата.',
  },
]

const PARENT_GETS = [
  {
    icon: 'link',
    title: 'Личен линк без регистрация',
    desc: 'Родителите получават директен линк — никакви акаунти, никакви пароли.',
  },
  {
    icon: 'smartphone',
    title: 'Работи на всяко устройство',
    desc: 'Телефон, таблет, компютър — лексиконът се отваря навсякъде.',
  },
  {
    icon: 'all_inclusive',
    title: 'Достъп завинаги',
    desc: 'Линкът не изтича. Лексиконът ще е там след 5, 10, 20 години.',
  },
  {
    icon: 'security',
    title: 'Без реклами, без трети страни',
    desc: 'Данните на децата не се споделят. Никакво проследяване, никакви реклами.',
  },
]

const FAQ = [
  {
    q: 'Кой може да бъде модератор?',
    a: 'Всеки родител от класа или класният ръководител. Не е нужен технически опит — системата води стъпка по стъпка.',
  },
  {
    q: 'Трябва ли родителите да се регистрират?',
    a: 'Не. Всяко семейство получава личен линк за попълване. Никакви акаунти, никакви пароли.',
  },
  {
    q: 'Колко струва?',
    a: 'Регистрацията и попълването са напълно безплатни. Плащате 69.99 EUR само при публикуване — еднократно, за целия клас.',
  },
  {
    q: 'Какво ако не всички деца попълнят профила си?',
    a: 'Лексиконът се публикува с попълненото. Непопълнените профили просто остават по-кратки. Дори 60% участие прави красив резултат.',
  },
  {
    q: 'На какъв език могат да отговарят децата?',
    a: 'На всеки — системата е езиково неутрална. Въпросите се задават от модератора, отговорите — свободни.',
  },
  {
    q: 'Може ли да добавям снимки след публикуването?',
    a: 'Лексиконът се финализира при публикуване. Затова препоръчваме модераторът да добави всички снимки от мероприятията преди публикуване.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', color: '#1a1c1c' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center max-w-3xl mx-auto">
        <span className="inline-block px-4 py-1 rounded-full bg-[#ffddb8] text-[#2a1700] text-xs font-bold tracking-widest mb-6 uppercase">
          Как работи
        </span>
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1c1c] leading-tight mb-6"
          style={{ fontFamily: 'Noto Serif, serif' }}
        >
          Живата история на вашия клас
        </h1>
        <p className="text-lg text-[#464555]/80 max-w-2xl mx-auto mb-10">
          Един неразделен клас е дигитален лексикон — персонален, богат и достъпен завинаги.
          Събира гласовете, лицата и историите на всяко дете в края на учебната година.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 border-2 border-[#3632b7] text-[#3632b7] px-7 py-3.5 rounded-xl font-bold hover:bg-[#3632b7] hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-xl">visibility</span>
            Виж пример
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#3632b7] text-white px-7 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            Започни безплатно
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ── What is it ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#f4f3f2]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#855300] mb-3 text-center">Какво включва</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-14"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Всичко в един лексикон
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHAT_IS.map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-7 flex flex-col gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#e2dfff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#3632b7] text-2xl">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1c1c] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#464555]/80 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#855300] mb-3 text-center">Процесът</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            4 стъпки от идея до лексикон
          </h2>
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="flex gap-6 md:gap-10 items-start bg-white rounded-2xl p-8 shadow-sm border border-[#f4f3f2]"
              >
                {/* Number + icon */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                  </div>
                  <span
                    className="text-4xl font-bold leading-none"
                    style={{ color: step.accent, opacity: 0.15, fontFamily: 'Noto Serif, serif' }}
                  >
                    {step.number}
                  </span>
                </div>
                {/* Text */}
                <div className="pt-1">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.accent }}>
                    {step.role}
                  </p>
                  <h3
                    className="text-xl font-bold text-[#1a1c1c] mb-2"
                    style={{ fontFamily: 'Noto Serif, serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[#464555]/80 leading-relaxed text-sm md:text-base">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Connector line hint */}
          <p className="text-center text-sm text-[#464555]/50 mt-10">
            Целият процес отнема около 2–3 седмици при средна класна активност.
          </p>
        </div>
      </section>

      {/* ── What parents get ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#f4f3f2]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#855300] mb-3 text-center">За родителите</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Какво получава всяко семейство
          </h2>
          <p className="text-center text-[#464555]/70 mb-14 max-w-xl mx-auto">
            Никакви приложения. Никакви акаунти. Просто линк, който работи.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PARENT_GETS.map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-7 flex gap-5 items-start shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-[#ffddb8] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#855300] text-xl">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1c1c] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#464555]/80 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visual timeline / quote strip ─────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="bg-[#3632b7] text-white rounded-[2rem] p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <span className="material-symbols-outlined text-5xl mb-6 block opacity-40">format_quote</span>
            <blockquote
              className="text-2xl md:text-3xl leading-relaxed mb-8"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              „Когато отворихме лексикона заедно с дъщеря ми, тя видя посланието на съученичката си и се разплака от радост. Това е нещо, което ще пазим за цял живот."
            </blockquote>
            <cite className="text-sm font-bold uppercase tracking-widest not-italic opacity-70">
              — Мария Кирилова, майка на Ива, 3Б клас
            </cite>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#f4f3f2]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#855300] mb-3 text-center">Въпроси</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-14"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Често задавани въпроси
          </h2>
          <div className="space-y-4">
            {FAQ.map(item => (
              <div key={item.q} className="bg-white rounded-2xl p-7 shadow-sm">
                <h3 className="font-bold text-[#1a1c1c] mb-2 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#3632b7] text-xl flex-shrink-0 mt-0.5">help</span>
                  {item.q}
                </h3>
                <p className="text-sm text-[#464555]/80 leading-relaxed pl-8">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#1a1c1c] mb-4"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Готови за вашия клас?
          </h2>
          <p className="text-[#464555] mb-10">
            Регистрацията е безплатна. Плащате само ако решите да публикувате.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/showcase"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#3632b7] text-[#3632b7] px-7 py-3.5 rounded-xl font-bold hover:bg-[#3632b7] hover:text-white transition-all"
            >
              Виж примери
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#3632b7] text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-xl"
            >
              Създай лексикона на класа
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
