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
    try { return (localStorage.getItem('k_system_lang') as 'en' | 'th') || 'en' } catch (_) { return 'en' }
  })
  const [stats, setStats] = useState({
    orders: 0,
    customers: 0,
    products: 0,
    invoices: 0,
    contracts: 0,
    followUps: 0,
    preInstallations: 0,
    salesOrders: 0
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
            invoices: Number(j.stats.invoices) || 0,
            contracts: Number(j.stats.contracts) || 0,
            followUps: Number(j.stats.followUps) || 0,
            preInstallations: Number(j.stats.preInstallations) || 0,
            salesOrders: Number(j.stats.salesOrders) || 0
          })
        }
      } catch (e) {
        console.error('Failed to load stats:', e)
      }
    })()
  }, [])

  const quickActions = [
    {
      title: 'Purchase Order',
      titleTh: 'ใบสั่งซื้อ',
      desc: 'Create purchase order',
      descTh: 'สร้างใบสั่งซื้อ',
      href: '/Thailand/Admin-Login/purchase-order/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      color: '#0890EB'
    },
    {
      title: 'Sales Order',
      titleTh: 'ใบสั่งขาย',
      desc: 'Create sales order',
      descTh: 'สร้างใบสั่งขาย',
      href: '/Thailand/Admin-Login/sales-order/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
      ),
      color: '#0d6efd'
    },
    {
      title: 'Contract',
      titleTh: 'Contract',
      desc: 'Create sales contract',
      descTh: 'สร้างสัญญาซื้อขาย',
      href: '/Thailand/Admin-Login/contract/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/>
        </svg>
      ),
      color: '#7c3aed'
    },
    {
      title: 'Quotation',
      titleTh: 'ใบเสนอราคา',
      desc: 'Create quotation',
      descTh: 'สร้างใบเสนอราคา',
      href: '/Thailand/Admin-Login/quotation/list',
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
      desc: 'Create invoice',
      descTh: 'สร้างใบแจ้งหนี้',
      href: '/Thailand/Admin-Login/invoice/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      color: '#FF6600'
    },
    {
      title: 'Tax Invoice',
      titleTh: 'ใบกำกับภาษี',
      desc: 'Create tax invoice',
      descTh: 'สร้างใบกำกับภาษี',
      href: '/Thailand/Admin-Login/tax-invoice/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/><path d="M9 11h6"/>
        </svg>
      ),
      color: '#dc2626'
    },
    {
      title: 'Receipt',
      titleTh: 'ใบเสร็จรับเงิน',
      desc: 'Create receipt',
      descTh: 'สร้างใบเสร็จรับเงิน',
      href: '/Thailand/Admin-Login/receipt/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z"/><path d="M9 13h6"/><path d="M9 17h3"/>
        </svg>
      ),
      color: '#7c3aed'
    },
    {
      title: 'Delivery Note',
      titleTh: 'ใบจัดส่งสินค้า',
      desc: 'Create delivery note',
      descTh: 'สร้างใบจัดส่งสินค้า',
      href: '/Thailand/Admin-Login/delivery-note/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      color: '#0891b2'
    },
    {
      title: 'Customers',
      titleTh: 'ลูกค้า',
      desc: 'Manage customers',
      descTh: 'จัดการข้อมูลลูกค้า',
      href: '/Thailand/Admin-Login/customers/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: '#3b82f6'
    },
    {
      title: 'Products',
      titleTh: 'สินค้า',
      desc: 'Manage products',
      descTh: 'จัดการสินค้า',
      href: '/Thailand/Admin-Login/products/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      color: '#ea580c'
    },
    {
      title: 'Product List',
      titleTh: 'รายการสินค้า',
      desc: 'View product list',
      descTh: 'ดูรายการสินค้า',
      href: '/Thailand/Admin-Login/product-list/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      color: '#0ea5a4'
    },
    {
      title: 'Follow Up',
      titleTh: 'ติดตามงาน',
      desc: 'Track follow-ups',
      descTh: 'ติดตามงานลูกค้า',
      href: '/Thailand/Admin-Login/follow-up/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      color: '#10b981'
    },
    {
      title: 'Pre-installation',
      titleTh: 'แบบฟอร์มก่อนติดตั้ง',
      desc: 'Site survey form',
      descTh: 'ตรวจสอบหน้างาน',
      href: '/Thailand/Admin-Login/pre-installation/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      color: '#f59e0b'
    },
    {
      title: 'Power Calculator',
      titleTh: 'คำนวณพลังงาน',
      desc: 'Calculate power',
      descTh: 'คำนวณพลังงานไฟฟ้า',
      href: '/Thailand/Admin-Login/power-calculator/list',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      ),
      color: '#ef4444'
    }
  ]

  const [activities, setActivities] = useState<Array<any>>([])

  function timeAgo(ts?: string) {
    if (!ts) return ''
    const d = new Date(ts)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return `${diff} sec ago`
    const mins = Math.floor(diff / 60)
    if (mins < 60) return `${mins} min${mins>1? 's':''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hr${hrs>1? 's':''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days>1? 's':''} ago`
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/activity')
        const j = await res.json()
        if (j && j.success && Array.isArray(j.activities) && mounted) {
          const items = j.activities.map((a: any) => ({
            type: a.type,
            descEn: a.title,
            descTh: a.title,
            time: timeAgo(a.ts)
          }))
          setActivities(items.slice(0, 20))
        }
      } catch (e) {
        console.error('load activities failed', e)
      }
    })()

    // SSE subscription for real-time updates
    const es = new EventSource('/api/activity/stream')
    es.onmessage = (evt) => {
      try {
        const d = JSON.parse(evt.data)
        if (d && d.type) {
          const act = { type: d.type, descEn: d.title || JSON.stringify(d), descTh: d.title || JSON.stringify(d), time: timeAgo(d.ts || new Date().toISOString()) }
          setActivities(prev => [act, ...prev].slice(0, 20))
        }
      } catch (err) {
        // ignore ping/ready messages
      }
    }

    return () => {
      mounted = false
      es.close()
    }
  }, [])

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
      {/* Welcome Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {L('Welcome back!','ยินดีต้อนรับกลับมา!')}
          </h1>
          <p style={{
            fontSize: '18px',
            opacity: 0.95,
            marginBottom: '16px'
          }}>
            {user?.name || user?.fullname || user?.username || 'Admin User'}
          </p>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600
          }}>
            📍 {user?.site || 'Thailand Site'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onClick={() => router.push('/Thailand/Admin-Login/purchase-order/list')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{stats.orders}</div>
          <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: 500 }}>{L('Purchase Orders','ใบสั่งซื้อ')}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onClick={() => router.push('/Thailand/Admin-Login/customers/list')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{stats.customers}</div>
          <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: 500 }}>{L('Customers','ลูกค้า')}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onClick={() => router.push('/Thailand/Admin-Login/products/list')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{stats.products}</div>
          <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: 500 }}>{L('Products','สินค้า')}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onClick={() => router.push('/Thailand/Admin-Login/invoice/list')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{stats.invoices}</div>
          <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: 500 }}>{L('Invoices','ใบแจ้งหนี้')}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(6, 182, 212, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onClick={() => router.push('/Thailand/Admin-Login/contract/list')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{stats.contracts}</div>
          <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: 500 }}>{L('Contracts','สัญญา')}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #eab308, #ca8a04)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(234, 179, 8, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onClick={() => router.push('/Thailand/Admin-Login/follow-up/list')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><polyline points="22 4 12 14 9 11"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{stats.followUps}</div>
          <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: 500 }}>{L('Follow Ups','ติดตามงาน')}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(20, 184, 166, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onClick={() => router.push('/Thailand/Admin-Login/pre-installation/list')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{stats.preInstallations}</div>
          <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: 500 }}>{L('Pre-Installation','ก่อนติดตั้ง')}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        onClick={() => router.push('/Thailand/Admin-Login/sales-order/list')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{stats.salesOrders}</div>
          <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: 500 }}>{L('Sales Orders','ใบสั่งขาย')}</div>
        </div>
      </div>
      

      {/* Quick Actions */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        marginBottom: '32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="2">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            {L('Quick Actions','เมนูด่วน')}
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {L('Quick access to common functions','เข้าถึงฟังก์ชันที่ใช้บ่อย')}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {quickActions.map((action, idx) => (
            <div
              key={idx}
              onClick={() => router.push(action.href)}
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = action.color
                e.currentTarget.style.boxShadow = `0 8px 24px ${action.color}30`
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.background = `linear-gradient(135deg, ${action.color}10, #ffffff)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)'
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: `${action.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: action.color
              }}>
                {action.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '6px' }}>
                {lang === 'th' ? action.titleTh : action.title}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                {lang === 'th' ? action.descTh : action.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

        

      {/* Recent Activity */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad2)" strokeWidth="2">
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {L('Recent Activity','กิจกรรมล่าสุด')}
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {L('Real-time updates from your system','อัพเดตแบบเรียลไทม์จากระบบของคุณ')}
          </p>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '2px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
              <tr>
                <th style={{
                  width: '60%',
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1e293b',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  {L('Details','รายละเอียด')}
                </th>
                <th style={{
                  width: '20%',
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1e293b',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  {L('Type','ประเภท')}
                </th>
                <th style={{
                  width: '20%',
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1e293b',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  {L('Time','เวลา')}
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '15px'
                  }}>
                    {L('No recent activity','ไม่มีกิจกรรมล่าสุด')}
                  </td>
                </tr>
              ) : (
                activities.map((activity, idx) => (
                  <tr key={idx} style={{
                    background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '14px',
                      color: '#334155',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {lang === 'th' ? activity.descTh || activity.descEn : activity.descEn || activity.descTh}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: activity.type === 'order' ? '#dbeafe' :
                                   activity.type === 'customer' ? '#d1fae5' :
                                   activity.type === 'invoice' ? '#fef3c7' :
                                   '#f3e8ff',
                        color: activity.type === 'order' ? '#1e40af' :
                               activity.type === 'customer' ? '#065f46' :
                               activity.type === 'invoice' ? '#92400e' :
                               '#6b21a8'
                      }}>
                        {activity.type === 'order' ? L('Order','ใบสั่งซื้อ') :
                         activity.type === 'customer' ? L('Customer','ลูกค้า') :
                         activity.type === 'invoice' ? L('Invoice','ใบแจ้งหนี้') :
                         L('Payment','ชำระเงิน')}
                      </span>
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '13px',
                      color: '#64748b',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {activity.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
