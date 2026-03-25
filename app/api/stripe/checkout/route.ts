import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server'
import { createCheckoutSession, type Plan } from '@/lib/stripe'

// POST /api/stripe/checkout
// body: { classId: string, plan: 'basic' | 'premium' }
export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { classId, plan } = await request.json() as { classId: string; plan: Plan }
  if (!classId || !plan || !['basic', 'premium'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const admin = createServiceRoleClient()

  const { data: classData } = await admin
    .from('classes')
    .select('id, plan')
    .eq('id', classId)
    .eq('moderator_id', user.id)
    .single()

  if (!classData) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

  // Already on premium — no action needed
  if (classData.plan === 'premium') {
    return NextResponse.json({ error: 'Already on premium' }, { status: 400 })
  }

  // Upgrade: basic → premium (charge only the difference)
  const isUpgrade = classData.plan === 'basic' && plan === 'premium'

  const url = await createCheckoutSession(classId, user.email ?? '', plan, isUpgrade)
  return NextResponse.json({ url })
}
