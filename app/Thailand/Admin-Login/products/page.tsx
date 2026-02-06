"use client"

import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'
import { useRouter } from 'next/navigation'

export default function ProductsListPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'en'|'th'>(() => {
    try { const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang'); return l === 'th' ? 'th' : 'en' } catch { return 'en' }
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLang(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/products')
        const j = await res.json()
        if (mounted && j && j.success && Array.isArray(j.products)) setProducts(j.products)
      } catch (err) {
        console.error('Failed to load products', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const L = (en: string, th: string) => lang === 'th' ? th : en

  return (
    <AdminLayout title="Products" titleTh="รายการสินค้า">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{L('Products','รายการสินค้า')}</h2>
          <p className={styles.cardSubtitle}>{L('List of products in the system','รายการสินค้าที่มีในระบบ')}</p>
        </div>
        <div className={styles.cardBody}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div />
            <div>
              <button onClick={() => router.push('/Thailand/Admin-Login/product-add')} className={`${styles.btn} ${styles.btnPrimary}`}>
                + {L('Add Product','เพิ่มสินค้า')}
              </button>
            </div>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{L('SKU','รหัส')}</th>
                  <th>{L('Name','ชื่อ')}</th>
                  <th>{L('Category','หมวดหมู่')}</th>
                  <th style={{ textAlign: 'right' }}>{L('Price','ราคา')}</th>
                  <th style={{ textAlign: 'right' }}>{L('Stock','สต็อก')}</th>
                  <th style={{ width: 140 }}>{L('Actions','จัดการ')}</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 20, color: '#666' }}>{L('No products found','ไม่พบสินค้า')}</td></tr>
                )}
                {products.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.sku || '-'}</td>
                    <td>{p.name}</td>
                    <td>{p.category || '-'}</td>
                    <td style={{ textAlign: 'right' }}>{Number(p.price || 0).toFixed(2)} ฿</td>
                    <td style={{ textAlign: 'right' }}>{p.stock_qty ?? '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className={styles.btnOutline} onClick={() => { /* quick view placeholder */ alert(JSON.stringify(p, null, 2)) }}>
                          {L('View','ดู')}
                        </button>
                        <button className={styles.btnOutline} onClick={() => router.push('/Thailand/Admin-Login/product-add')}>{L('Edit','แก้ไข')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
