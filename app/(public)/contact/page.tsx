'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // Fire-and-forget — replace with actual email action when ready
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-indigo-800/60 text-indigo-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Контакти
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Свържете се с нас
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Имате въпрос? Искате демо за вашето училище? Пишете ни — отговаряме в рамките на работния ден.
          </p>
        </div>
      </section>

      {/* Form + info */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 gap-16 items-start">

          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Как да намерите помощ</h2>
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
                    ✉️
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Имейл</p>
                    <p className="text-gray-500 text-sm mt-0.5">hello@edin-nerazdelен-klas.bg</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
                    🕐
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Работно време</p>
                    <p className="text-gray-500 text-sm mt-0.5">Понеделник – Петък, 9:00 – 18:00</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Бърз отговор</p>
                    <p className="text-gray-500 text-sm mt-0.5">Отговаряме в рамките на 24 часа</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-5">
              <p className="text-indigo-900 font-semibold text-sm mb-1">Искате демо за класа?</p>
              <p className="text-indigo-700 text-sm leading-relaxed">
                Ако сте класен ръководител или родителски актив, пишете ни и ще организираме кратка демонстрация специално за вашия клас.
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-bold text-green-900 mb-2">Съобщението е изпратено!</h3>
                <p className="text-green-700 text-sm">Ще се свържем с вас в рамките на работния ден.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Име</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Мария"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Иванова"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="maria@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роля</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Как можем да помогнем?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
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
