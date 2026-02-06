"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"

type Product = {
  id: number
  sku?: string
  name: string
  description?: string
  price?: number
  unit?: string
  category?: string
  stock_qty?: number
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load(q?: string) {
    try {
      setLoading(true)
      setError(null)
      const url = q && q.length > 0 ? `/api/products?q=${encodeURIComponent(q)}` : '/api/products'
      const res = await fetch(url)
      const j = await res.json()
      if (!res.ok || !j.success) {
        setError(j.error || 'Failed to load')
        setProducts([])
      } else {
        setProducts(j.products || [])
      }
    } catch (err: any) {
      setError(String(err))
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, Roboto, system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      <h1 style={{ marginBottom: 8, fontSize: 24, color: '#064e3b' }}>Products — List</h1>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          placeholder="Search by name or SKU"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') load(q) }}
          style={{ padding: '10px 12px', width: 360, borderRadius: 8, border: '1px solid #e6eef0', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
        />
        <button onClick={() => load(q)} style={{ marginLeft: 0, padding: '10px 14px', borderRadius: 8, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer' }}>Search</button>
        <Link href="/Thailand/Admin-Login/product-add"><button style={{ marginLeft: 8, padding: '10px 14px', borderRadius: 8, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', color: '#fff', border: 'none', cursor: 'pointer' }}>Add Product</button></Link>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 6px 20px rgba(2,6,23,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#065f46', color: '#fff' }}>
              <th style={{ padding: '12px 14px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px 14px', textAlign: 'left' }}>SKU</th>
              <th style={{ padding: '12px 14px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px 14px', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '12px 14px', textAlign: 'left' }}>Unit</th>
              <th style={{ padding: '12px 14px', textAlign: 'left' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'background .15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#eef2f3')} onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#ffffff' : '#f8fafc')}>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #eef2f7' }}>{p.id}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #eef2f7' }}>{p.sku || '-'}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #eef2f7' }}>{p.name}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #eef2f7' }}>{p.price != null ? Number(p.price).toFixed(2) : '-'}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #eef2f7' }}>{p.unit || '-'}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #eef2f7' }}>{p.stock_qty != null ? p.stock_qty : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
