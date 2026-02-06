import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const file = url.pathname.split('/').pop() || ''
    // sanitize
    const safe = file.replace(/[^a-zA-Z0-9._-]/g, '')
    const appRoot = path.resolve(process.cwd())
    // path inside app/public
    const p = path.join(appRoot, 'app', 'public', safe)
    if (!fs.existsSync(p)) {
      return new Response('Not found', { status: 404 })
    }
    const stat = fs.statSync(p)
    const stream = fs.createReadStream(p)
    const headers = new Headers()
    headers.set('Content-Length', String(stat.size))
    // basic content-type detection
    if (safe.match(/\.(jpg|jpeg)$/i)) headers.set('Content-Type', 'image/jpeg')
    else if (safe.match(/\.png$/i)) headers.set('Content-Type', 'image/png')
    else if (safe.match(/\.gif$/i)) headers.set('Content-Type', 'image/gif')
    else headers.set('Content-Type', 'application/octet-stream')

    return new Response(stream, { headers })
  } catch (err: any) {
    return new Response(String(err || 'error'), { status: 500 })
  }
}
