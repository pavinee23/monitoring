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
        // Get specific purchase order
        const [rows]: any = await conn.query(
          'SELECT * FROM purchase_orders WHERE orderID = ?',
          [parseInt(id)]
        )

        if (!rows || rows.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Purchase order not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: rows[0]
        })
      } else {
        // Get all purchase orders with pagination
        const [rows]: any = await conn.query(
          `SELECT *
           FROM purchase_orders
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
          [limit, offset]
        )

        const [countResult]: any = await conn.query(
          'SELECT COUNT(*) as total FROM purchase_orders'
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
    console.error('Failed to fetch purchase orders:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
