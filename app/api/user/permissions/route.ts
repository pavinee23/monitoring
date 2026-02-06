import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/mysql-user'

export const runtime = 'nodejs'

// This endpoint allows any logged-in user to fetch permissions for their own typeID
export async function GET(req: NextRequest) {
  try {
    // Get typeID from query param or header
    const url = new URL(req.url)
    const typeIDParam = url.searchParams.get('typeID')
    const hdr = req.headers.get('x-user-type')

    let typeID: number | null = null

    if (typeIDParam) {
      typeID = parseInt(typeIDParam, 10)
    } else if (hdr) {
      try {
        const u = JSON.parse(hdr)
        typeID = u.typeID
      } catch (e) {}
    }

    if (!typeID || isNaN(typeID)) {
      return NextResponse.json({ ok: false, error: 'typeID required' }, { status: 400 })
    }

    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      // First check if extra_permissions column exists
      const [cols] = await conn.query(
        `SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'cus_type' AND column_name = 'extra_permissions'`
      ) as any[]
      const hasColumn = Number((cols && cols[0] && (cols[0].cnt || cols[0].CNT || cols[0].Cnt)) || 0) > 0

      if (!hasColumn) {
        // Column doesn't exist, return empty permissions (allow all)
        return NextResponse.json({ ok: true, permissions: { pages: {} } })
      }

      const [rows] = await conn.query(
        `SELECT extra_permissions FROM cus_type WHERE typeID = ?`,
        [typeID]
      ) as any[]

      if (rows && rows.length > 0) {
        const permissions = rows[0].extra_permissions || { pages: {} }
        return NextResponse.json({ ok: true, permissions })
      } else {
        return NextResponse.json({ ok: true, permissions: { pages: {} } })
      }
    } finally {
      conn.release()
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
