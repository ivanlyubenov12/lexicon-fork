'use client'

import { useState } from 'react'

const info = [
  {
    icon: 'mail',
    label: 'Имейл',
    value: 'hello@lexikon.bg',
  },
  {
    icon: 'schedule',
    label: 'Работно време',
    value: 'Понеделник – Петък, 9:00 – 18:00',
  },
  {
    icon: 'bolt',
    label: 'Бърз отговор',
    value: 'Отговаряме в рамките на 24 часа',
  },
]

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f8] pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Контакти
          </span>
          <h1
            className="text-5xl sm:text-6xl font-bold text-indigo-900 leading-tight mb-5"
            style={{ fontFamily: 'Noto Serif, serif' }}
          >
            Свържете се с нас
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Имате въпрос? Искате демо за вашето училище?<br />
            Пишете ни — отговаряме в рамките на работния ден.
          </p>
        </div>
      </section>

      {/* ── Form + info ──────────────────────────────────────────────────── */}
      <section className="bg-[#f4f3f2] py-20 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8 items-start">

          {/* ── Left: info ── */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-6">
                Как да намерите помощ
              </p>
              <div className="space-y-5">
                {info.map((item) => (
                  <div key={item.label} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 18 }}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-700 rounded-3xl p-7 text-white">
              <span className="material-symbols-outlined text-amber-400 text-2xl block mb-3">
                school
              </span>
              <p className="font-semibold text-sm mb-2">Искате демо за класа?</p>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Ако сте класен ръководител или родителски актив, пишете ни и ще организираме
                кратка демонстрация специално за вашия клас.
              </p>
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-green-500 text-5xl mb-4">check_circle</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Съобщението е изпратено!</h3>
                <p className="text-gray-500 text-sm">Ще се свържем с вас в рамките на работния ден.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-6">
                  Изпратете съобщение
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Име</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-[#faf9f8]"
                      placeholder="Мария"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-[#faf9f8]"
                      placeholder="Иванова"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-[#faf9f8]"
                    placeholder="maria@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роля</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-[#faf9f8] text-gray-700">
                    <option>Родител</option>
                    <option>Учител / класен ръководител</option>
                    <option>Модератор / родителски актив</option>
                    <option>Друго</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Съобщение</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-[#faf9f8] resize-none"
                    placeholder="Как можем да помогнем?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-700 text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-indigo-800 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Изпращане…' : 'Изпрати съобщение →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
