import { NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const conn = await pool.getConnection()
    try {
      if (id) {
        const [rows]: any = await conn.query(
          'SELECT * FROM receipts WHERE receiptID = ?',
          [parseInt(id)]
        )

        if (!rows || rows.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Receipt not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: rows[0]
        })
      } else {
        const [rows]: any = await conn.query(
          `SELECT receiptID, receiptNo, customerName, receiptDate, amount, paymentMethod, status, created_at, updated_at
           FROM receipts
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
          [limit, offset]
        )

        const [countResult]: any = await conn.query(
          'SELECT * FROM receipts'
        )
        const total = countResult[0]?.total || 0

        return NextResponse.json({
          success: true,
          data: rows || [],
          pagination: {
            total: Number(total),
            limit,
            offset,
            hasMore: offset + limit < total
          }
        })
      }
    } finally {
      conn.release()
    }
  } catch (err: any) {
    console.error('Failed to fetch receipts:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
