import { NextResponse } from 'next/server'
import bus from '../bus'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { senderId, recipientId, status } = body || {}
    if (!senderId || !recipientId || !status) {
      return NextResponse.json({ ok: false, error: 'missing senderId, recipientId or status' }, { status: 400 })
    }
    const ev = { type: 'typing', senderId, recipientId, status }
    try { bus.emit('message', ev) } catch (e) { console.error('bus emit failed', e) }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
