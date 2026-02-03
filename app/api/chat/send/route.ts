import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import bus from '../bus'

const LIBRE_URL = 'https://libretranslate.de'

async function translate(text: string, source: string, target: string) {
  const res = await fetch(`${LIBRE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source, target, format: 'text' }),
  })
  return res.json()
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { senderId, senderName, recipientId, text, attachments } = body
    if (!senderId || !recipientId) return NextResponse.json({ ok: false, error: 'missing senderId or recipientId' }, { status: 400 })

    // detect/translate server-side: translate to Korean
    let translated = null
    try {
      const t = await translate(text || '', 'auto', 'ko')
      translated = t?.translatedText || t?.translated || t?.result || ''
    } catch (e) {
      console.warn('translate failed', e)
    }

    const attachmentsJson = attachments ? JSON.stringify(attachments) : null

    const sql = `INSERT INTO chat_messages (senderId, senderName, recipientId, text, lang, translated, attachments) VALUES (?, ?, ?, ?, ?, ?, ?)`
    const params = [senderId, senderName || null, recipientId, text || null, null, translated, attachmentsJson]
    const r = await query(sql, params)
    const insertId = r?.insertId || null

    const message = {
      id: insertId,
      senderId,
      senderName,
      recipientId,
      text,
      translated,
      attachments: attachments || null,
      created_at: new Date().toISOString()
    }

    // insert into chat_log for audit/history (linked)
    try {
      const logSql = `
        INSERT INTO chat_log (message_id, direction, sender_id, sender_name, recipient_id, message_text, translated_text, attachments)
        VALUES (?, 'sent', ?, ?, ?, ?, ?, ?)
      `
      const logParams = [insertId, Number(senderId) || null, senderName || null, Number(recipientId) || null, text || null, translated || null, attachmentsJson]
      await query(logSql, logParams)
    } catch (logErr) {
      console.warn('failed to write chat_log:', logErr)
    }

    // insert message_status for recipient so UI can show awaiting reply
    try {
      const statusSql = `INSERT INTO message_status (message_id, user_id, status) VALUES (?, ?, 'sent')`
      await query(statusSql, [insertId, Number(recipientId) || null])
    } catch (statusErr) {
      console.warn('failed to write message_status:', statusErr)
    }

    // If this message is a reply from someone (senderId), mark any pending message_status rows for that sender as 'replied'
    try {
      const pending = await query(
        `SELECT ms.message_id AS mid, cm.senderId AS original_sender, cm.senderName AS original_sender_name
         FROM message_status ms
         JOIN chat_messages cm ON ms.message_id = cm.id
         WHERE ms.user_id = ? AND ms.status = 'sent'`,
        [Number(senderId) || null]
      ) as any[]

      if (Array.isArray(pending) && pending.length > 0) {
        const mids = pending.map(p => Number(p.mid)).filter(Boolean)
        // update status to replied
        await query(`UPDATE message_status SET status = 'replied', status_at = NOW() WHERE message_id IN (${mids.map(() => '?').join(',')})`, mids)

        // notify original senders that their messages got replied
        for (const p of pending) {
          const originalSender = p.original_sender
          const originalName = p.original_sender_name || null
          const ev = {
            type: 'replied',
            original_message_id: p.mid,
            replierId: senderId,
            replierName: senderName || null,
            target: originalSender,
            targetName: originalName,
            reply: { id: insertId, senderId, senderName, recipientId, text, translated, attachments: attachments || null, created_at: new Date().toISOString() }
          }
          try { bus.emit('message', ev) } catch (e) { console.warn('emit reply event failed', e) }
        }
      }
    } catch (errPending) {
      console.warn('failed processing pending message_status', errPending)
    }

    // broadcast to in-memory bus
    try { bus.emit('message', message) } catch (_) {}

    return NextResponse.json({ ok: true, message })
  } catch (err: any) {
    console.error('chat send failed', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
