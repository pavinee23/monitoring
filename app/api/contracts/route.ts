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
          'SELECT * FROM contracts WHERE contractID = ?',
          [parseInt(id)]
        )

        if (!rows || rows.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Contract not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: rows[0]
        })
      } else {
        const [rows]: any = await conn.query(
          `SELECT contractID, contractNo, customerName, contractDate, totalAmount, status, startDate, endDate, created_at, updated_at
           FROM contracts
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`,
          [limit, offset]
        )

        const [countResult]: any = await conn.query(
          'SELECT * FROM contracts'
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
    console.error('Failed to fetch contracts:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
