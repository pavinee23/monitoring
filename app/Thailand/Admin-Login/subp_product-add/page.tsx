"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

export default function SubpProductAdd() {
  const router = useRouter()
  const [form, setForm] = useState({ supplier_id: '', product_name: '', unit: '', price: '', currency: 'THB' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success'|'error', text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    try {
      // pickup from sessionStorage (suppliers.list stores as k_system_selected_customer)
      const raw = sessionStorage.getItem('k_system_selected_customer')
      if (raw) {
        const s = JSON.parse(raw)
        const sid = s.cusID || s.id || s.supplier_id
        if (sid) setForm(prev => ({ ...prev, supplier_id: String(sid) }))
        sessionStorage.removeItem('k_system_selected_customer')
        return
      }
    } catch (e) {}

    try {
      const u = new URL(window.location.href)
      const cusID = u.searchParams.get('cusID')
      if (cusID) setForm(prev => ({ ...prev, supplier_id: cusID }))
    } catch (e) {}
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: any = {
        supplier_id: form.supplier_id || null,
        product_name: form.product_name || null,
        unit: form.unit || null,
        price: form.price ? Number(form.price) : 0,
        currency: form.currency || 'THB'
      }

      const res = await fetch('/api/supplier-products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json().catch(() => null)
      if (res.ok && j && j.success) {
        setMessage({ type: 'success', text: 'Saved supplier product successfully' })
        setForm({ id: '', supplier_id: '', product_name: '', unit: '', price: '', currency: 'THB' })
        setTimeout(() => router.push('/Thailand/Admin-Login/purchase-order'), 800)
      } else {
        setMessage({ type: 'error', text: (j && j.error) ? j.error : res.statusText || 'Save failed' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Add Supplier Product" titleTh="เพิ่มสินค้าจากซัพพลายเออร์">
      {message && (
        <div style={{ padding: 12, borderRadius: 8, marginBottom: 12, background: message.type === 'error' ? '#fee2e2' : '#ecfdf5', border: message.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>{message.text}</div>
            <button onClick={() => setMessage(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Close</button>
          </div>
        </div>
      )}

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Add Supplier Product</h2>
          <p className={styles.cardSubtitle}>Create a product entry provided by a supplier (id, supplier_id, product_name, unit, price, currency)</p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ maxWidth: 420 }}>
                <label className={styles.formLabel}>Supplier ID</label>
                <input name="supplier_id" value={form.supplier_id} onChange={handleChange} className={styles.formInput} placeholder="supplier_id" />
                <div style={{ marginTop: 8 }}>
                  <button type="button" onClick={() => {
                    const url = '/Thailand/Admin-Login/suppliers/list?select=1&returnUrl=' + encodeURIComponent('/Thailand/Admin-Login/subp_product-add')
                    window.location.href = url
                  }} className={styles.btnOutline}>Search Suppliers</button>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Product Name</label>
              <input name="product_name" value={form.product_name} onChange={handleChange} className={styles.formInput} required placeholder="Product name provided by supplier" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Unit</label>
                <input name="unit" value={form.unit} onChange={handleChange} className={styles.formInput} placeholder="Unit (e.g. ชิ้น)" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Price</label>
                <input name="price" value={form.price} onChange={handleChange} className={styles.formInput} placeholder="0.00" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className={styles.formSelect}>
                  <option value="THB">THB</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 18, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
              <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnPill}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => router.back()} className={`${styles.btn} ${styles.btnOutline} ${styles.btnPill}`}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
