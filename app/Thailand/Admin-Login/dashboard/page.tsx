"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  username?: string
  fullname?: string
  typeID?: number
  site?: string
}

export default function ThailandAdminDashboard() {
  const router = useRouter()
  const [lang, setLang] = useState<'th' | 'en'>('th')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function verify() {
      try {
        const raw = localStorage.getItem('k_system_admin_user')
        if (!raw) {
          router.push('/Thailand/Admin-Login')
          return
        }

        const stored = JSON.parse(raw)
        const res = await fetch('/api/user/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: stored.userId })
        })

        if (!res.ok) {
          // Not authorized or user not found
          router.push('/Thailand/Admin-Login')
          return
        }

        const data = await res.json()

        if (!data || !data.user) {
          router.push('/Thailand/Admin-Login')
          return
        }

        const u = data.user

        // Check site and permission
        const siteLower = (u.site || '').toLowerCase().trim()
        if (siteLower !== 'thailand' && siteLower !== 'admin') {
          router.push('/Thailand/Admin-Login')
          return
        }

        if (u.typeID !== 1 && u.typeID !== 2) {
          // Not admin/super-admin
          router.push('/Thailand/Admin-Login')
          return
        }

        setUser(u)
      } catch (e) {
        router.push('/Thailand/Admin-Login')
      }
    }

    verify()
  }, [])

  function t(th: string, en: string) {
    return lang === 'th' ? th : en
  }

  function renderTile(th: string, en: string, path: string, color: string = '#fff') {
    return (
      <div onClick={() => router.push(path)} style={{ padding: 16, borderRadius: 10, border: '1px solid #e6eef8', background: color, cursor: 'pointer' }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{t(th, en)}</div>
        <div style={{ color: '#6b7280', marginBottom: 12 }}>{t('คลิกเพื่อเปิดแบบฟอร์ม', 'Click to open')}</div>
        <div>
          <button style={{ padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>{t('เปิด', 'Open')}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: '#f8fafc' }}>
      <div style={{ maxWidth: 980, margin: '24px auto', background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 6px 24px rgba(15,23,42,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{t('ยินดีต้อนรับสู่ระบบการจัดการ (Thailand)', 'Welcome to Management System (Thailand)')}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{t('จัดการข้อมูลของหน่วยงานในประเทศไทย', 'Manage resources for Thailand operations')}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: '#374151' }}>{user?.fullname || user?.username || ''}</div>
            <button onClick={() => setLang(lang === 'th' ? 'en' : 'th')} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>
              {lang === 'th' ? 'EN' : 'TH'}
            </button>
            <button onClick={() => { localStorage.removeItem('k_system_admin_user'); localStorage.removeItem('k_system_admin_token'); router.push('/') }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ef4444', color: '#ef4444', background: '#fff', cursor: 'pointer' }}>
              {t('ออกจากระบบ', 'Logout')}
            </button>
          </div>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {renderTile('สร้างใบสั่งซื้อ', 'Create Purchase Order', '/Thailand/Admin-Login/purchase-order')}
          {renderTile('ใบเสนอราคา', 'Quotation', '/Thailand/Admin-Login/quotation')}
          {renderTile('ใบแจ้งหนี้', 'Invoice', '/Thailand/Admin-Login/invoice')}
          {renderTile('ใบเสร็จรับเงิน', 'Receipt', '/Thailand/Admin-Login/receipt')}

          {renderTile('บันทึกการติดตามผล', 'Follow-ups', '/Thailand/Admin-Login/follow-up')}
          {renderTile('ข้อมูลลูกค้า', 'Customers', '/Thailand/Admin-Login/customers')}
          {renderTile('แบบฟอร์มตรวจหน้างานก่อนติดตั้ง', 'Pre-installation Form', '/Thailand/Admin-Login/pre-installation-form')}
          {renderTile('ระบบคำนวณไฟ', 'Power Calculator', '/Thailand/Admin-Login/power-calculator')}
        </section>

        <div style={{ marginTop: 18, color: '#6b7280', fontSize: 13 }}>
          {t('กรุณใช้บัญชีที่มีสิทธิ์ Thailand หรือ Admin เพื่อเข้าถึงหน้านี้', 'Please use an account with Thailand or Admin site to access this page')}
        </div>

      </div>
    </div>
  )
}
