import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const conn = await pool.getConnection()
  try {
    const queries = [
      'SELECT COUNT(*) AS cnt FROM purchase_orders',
      'SELECT COUNT(*) AS cnt FROM cus_detail',
      'SELECT COUNT(*) AS cnt FROM product_list',
      'SELECT COUNT(*) AS cnt FROM invoices'
    ]

    const results = await Promise.all(queries.map(q => conn.query(q).then((r:any)=>r[0][0].cnt).catch(err=>{
      // if table missing, return 0
      console.error('stats query error:', err && err.code)
      return 0
    })))

    const [orders, customers, products, invoices] = results
    return NextResponse.json({ success: true, stats: { orders, customers, products, invoices } })
  } catch (err) {
    console.error('stats GET error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  } finally {
    conn.release()
  }
}
