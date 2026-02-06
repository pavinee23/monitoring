import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const maxDuration = 10

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const limit = parseInt(url.searchParams.get('limit') || '100')

    // Basic search on username or name
    const sql = q
      ? `SELECT userId, userName, name, email FROM user_list WHERE userName LIKE ? OR name LIKE ? LIMIT ?`
      : `SELECT userId, userName, name, email FROM user_list LIMIT ?`

    const params = q ? [`%${q}%`, `%${q}%`, limit] : [limit]
    const users = await query(sql, params)

    return NextResponse.json({ ok: true, users })
  } catch (err: any) {
    console.error('Failed to fetch users:', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
