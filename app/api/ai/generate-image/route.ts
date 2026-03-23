import { NextRequest, NextResponse } from 'next/server'

// POST /api/ai/generate-image — sends approved prompt to DALL-E 3, stores result in Cloudinary
// Called after moderator approves the prompt during finalization
export async function POST(request: NextRequest) {
  console.log('[POST /api/ai/generate-image] start')
  // TODO: call DALL-E 3, upload result to Cloudinary, save URL to classes.superhero_image_url
  console.log('[POST /api/ai/generate-image] end')
  return NextResponse.json({ imageUrl: '' })
}
