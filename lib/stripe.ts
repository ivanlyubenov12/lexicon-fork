// Helper: Stripe payments
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(classId: string, moderatorEmail: string): Promise<string> {
  // TODO: create Stripe Checkout Session, return session.url
  return ''
}

export function verifyWebhook(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
