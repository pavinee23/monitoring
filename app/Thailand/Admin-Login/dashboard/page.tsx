"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type User = {
  username?: string
  fullname?: string
  name?: string
  typeID?: number
  site?: string
}

export default function ThailandAdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [lang, setLang] = useState<'en'|'th'>(() => {
    try { return (localStorage.getItem('k_system_lang') as 'en' | 'th') || 'th' } catch (_) { return 'th' }
  })
  const [stats, setStats] = useState({
    orders: 0,
    customers: 0,
    products: 0,
    invoices: 0
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        setUser(JSON.parse(raw))
      }
    } catch (e) {
      console.error('Failed to load user data:', e)
    }

    // Load stats from API
    ;(async () => {
      try {
        const res = await fetch('/api/stats')
        const j = await res.json()
        if (j && j.success && j.stats) {
          setStats({
            orders: Number(j.stats.orders) || 0,
            customers: Number(j.stats.customers) || 0,
            products: Number(j.stats.products) || 0,
            invoices: Number(j.stats.invoices) || 0
          })
        }
      } catch (e) {
        console.error('Failed to load stats:', e)
      }
    })()
  }, [])

  const quickActions = [
    {
      title: 'Create Purchase Order',
      titleTh: 'สร้างใบสั่งซื้อ',
      desc: 'Create new purchase order for customers',
      descTh: 'สร้างใบสั่งซื้อใหม่สำหรับลูกค้า',
      href: '/Thailand/Admin-Login/purchase-order',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      color: '#0890EB'
    },
    {
      title: 'Quotation',
      titleTh: 'ใบเสนอราคา',
      desc: 'Create quotation for customers',
      descTh: 'สร้างใบเสนอราคาสำหรับลูกค้า',
      href: '/Thailand/Admin-Login/quotation',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15h6"/>
        </svg>
      ),
      color: '#28a745'
    },
    {
      title: 'Invoice',
      titleTh: 'ใบแจ้งหนี้',
      desc: 'Create invoice for billing',
      descTh: 'สร้างใบแจ้งหนี้สำหรับเรียกเก็บเงิน',
      href: '/Thailand/Admin-Login/invoice',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      color: '#FF6600'
    },
    {
      title: 'Receipt',
      titleTh: 'ใบเสร็จรับเงิน',
      desc: 'Create payment receipt',
      descTh: 'สร้างใบเสร็จรับเงิน',
      href: '/Thailand/Admin-Login/receipt',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z"/><path d="M9 13h6"/><path d="M9 17h3"/>
        </svg>
      ),
      color: '#7c3aed'
    }
  ]

  const recentActivities = [
    { type: 'order', descEn: 'New purchase order #PO-240123-0001', descTh: 'มีใบสั่งซื้อใหม่ #PO-240123-0001', time: '5 minutes ago' },
    { type: 'customer', descEn: 'New customer "ABC Company" added', descTh: 'เพิ่มลูกค้าใหม่ "ABC Company"', time: '1 hour ago' },
    { type: 'invoice', descEn: 'Invoice #INV-240123 sent to client', descTh: 'ส่งใบแจ้งหนี้ #INV-240123 ถึงลูกค้า', time: '2 hours ago' },
    { type: 'payment', descEn: 'Payment received for #INV-240122', descTh: 'รับชำระเงินสำหรับ #INV-240122', time: '3 hours ago' }
  ]

  useEffect(() => {
    const handler = (e: Event) => {
      // @ts-ignore
      const v = e?.detail as 'en' | 'th'
      if (v) setLang(v)
    }
    window.addEventListener('k-system-lang', handler)
    return () => window.removeEventListener('k-system-lang', handler)
  }, [])

  const L = (en: string, th: string) => lang === 'th' ? th : en

  return (
    <AdminLayout title="Dashboard" titleTh="แดชบอร์ด">
      {/* Welcome Banner */}
      <div className={styles.contentCard} style={{ marginBottom: '24px' }}>
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {L('Welcome,','ยินดีต้อนรับ,')} {user?.name || user?.fullname || user?.username || 'Admin'}
          </h1>
          <p className={styles.cardSubtitle}>{L('K Energy Save Management System - Thailand branch','ระบบการจัดการ K Energy Save - สาขาประเทศไทย')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.orders}</div>
            <div className={styles.statLabel}>{L('Orders','ใบสั่งซื้อ')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.customers}</div>
            <div className={styles.statLabel}>{L('Customers','ลูกค้า')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.products}</div>
            <div className={styles.statLabel}>{L('Products','สินค้า')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.invoices}</div>
            <div className={styles.statLabel}>{L('Invoices','ใบแจ้งหนี้')}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.contentCard} style={{ marginBottom: '24px' }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            เมนูด่วน
          </h2>
          <p className={styles.cardSubtitle}>เข้าถึงฟังก์ชันที่ใช้บ่อย</p>
        </div>
        <div className={styles.cardBody}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                onClick={() => router.push(action.href)}
                style={{
                  padding: '20px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color
                  e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}20`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ color: action.color, marginBottom: '12px' }}>
                  {action.icon}
                </div>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                  {lang === 'th' ? action.titleTh : action.title}
                </div>
                <div style={{ fontSize: '13px', color: '#666666' }}>
                  {lang === 'th' ? action.descTh : action.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            กิจกรรมล่าสุด
          </h2>
        </div>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
                <tr>
                  <th style={{ width: '60%' }}>{L('Details','รายละเอียด')}</th>
                  <th style={{ width: '20%' }}>{L('Type','ประเภท')}</th>
                  <th style={{ width: '20%' }}>{L('Time','เวลา')}</th>
                </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity, idx) => (
                <tr key={idx}>
                  <td>{lang === 'th' ? (activity as any).descTh || (activity as any).descEn : (activity as any).descEn || (activity as any).descTh}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      activity.type === 'order' ? styles.badgeInfo :
                      activity.type === 'customer' ? styles.badgeSuccess :
                      activity.type === 'invoice' ? styles.badgeWarning :
                      styles.badgePending
                    }`}>
                      {activity.type === 'order' ? L('Order','ใบสั่งซื้อ') :
                       activity.type === 'customer' ? L('Customer','ลูกค้า') :
                       activity.type === 'invoice' ? L('Invoice','ใบแจ้งหนี้') :
                       L('Payment','ชำระเงิน')}
                    </span>
                  </td>
                  <td style={{ color: '#666666' }}>{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
