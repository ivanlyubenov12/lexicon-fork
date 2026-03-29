import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const PLANS = {
  basic: {
    label: 'Дигитален лексикон',
    price: 29.99,
    cents: 2999,
    features: [
      'Дигитален лексикон онлайн',
      'Постоянен линк за споделяне',
      'Текстови и снимкови отговори',
    ],
  },
  premium: {
    label: 'Дигитален + PDF лексикон',
    price: 59.99,
    cents: 5999,
    features: [
      'Всичко от Дигитален',
      'Изтегляне на PDF',
      'Видео отговори',
    ],
  },
} as const

export type Plan = keyof typeof PLANS

export async function createCheckoutSession(
  classId: string,
  moderatorEmail: string,
  plan: Plan,
  isUpgrade = false
): Promise<string> {
  const cents = isUpgrade
    ? PLANS.premium.cents - PLANS.basic.cents  // 30.00 EUR upgrade fee
    : PLANS[plan].cents

  const label = isUpgrade
    ? `Надграждане към ${PLANS.premium.label}`
    : PLANS[plan].label

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'eur',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: cents,
          product_data: {
            name: label,
            description: 'Малки спомени — дигитален спомен на класа',
          },
        },
      },
    ],
    customer_email: moderatorEmail,
    metadata: { classId, plan },
    success_url: `${APP_URL}/moderator/${classId}/finalize?payment=success`,
    cancel_url:  `${APP_URL}/moderator/${classId}/finalize?payment=cancelled`,
  })

  return session.url ?? ''
}

export function verifyWebhook(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
