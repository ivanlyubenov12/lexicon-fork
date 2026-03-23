import { NextRequest, NextResponse } from 'next/server'

// POST /api/stripe/checkout — creates a Stripe Checkout Session for a class
// Returns: { url } — redirect the moderator to Stripe-hosted checkout
export async function POST(request: NextRequest) {
  console.log('[POST /api/stripe/checkout] start')
  // TODO: call lib/stripe.ts → createCheckoutSession(classId)
  // Update class status → pending_payment
  console.log('[POST /api/stripe/checkout] end')
  return NextResponse.json({ url: '' })
}
