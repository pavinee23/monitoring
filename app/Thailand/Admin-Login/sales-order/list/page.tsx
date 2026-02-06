"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

type SORecord = {
  orderID: number
  orderNo: string
  customer_name: string
  priceTotal: number
  status: string
  created_at: string
  delivery_date?: string
}

export default function SalesOrderListPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<SORecord[]>([])
  const [loading, setLoading] = useState(false)

  const [locale, setLocale] = useState<'en'|'th'>(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'th' ? 'th' : 'en'
    } catch { return 'en' }
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  const getAuthHeaders = () => {
    try {
      const t = localStorage.getItem('k_system_admin_token') || ''
      return t ? { Authorization: `Bearer ${t}` } : {}
    } catch {
      return {}
    }
  }

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sales-orders', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.orders)) {
        setOrders(j.orders)
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; bg: string }> = {
      pending: { label: L('Pending', 'รอดำเนินการ'), color: '#92400e', bg: '#fef3c7' },
      confirmed: { label: L('Confirmed', 'ยืนยันแล้ว'), color: '#1e40af', bg: '#dbeafe' },
      processing: { label: L('Processing', 'กำลังดำเนินการ'), color: '#6b21a8', bg: '#f3e8ff' },
      shipped: { label: L('Shipped', 'จัดส่งแล้ว'), color: '#0891b2', bg: '#cffafe' },
      delivered: { label: L('Delivered', 'ส่งถึงแล้ว'), color: '#166534', bg: '#dcfce7' },
      completed: { label: L('Completed', 'เสร็จสิ้น'), color: '#166534', bg: '#dcfce7' },
      cancelled: { label: L('Cancelled', 'ยกเลิก'), color: '#991b1b', bg: '#fee2e2' }
    }
    const b = badges[status] || { label: status, color: '#666', bg: '#f5f5f5' }
    return (
      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: b.color, background: b.bg }}>
        {b.label}
      </span>
    )
  }

  const fmtCurrency = (n: number) => n.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <AdminLayout title="Sales Orders" titleTh="รายการใบสั่งขาย">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {L('Sales Order List', 'รายการใบสั่งขาย')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('View and manage sales orders', 'ดูและจัดการใบสั่งขาย')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/Thailand/Admin-Login/sales-order')}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              + {L('Create New Order', 'สร้างใบสั่งขายใหม่')}
            </button>
            <button onClick={loadOrders} className={styles.btnOutline} disabled={loading}>
              {loading ? L('Loading...', 'กำลังโหลด...') : L('Refresh', 'รีเฟรช')}
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{L('Order No.', 'เลขที่')}</th>
                  <th>{L('Customer', 'ลูกค้า')}</th>
                  <th style={{ textAlign: 'right' }}>{L('Amount', 'ยอดเงิน')}</th>
                  <th style={{ textAlign: 'center' }}>{L('Status', 'สถานะ')}</th>
                  <th>{L('Created', 'สร้างเมื่อ')}</th>
                  <th>{L('Delivery', 'จัดส่ง')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.orderID}>
                    <td style={{ fontWeight: 600 }}>{o.orderNo}</td>
                    <td>{o.customer_name || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                      {fmtCurrency(Number(o.priceTotal || 0))} ฿
                    </td>
                    <td style={{ textAlign: 'center' }}>{getStatusBadge(o.status)}</td>
                    <td style={{ fontSize: 13, color: '#666' }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ fontSize: 13, color: '#0891b2' }}>
                      {o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      {loading ? L('Loading...', 'กำลังโหลด...') : L('No orders found', 'ไม่พบข้อมูลใบสั่งขาย')}
                    </td>
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
