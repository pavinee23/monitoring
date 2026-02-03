"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

type Supplier = {
  supplier_id: number | string
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  created_at?: string
}

export default function Page() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectMode, setSelectMode] = useState(false)
  const [returnUrl, setReturnUrl] = useState<string | null>(null)

  async function load(q?: string) {
    try {
      setLoading(true)
      setError(null)
      const url = q && q.length > 0 ? `/api/suppliers?q=${encodeURIComponent(q)}` : '/api/suppliers'
      const res = await fetch(url)
      const j = await res.json()
      if (!res.ok || !j.success) {
        setError(j.error || 'Failed to load')
        setSuppliers([])
      } else {
        setSuppliers(j.suppliers || [])
      }
    } catch (err: any) {
      setError(String(err))
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    try {
      const u = new URL(window.location.href)
      const s = u.searchParams.get('select')
      const r = u.searchParams.get('returnUrl') || u.searchParams.get('return')
      if (s === '1' || s === 'true') setSelectMode(true)
      if (r) setReturnUrl(decodeURIComponent(r))
    } catch (err) {
      // ignore
    }
  }, [])

  function handleSelect(s: Supplier) {
    if (!selectMode) return
    try {
      if (window.opener && typeof window.opener.postMessage === 'function') {
        window.opener.postMessage({ type: 'k_system_customer_selected', customer: s }, '*')
        window.close()
        return
      }
    } catch (e) {}

    if (returnUrl) {
      const sep = returnUrl.includes('?') ? '&' : '?'
      window.location.href = `${returnUrl}${sep}cusID=${s.supplier_id}`
      return
    }

    try {
      // store using the customer key so existing pickup logic reuses it
      const obj: any = { cusID: s.supplier_id, fullname: s.name, email: s.email || '', phone: s.phone || '', address: s.address || '', id: s.supplier_id }
      sessionStorage.setItem('k_system_selected_customer', JSON.stringify(obj))
      alert('Supplier selected — return to the previous page to pick it up.')
      history.back()
    } catch (e) {}
  }

  return (
    <AdminLayout title="Suppliers" titleTh="ซัพพลายเออร์">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Suppliers</h2>
          <p className={styles.cardSubtitle}>Manage supplier records</p>
        </div>

        <div className={styles.cardBody}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input
              placeholder="Search by name, company, email or phone"
              value={q}
              onChange={e => setQ(e.target.value)}
              className={styles.formInput}
              style={{ width: 420 }}
            />
            <button onClick={() => load(q)} className={styles.btnOutline}>{loading ? 'Loading...' : 'Search'}</button>
            <Link href="/Thailand/Admin-Login/supplier-add"><button className={`${styles.btn} ${styles.btnPrimary}`}>Add Supplier</button></Link>
          </div>

          {loading && <div>Loading…</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.supplier_id} onClick={() => handleSelect(s)} style={{ cursor: selectMode ? 'pointer' : 'auto' }}>
                    <td style={{ fontWeight: 600 }}>{s.supplier_id}</td>
                    <td>{s.name}</td>
                    <td>{s.company || '-'}</td>
                    <td>{s.email || '-'}</td>
                    <td>{s.phone || '-'}</td>
                    <td style={{ maxWidth: 240 }}>{s.address || '-'}</td>
                  </tr>
                ))}
                {suppliers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#999' }}>No suppliers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
