import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      message_id,
      direction,
      sender_id,
      sender_name,
      recipient_id,
      message_text,
      translated_text,
      attachments,
      meta,
      created_at
    } = body || {}

    if (!direction || !sender_id || !recipient_id) {
      return NextResponse.json({ ok: false, error: 'missing required fields: direction, sender_id, recipient_id' }, { status: 400 })
    }

    // Normalize values
    const dir = String(direction)
    const sid = sender_id === null ? null : Number(sender_id)
    const rid = recipient_id === null ? null : Number(recipient_id)
    const msgId = message_id ? Number(message_id) : null
    const sname = sender_name ? String(sender_name) : null
    const text = message_text ? String(message_text) : null
    const trans = translated_text ? String(translated_text) : null
    const atts = attachments ? JSON.stringify(attachments) : null
    const metaJson = meta ? JSON.stringify(meta) : null

    const created = created_at ? String(created_at) : undefined

    const sql = `
      INSERT INTO chat_log (message_id, direction, sender_id, sender_name, recipient_id, message_text, translated_text, attachments, meta, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
    `

    const params = [msgId, dir, sid, sname, rid, text, trans, atts, metaJson, created]

    const res = await query(sql, params)

    return NextResponse.json({ ok: true, insertId: res?.insertId || null })
  } catch (err: any) {
    console.error('chat log insert error', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
