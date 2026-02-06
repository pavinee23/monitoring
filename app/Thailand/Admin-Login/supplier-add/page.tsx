"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

export default function SupplierAddPage() {
  const router = useRouter()
  const [form, setForm] = useState({ supplier_id: '', name: '', email: '', phone: '', address: '', company: '', expected_delivery: '', notes: '', is_active: true })
  const [loading, setLoading] = useState(false)
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => ({ ...prev, [name]: checked }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const generateSupplierId = () => {
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const rnd = Math.floor(Math.random() * 9000) + 1000
    const id = `SUP-${yy}${mm}${dd}-${rnd}`
    setForm(prev => ({ ...prev, supplier_id: id }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Reuse existing customers API to create supplier-like record
      const payload: any = {
        supplier_id: form.supplier_id || null,
        name: form.name,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        expected_delivery: form.expected_delivery || null,
        notes: form.notes || null,
        is_active: form.is_active ? 1 : 0
      }
      const res = await fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json()

      if (res.ok && j && j.success) {
        setMessageBar({ type: 'success', text: L('Supplier added successfully', 'เพิ่มซัพพลายเออร์สำเร็จ') })
        setForm({ supplier_id: '', name: '', email: '', phone: '', address: '', company: '', expected_delivery: '', notes: '', is_active: true })
        setTimeout(() => router.push('/Thailand/Admin-Login/purchase-order'), 900)
      } else {
        const serverMsg = (j && j.error) ? j.error : res.statusText || 'Unknown error'
        setMessageBar({ type: 'error', text: L('Save failed:', 'บันทึกไม่สำเร็จ:') + ' ' + serverMsg })
      }
    } catch (err) {
      console.error(err)
      setMessageBar({ type: 'error', text: L('Network error', 'มีข้อผิดพลาดในการเชื่อมต่อ') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Add Supplier" titleTh="เพิ่มซัพพลายเออร์">
      {messageBar && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: 8,
          color: messageBar.type === 'error' ? '#7f1d1d' : '#064e3b',
          background: messageBar.type === 'error' ? '#fee2e2' : '#ecfdf5',
          border: messageBar.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>{messageBar.text}</div>
          <button onClick={() => setMessageBar(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>{L('Close', 'ปิด')}</button>
        </div>
      )}

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            {L('Add New Supplier', 'เพิ่มซัพพลายเออร์ใหม่')}
          </h2>
          <p className={styles.cardSubtitle}>{L('Enter supplier information', 'กรอกข้อมูลซัพพลายเออร์')}</p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ maxWidth: 420 }}>
                <label className={styles.formLabel}>{L('Supplier ID','รหัสซัพพลายเออร์')}</label>
                <input name="supplier_id" value={form.supplier_id} onChange={handleChange} className={styles.formInput} placeholder={L('Optional ID','รหัส (ไม่บังคับ)')} />
                <div style={{ marginTop: 8 }}>
                  <button type="button" onClick={generateSupplierId} className={`${styles.btn} ${styles.btnOutline}`}>{L('Generate ID','รันเลข')}</button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Supplier Name','ชื่อซัพพลายเออร์')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input name="name" value={form.name} onChange={handleChange} required className={styles.formInput} placeholder={L('Company or supplier name','ชื่อบริษัทหรือซัพพลายเออร์')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Company','บริษัท')}</label>
                <input name="company" value={form.company} onChange={handleChange} className={styles.formInput} placeholder={L('Company name','ชื่อบริษัท')} />
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <label className={styles.formLabel}>{L('Active','สถานะ')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} />
                    <span style={{ fontSize: 13 }}>{form.is_active ? L('Active','ใช้งาน') : L('Inactive','ไม่ใช้งาน')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Email','อีเมล')}</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={styles.formInput} placeholder={L('email@example.com','email@example.com')} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Phone','โทรศัพท์')}</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={styles.formInput} placeholder={L('Phone number','เบอร์โทรศัพท์')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Expected Delivery','วันที่คาดว่าจะได้รับ')}</label>
                <input name="expected_delivery" type="date" value={form.expected_delivery} onChange={handleChange} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <label className={styles.formLabel}>{L('Address','ที่อยู่')}</label>
              <textarea name="address" value={form.address} onChange={handleChange} className={styles.formTextarea} rows={3} placeholder={L('Supplier address','ที่อยู่ซัพพลายเออร์')} />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <label className={styles.formLabel}>{L('Notes','บันทึก')}</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className={styles.formTextarea} rows={3} placeholder={L('Additional notes','บันทึกเพิ่มเติม')} />
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', gap: '14px', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge} ${styles.btnPill}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                    </svg>
                    {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
                  </button>
                </div>

                <div>
                  <button type="button" onClick={() => router.back()} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge} ${styles.btnPill}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    {L('Cancel', 'ยกเลิก')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
