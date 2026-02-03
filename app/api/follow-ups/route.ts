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
    const status = url.searchParams.get('status') // filter by status

    const conn = await pool.getConnection()
    try {
      if (id) {
        const [rows]: any = await conn.query(
          'SELECT * FROM follow_ups WHERE followUpID = ?',
          [parseInt(id)]
        )

        if (!rows || rows.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Follow-up not found'
          }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: rows[0]
        })
      } else {
        let sql = `SELECT followUpID, customerName, contactPerson, followUpDate, nextFollowUp, status, notes, created_at, updated_at
           FROM follow_ups`
        const params: any[] = []

        if (status) {
          sql += ` WHERE status = ?`
          params.push(status)
        }

        sql += ` ORDER BY nextFollowUp DESC, created_at DESC LIMIT ? OFFSET ?`
        params.push(limit, offset)

        const [rows]: any = await conn.query(sql, params)

        let countSql = 'SELECT * FROM follow_ups'
        const countParams: any[] = []
        if (status) {
          countSql += ' WHERE status = ?'
          countParams.push(status)
        }

        const [countResult]: any = await conn.query(countSql, countParams)
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
    console.error('Failed to fetch follow-ups:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
