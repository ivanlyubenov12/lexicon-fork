export const dynamic = 'force-dynamic'

import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'

// ─── Card accent styles per showcase position ─────────────────────────────────

const CARD_STYLES = [
  {
    accent:   'bg-[#3632b7]',
    iconBg:   'bg-[#e2dfff]',
    iconText: 'text-[#3632b7]',
    yearBg:   'bg-[#3632b7]/10 text-[#3632b7]',
    countText:'text-[#3632b7]',
    arrowText:'text-[#3632b7]',
    icon:     'school',
  },
  {
    accent:   'bg-[#855300]',
    iconBg:   'bg-[#ffddb8]',
    iconText: 'text-[#855300]',
    yearBg:   'bg-[#855300]/10 text-[#855300]',
    countText:'text-[#855300]',
    arrowText:'text-[#855300]',
    icon:     'palette',
  },
  {
    accent:   'bg-[#ba1a1a]',
    iconBg:   'bg-[#ffdad6]',
    iconText: 'text-[#ba1a1a]',
    yearBg:   'bg-[#ba1a1a]/10 text-[#ba1a1a]',
    countText:'text-[#ba1a1a]',
    arrowText:'text-[#ba1a1a]',
    icon:     'calculate',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ShowcasePage() {
  noStore()
  const admin = createServiceRoleClient()

  // Fetch showcase classes ordered by position, fallback to 3 latest published
  let { data: classes } = await admin
    .from('classes')
    .select('id, name, school_year, superhero_prompt, school_logo_url, showcase_order')
    .eq('status', 'published')
    .not('showcase_order', 'is', null)
    .order('showcase_order', { ascending: true })

  if (!classes || classes.length === 0) {
    const fallback = await admin
      .from('classes')
      .select('id, name, school_year, superhero_prompt, school_logo_url')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3)
    classes = (fallback.data ?? []).map(c => ({ ...c, showcase_order: null }))
  }

  // Fetch student counts
  const classIds = (classes ?? []).map(c => c.id)
  const studentCountMap: Record<string, number> = {}
  if (classIds.length > 0) {
    const { data: students } = await admin
      .from('students')
      .select('class_id')
      .in('class_id', classIds)
    for (const s of students ?? []) {
      studentCountMap[s.class_id] = (studentCountMap[s.class_id] ?? 0) + 1
    }
  }

  const classList = classes ?? []

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', color: '#1a1c1c' }}>

      <main className="pt-8 pb-24 px-6 md:px-12 max-w-7xl mx-auto">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="mb-20 text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1 rounded-full bg-[#ffddb8] text-[#2a1700] text-xs font-bold tracking-widest mb-6 uppercase">
            Примери
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1c1c] leading-tight mb-6"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Ето как изглежда готовият лексикон
          </h2>
          <p className="text-lg text-[#464555]/80">
            Изберете клас и разгледайте живия пример.
          </p>
        </section>

        {/* ── Three-panel Selector ────────────────────────────────────────── */}
        {classList.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {classList.map((cls, i) => {
              const style = CARD_STYLES[i % CARD_STYLES.length]
              const [namePart, schoolPart] = cls.name.includes(' — ')
                ? cls.name.split(' — ')
                : [cls.name, null]
              const count = studentCountMap[cls.id] ?? 0
              const teaser = cls.superhero_prompt
                ? `„${cls.superhero_prompt.slice(0, 90)}${cls.superhero_prompt.length > 90 ? '…' : ''}"`
                : '„Разгледайте профилите на децата и техните истории."'

              return (
                <Link
                  key={cls.id}
                  href={`/lexicon/${cls.id}`}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col transform hover:-translate-y-2"
                >
                  {/* Colored left accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.accent}`} />

                  <div className="p-8 flex flex-col h-full">
                    {/* Icon + year */}
                    <div className="flex justify-between items-start mb-8">
                      <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center ${style.iconText}`}>
                        <span className="material-symbols-outlined">{style.icon}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${style.yearBg}`}>
                        {cls.school_year}
                      </span>
                    </div>

                    {/* Class name + teaser */}
                    <div className="mb-auto">
                      <h3 className="text-2xl font-bold text-[#1a1c1c] mb-1" style={{ fontFamily: 'Noto Serif, serif' }}>
                        {namePart}
                      </h3>
                      {schoolPart && (
                        <p className="text-[#464555] text-sm mb-4">{schoolPart}</p>
                      )}
                      <p className="text-[#464555]/70 text-sm leading-relaxed italic" style={{ fontFamily: 'Noto Serif, serif' }}>
                        {teaser}
                      </p>
                    </div>

                    {/* Footer row */}
                    <div className="mt-8 flex items-center justify-between border-t border-[#f4f3f2] pt-4">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${style.countText}`}>group</span>
                        <span className={`text-xs font-bold ${style.countText}`}>{count} деца</span>
                      </div>
                      <span className={`material-symbols-outlined ${style.arrowText} group-hover:translate-x-1 transition-transform`}>
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </section>
        ) : (
          <section className="mb-24">
            <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
              <span className="material-symbols-outlined text-5xl text-gray-200 block mb-4">menu_book</span>
              <p className="text-gray-500 font-medium">Все още няма избрани showcase класове.</p>
              <p className="text-gray-400 text-sm mt-1">
                Изберете класове от <Link href="/admin/classes" className="text-[#3632b7] underline">Admin → Класове</Link>.
              </p>
            </div>
          </section>
        )}

        {/* ── What's inside strip ─────────────────────────────────────────── */}
        <section className="mb-32 py-4">
          <h4 className="text-center text-xs uppercase tracking-[0.3em] text-[#464555]/50 mb-10 font-semibold">
            Какво включва всеки лексикон
          </h4>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: 'person',            label: 'Профил на всяко дете' },
              { icon: 'mail',              label: 'Послания от съучениците' },
              { icon: 'record_voice_over', label: 'Гласът на класа' },
              { icon: 'auto_awesome',      label: 'AI супергерой' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-[#f4f3f2] px-6 py-3 rounded-full hover:bg-[#e9e8e7] transition-colors"
              >
                <span className="material-symbols-outlined text-[#3632b7]">{icon}</span>
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-[#f4f3f2] rounded-[2rem] p-12 md:p-20 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3632b7]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#855300]/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3
              className="text-3xl md:text-4xl font-bold text-[#1a1c1c] mb-4"
              style={{ fontFamily: 'Noto Serif, serif' }}
            >
              Готови за вашия клас?
            </h3>
            <p className="text-[#464555] mb-10 max-w-md mx-auto">
              Регистрацията е безплатна. 69.99 EUR при публикуване.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-[#3632b7] text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-xl"
            >
              Създай лексикона на класа
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </section>

      </main>

    </div>
  )
}
