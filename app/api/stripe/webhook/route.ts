import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendLexiconPublishedEmail } from '@/lib/resend'
import type { Plan } from '@/lib/stripe'

export const runtime = 'nodejs'

// Must read raw body for Stripe signature verification
export async function POST(request: NextRequest) {
  const payload   = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event
  try {
    event = verifyWebhook(payload, signature)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session  = event.data.object
  const classId  = session.metadata?.classId
  const plan     = session.metadata?.plan as Plan | undefined

  if (!classId || !plan) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  // Set plan + publish
  const { data: classData } = await admin
    .from('classes')
    .update({ plan, status: 'published', finalized_at: new Date().toISOString() })
    .eq('id', classId)
    .select('name')
    .single()

  // Send published notification to all parents
  if (classData?.name) {
    const { data: students } = await admin
      .from('students')
      .select('first_name, last_name, parent_email')
      .eq('class_id', classId)
      .not('parent_email', 'is', null)

    const recipients = (students ?? [])
      .filter(s => s.parent_email)
      .map(s => ({ email: s.parent_email!, studentName: `${s.first_name} ${s.last_name}` }))

    if (recipients.length > 0) {
      sendLexiconPublishedEmail(recipients, classId, classData.name).catch(() => {})
    }
  }

  return NextResponse.json({ received: true })
}
