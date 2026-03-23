import { NextRequest, NextResponse } from 'next/server'

// POST /api/stripe/webhook — receives Stripe events
// On checkout.session.completed: update class status → published, send emails to all parents
export async function POST(request: NextRequest) {
  console.log('[POST /api/stripe/webhook] start')
  // TODO: verify Stripe signature, handle checkout.session.completed
  // call lib/services/classes.ts → publishClass(classId)
  // call lib/resend.ts → sendLexiconPublishedEmail(parents)
  console.log('[POST /api/stripe/webhook] end')
  return NextResponse.json({ received: true })
}
