import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

// Simple POST endpoint to insert supplier product minimal info
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, supplier_id, product_name, unit, price, currency } = body
    if (!product_name) return NextResponse.json({ success: false, error: 'product_name_required' }, { status: 400 })

    const conn = await pool.getConnection()
    try {
      const createdBy = (body && (body.created_by || body.createdBy)) || 'system'
      const [result]: any = await conn.query(
        `INSERT INTO supplier_products_minimal (id, supplier_id, product_name, unit, price, currency, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id || null, supplier_id || null, product_name, unit || null, price || 0, currency || 'THB', createdBy]
      )
      const insertId = result.insertId
      return NextResponse.json({ success: true, insertId })
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error('supplier-products POST error', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

// Optional: allow listing
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const supplierId = searchParams.get('supplier_id')
    const conn = await pool.getConnection()
    try {
      if (supplierId) {
        const [rows]: any = await conn.query(
          `SELECT id, supplier_id, product_name, unit, price, currency FROM supplier_products_minimal WHERE supplier_id = ? ORDER BY product_name LIMIT 500`,
          [supplierId]
        )
        return NextResponse.json({ success: true, products: rows })
      }
      const [rows]: any = await conn.query(`SELECT id, supplier_id, product_name, unit, price, currency FROM supplier_products_minimal ORDER BY product_name LIMIT 500`)
      return NextResponse.json({ success: true, products: rows })
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error('supplier-products GET error', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
