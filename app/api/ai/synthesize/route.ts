import { NextRequest, NextResponse } from 'next/server'

// POST /api/ai/synthesize — takes all ★ answers for a class, calls Claude to produce one image prompt
export async function POST(request: NextRequest) {
  console.log('[POST /api/ai/synthesize] start')
  // TODO: call lib/services/ai.ts → synthesizeSuperheroPrompt(answers)
  console.log('[POST /api/ai/synthesize] end')
  return NextResponse.json({ prompt: '' })
}
