// Service: AI — Claude synthesis + DALL-E image generation
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Takes all ★ answers from children, returns one image prompt
export async function synthesizeSuperheroPrompt(answers: string[]): Promise<string> {
  // TODO: send answers to Claude, ask it to synthesize a vivid image prompt
  // Model: claude-sonnet-4-6
  return ''
}

// Takes approved prompt, calls DALL-E 3, returns image URL
export async function generateSuperheroImage(prompt: string): Promise<string> {
  // TODO: call OpenAI DALL-E 3 API, upload result to Cloudinary, return URL
  return ''
}
