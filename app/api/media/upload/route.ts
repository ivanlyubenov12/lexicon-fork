import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_DIMENSION = 1920
const JPEG_QUALITY  = 85

// POST /api/media/upload — receives file, resizes if image, uploads to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Не е предоставен файл.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let buffer: any = Buffer.from(arrayBuffer)

    // Resize images — skip video/audio
    const mime = (file as File).type ?? ''
    if (mime.startsWith('image/')) {
      try {
        const img = sharp(buffer)
        const meta = await img.metadata()
        const { width = 0, height = 0 } = meta

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          buffer = await img
            .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY })
            .toBuffer()
        }
      } catch {
        // If sharp fails for any reason, upload the original
      }
    }

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
