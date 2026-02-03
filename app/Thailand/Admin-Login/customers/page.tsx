"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type Customer = {
  cusID: number,
  fullname: string,
  email?: string | null,
  phone?: string | null,
  company?: string | null,
  address?: string | null,
  subject?: string | null,
  message?: string | null,
  created_by?: string | null,
  created_at?: string | null
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState<'en' | 'th'>('en')

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'th') setLocale('th')
    } catch {}

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

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/customers')
        const j = await res.json()
        if (mounted && j && Array.isArray(j.customers)) {
          setCustomers(j.customers)
        }
      } catch (err) {
        console.error('Failed to load customers', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  return (
    <AdminLayout title="Customer Details" titleTh="รายละเอียดลูกค้า">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 12 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {L('Customer Details', 'รายละเอียดลูกค้า')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('View all registered customers', 'ดูข้อมูลลูกค้าทั้งหมดที่ลงทะเบียนไว้')}
          </p>
        </div>
        <div className={styles.cardBody}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              {L('Loading...', 'กำลังโหลด...')}
            </div>
          ) : customers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              {L('No customers yet', 'ยังไม่มีลูกค้า')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{L('ID', 'รหัส')}</th>
                    <th>{L('Full Name', 'ชื่อ-นามสกุล')}</th>
                    <th>{L('Email', 'อีเมล')}</th>
                    <th>{L('Phone', 'โทรศัพท์')}</th>
                    <th>{L('Company', 'บริษัท')}</th>
                    <th>{L('Address', 'ที่อยู่')}</th>
                    <th>{L('Subject', 'หัวข้อ')}</th>
                    <th>{L('Message', 'ข้อความ')}</th>
                    <th>{L('Created By', 'สร้างโดย')}</th>
                    <th>{L('Created At', 'วันที่สร้าง')}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.cusID}>
                      <td>{c.cusID}</td>
                      <td>{c.fullname}</td>
                      <td>{c.email || '-'}</td>
                      <td>{c.phone || '-'}</td>
                      <td>{c.company || '-'}</td>
                      <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.address || '-'}</td>
                      <td>{c.subject || '-'}</td>
                      <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>{c.message || '-'}</td>
                      <td>{c.created_by || '-'}</td>
                      <td>{c.created_at || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
