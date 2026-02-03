import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const prefix = searchParams.get('prefix') || 'POW-CA'

    const conn = await pool.getConnection()
    try {
      const today = new Date()
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
      const [countRes]: any = await conn.query(`SELECT COUNT(*) as cnt FROM power_calculations WHERE DATE(created_at) = CURDATE()`)
      const seq = (countRes && countRes[0] && countRes[0].cnt ? Number(countRes[0].cnt) : 0) + 1
      const formatted = `${prefix}-${dateStr}-${String(seq).padStart(4, '0')}`
      return NextResponse.json({ success: true, formatted, seq })
    } finally { conn.release() }
  } catch (err: any) {
    console.error('power-calcu-seq GET error', err)
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 })
  }
}
