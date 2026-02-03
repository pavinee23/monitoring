import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

async function ensureUploadsDir() {
  const uploads = path.join(process.cwd(), 'public', 'uploads')
  try {
    await fs.promises.mkdir(uploads, { recursive: true })
  } catch (e) {
    // ignore
  }
  return uploads
}

export async function POST(req: Request) {
  try {
    const uploads = await ensureUploadsDir()
    const form = await req.formData()
    const entries: Array<any> = []

    for (const [key, val] of form.entries()) {
      if (val instanceof File) {
        const filename = `${Date.now()}-${val.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const filePath = path.join(uploads, filename)
        const buffer = Buffer.from(await val.arrayBuffer())
        await fs.promises.writeFile(filePath, buffer)
        const urlPath = `/uploads/${filename}`
        entries.push({ field: key, name: val.name, size: val.size, type: val.type, url: urlPath })
      }
    }

    return NextResponse.json({ ok: true, files: entries })
  } catch (err: any) {
    console.error('upload failed', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
