import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/pdf/[classId] — generates a PDF of the class lexicon
// Uses the browser to print the /class/[classId]/home page
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params
  const admin = createServiceRoleClient()

  // Verify class is published
  const { data: classData } = await admin
    .from('classes')
    .select('id, name, status')
    .eq('id', classId)
    .single()

  if (!classData || classData.status !== 'published') {
    return NextResponse.json({ error: 'Класът не е публикуван.' }, { status: 403 })
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const targetUrl = `${baseUrl}/class/${classId}/home`

    let browser
    let chromium

    if (process.env.NODE_ENV === 'production') {
      // Vercel / serverless environment
      chromium = (await import('@sparticuz/chromium-min')).default
      const puppeteer = await import('puppeteer-core')
      browser = await puppeteer.default.launch({
        args: chromium.args,
        defaultViewport: { width: 1280, height: 900 },
        executablePath: await chromium.executablePath(
          'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
        ),
        headless: true,
      })
    } else {
      // Local development — use system Chrome
      const puppeteer = await import('puppeteer-core')
      const executablePath =
        process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : '/usr/bin/google-chrome'

      browser = await puppeteer.default.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }

    const page = await browser.newPage()
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' },
    })

    await browser.close()

    const filename = encodeURIComponent(classData.name) + '.pdf'
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/pdf]', err)
    return NextResponse.json({ error: 'PDF генерирането не успя.' }, { status: 500 })
  }
}
