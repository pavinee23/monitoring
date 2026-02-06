import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/mysql-user'

export const runtime = 'nodejs'

async function ensureColumn() {
  // create column if not exists (safe to run)
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    // Check information_schema for existing column, then add if missing (works on older MySQL)
    const [cols] = await conn.query(
      `SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'cus_type' AND column_name = 'extra_permissions'`
    ) as any[]
    const count = (cols && cols[0] && (cols[0].cnt || cols[0].CNT || cols[0].Cnt)) || 0
    if (Number(count) === 0) {
      await conn.query("ALTER TABLE cus_type ADD COLUMN extra_permissions JSON NULL")
    }
  } catch (err) {
    // ignore
  } finally {
    conn.release()
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureColumn()
    // verify caller is admin via short header set by admin UI
    try {
      const hdr = req.headers.get('x-admin-user')
      if (!hdr) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
      const u = JSON.parse(hdr)
      const strType = String(u.typeName || u.type || '').toLowerCase()
      const allowed = [1,2,7].includes(Number(u.typeID)) || strType.includes('admin')
      if (!allowed) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }
    const pool = getPool()
    const conn = await pool.getConnection()
    try {
        try {
          const [rows] = await conn.query(`SELECT typeID, TypeName, typeName, departmentName, extra_permissions FROM cus_type ORDER BY typeID ASC`)
          const types = (rows as any[]).map(r => ({ ...r, extra_permissions: r.extra_permissions || {} }))
          return NextResponse.json({ ok: true, types })
        } catch (innerErr: any) {
          // Fallback if column doesn't exist or is inaccessible
          const msg = String(innerErr && innerErr.message || innerErr)
          if (msg.includes('Unknown column') || msg.includes('doesn\'t exist')) {
            const [rows2] = await conn.query(`SELECT typeID, TypeName, typeName, departmentName FROM cus_type ORDER BY typeID ASC`)
            const types = (rows2 as any[]).map(r => ({ ...r, extra_permissions: {} }))
            return NextResponse.json({ ok: true, types })
          }
          throw innerErr
        }
    } finally { conn.release() }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // verify caller is admin via short header set by admin UI
    try {
      const hdr = req.headers.get('x-admin-user')
      if (!hdr) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
      const u = JSON.parse(hdr)
      const strType = String(u.typeName || u.type || '').toLowerCase()
      const allowed = [1,2,7].includes(Number(u.typeID)) || strType.includes('admin')
      if (!allowed) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { typeID, extra_permissions } = body || {}
    if (!typeID) return NextResponse.json({ ok: false, error: 'typeID required' }, { status: 400 })
    await ensureColumn()
    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      await conn.query(`UPDATE cus_type SET extra_permissions = ? WHERE typeID = ?`, [JSON.stringify(extra_permissions || {}), typeID])
      return NextResponse.json({ ok: true })
    } finally { conn.release() }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 500 })
  }
}
