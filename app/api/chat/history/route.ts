import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId') || ''
    const otherId = url.searchParams.get('otherId') || ''
    const limit = parseInt(url.searchParams.get('limit') || '100')
    if (!userId || !otherId) return NextResponse.json({ ok: false, error: 'missing params' }, { status: 400 })

    const sql = `SELECT id, senderId, senderName, recipientId, text, translated, attachments, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM chat_messages WHERE (senderId = ? AND recipientId = ?) OR (senderId = ? AND recipientId = ?) ORDER BY created_at ASC LIMIT ?`
    const params = [userId, otherId, otherId, userId, limit]
    const rows = await query(sql, params)

    const messages = (rows || []).map((r: any) => ({
      id: String(r.id),
      senderId: String(r.senderId),
      senderName: r.senderName,
      recipientId: String(r.recipientId),
      text: r.text,
      translated: r.translated,
      attachments: r.attachments ? JSON.parse(r.attachments) : null,
      created_at: r.created_at
    }))

    return NextResponse.json({ ok: true, messages })
  } catch (err: any) {
    console.error('history fetch failed', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
