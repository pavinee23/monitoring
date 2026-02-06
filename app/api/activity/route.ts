import { NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const conn = await pool.getConnection()
    try {
      // Get recent activities from multiple tables
      const sql = `
        SELECT 'order' AS type, orderNo AS title, created_at AS ts, orderID AS ref_id
        FROM purchase_orders
        UNION ALL
        SELECT 'customer' AS type, fullname AS title, created_at AS ts, cusID AS ref_id
        FROM cus_detail
        UNION ALL
        SELECT 'invoice' AS type, invNo AS title, created_at AS ts, invID AS ref_id
        FROM invoices
        ORDER BY ts DESC
        LIMIT 20
      `

      const [rows]: any = await conn.query(sql)

      const activities = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        type: r.type,
        title: r.title,
        ts: r.ts,
        ref_id: r.ref_id
      }))

      return NextResponse.json({
        success: true,
        activities
      })
    } finally {
      conn.release()
    }
  } catch (err: any) {
    console.error('Failed to fetch activities:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err),
      activities: [] // Return empty array so UI doesn't break
    }, { status: 500 })
  }
}
