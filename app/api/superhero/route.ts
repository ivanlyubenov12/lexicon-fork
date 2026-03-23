import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// POST /api/superhero
// body: { action: 'generate-prompt', answers: string[] }
//    or { action: 'generate-image', prompt: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === 'generate-prompt') {
      const answers: string[] = body.answers ?? []

      if (answers.length === 0) {
        return NextResponse.json({ error: 'Няма отговори за обработка.' }, { status: 400 })
      }

      const answersText = answers.map((a, i) => `${i + 1}. ${a}`).join('\n')

      const message = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Ти си творчески асистент. Деца от начален клас са описали своята учителка като супергерой.
Ето техните отговори:

${answersText}

Синтезирай тези идеи в едно вдъхновяващо описание на супергерой за DALL-E.
Описанието трябва да е на английски, визуално и конкретно (стил на костюма, суперсили, атмосфера), около 2-3 изречения.
Пиши само описанието, без обяснения.`,
          },
        ],
      })

      const prompt = (message.content[0] as { type: string; text: string }).text.trim()
      return NextResponse.json({ prompt })
    }

    if (body.action === 'generate-image') {
      const prompt: string = body.prompt ?? ''

      if (!prompt) {
        return NextResponse.json({ error: 'Няма prompt за генериране.' }, { status: 400 })
      }

      const fullPrompt = `${prompt} Digital art illustration, vibrant colors, child-friendly superhero style, inspiring and warm.`

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      })

      const imageUrl = response.data?.[0]?.url
      if (!imageUrl) {
        return NextResponse.json({ error: 'Генерирането не успя.' }, { status: 500 })
      }

      return NextResponse.json({ imageUrl })
    }

    return NextResponse.json({ error: 'Невалидно действие.' }, { status: 400 })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Сървърна грешка.'
    console.error('[POST /api/superhero]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
