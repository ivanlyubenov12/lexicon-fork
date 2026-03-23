import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST /api/media/upload — receives file from browser, uploads to Cloudinary, returns secure URL
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Не е предоставен файл.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const url = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'lexicon' },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'))
          } else {
            resolve(result.secure_url)
          }
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error('[POST /api/media/upload] error:', err)
    return NextResponse.json({ error: 'Качването не успя. Опитайте отново.' }, { status: 500 })
  }
}
