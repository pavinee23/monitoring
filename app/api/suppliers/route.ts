import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

// GET - list or get supplier by id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const id = searchParams.get('id')

    const conn = await pool.getConnection()
    try {
      if (id) {
        const [rows]: any = await conn.query(
          `SELECT supplier_id, name, company, email, phone, address, expected_delivery, notes, is_active, created_at FROM suppliers WHERE supplier_id = ?`,
          [id]
        )
        if (!rows || rows.length === 0) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 })
        return NextResponse.json({ success: true, supplier: rows[0] })
      }

      if (!q || q.length < 1) {
        const [rows]: any = await conn.query(
          `SELECT supplier_id, name, company, email, phone, address, expected_delivery, notes, is_active, created_at FROM suppliers ORDER BY name ASC LIMIT 200`
        )
        return NextResponse.json({ success: true, suppliers: rows })
      }

      const search = `%${q}%`
      const [rows]: any = await conn.query(
        `SELECT supplier_id, name, company, email, phone, address, expected_delivery, notes, is_active, created_at FROM suppliers WHERE name LIKE ? OR company LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY name ASC LIMIT 100`,
        [search, search, search, search]
      )
      return NextResponse.json({ success: true, suppliers: rows })
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error('suppliers GET error', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

// POST - create supplier
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, company, email, phone, address, expected_delivery } = body
    if (!name) return NextResponse.json({ success: false, error: 'name_required' }, { status: 400 })

    const conn = await pool.getConnection()
    try {
      const createdBy = (body && (body.created_by || body.createdBy)) || 'system'
      let supplierIdField: any = body && body.supplier_id ? body.supplier_id : null
      // If supplier_id is non-numeric (e.g. SUP-260127-3571), the existing DB may have
      // supplier_id as an INT column. Avoid inserting a non-integer into that column.
      // Treat non-numeric codes as `supplier_code` and insert NULL into supplier_id.
      let supplierCode: string | null = null
      if (supplierIdField) {
        const s = String(supplierIdField)
        if (!/^\d+$/.test(s)) {
          supplierCode = s
          supplierIdField = null
        } else {
          supplierIdField = Number(s)
        }
      }
      const notes = body && body.notes ? body.notes : null
      const isActive = body && (body.is_active === 0 || body.is_active === 1) ? body.is_active : 1

      const [result]: any = await conn.query(
        `INSERT INTO suppliers (supplier_id, name, company, email, phone, address, expected_delivery, notes, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [supplierIdField, name, company || null, email || null, phone || null, address || null, expected_delivery || null, notes, isActive, createdBy]
      )
      const insertId = result.insertId

      // Try to fetch the inserted supplier. If caller supplied a supplier_id code use that,
      // otherwise fall back to the auto-increment `id` returned by insertId.
      let supplierRow: any = null
      if (supplierIdField) {
        const [rowsByCode]: any = await conn.query(
          `SELECT supplier_id, name, company, email, phone, address, expected_delivery, notes, is_active, created_at FROM suppliers WHERE supplier_id = ? LIMIT 1`,
          [supplierIdField]
        )
        if (rowsByCode && rowsByCode.length) supplierRow = rowsByCode[0]
      }

      if (!supplierRow) {
        const [rowsById]: any = await conn.query(
          `SELECT supplier_id, name, company, email, phone, address, expected_delivery, notes, is_active, created_at FROM suppliers WHERE id = ? LIMIT 1`,
          [insertId]
        )
        if (rowsById && rowsById.length) supplierRow = rowsById[0]
      }

      const supplierId = supplierRow && supplierRow.supplier_id ? supplierRow.supplier_id : insertId
      const resp: any = { success: true, supplierId, supplier: supplierRow }
      if (supplierCode) resp.supplierCode = supplierCode
      return NextResponse.json(resp)
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error('suppliers POST error', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
