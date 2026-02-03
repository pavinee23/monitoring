"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

export default function PurchaseOrderPage() {
  const router = useRouter()
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    totalPrice: '',
    deliveryDate: '',
    notes: ''
  })

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

  const L = (en: string, th: string) => locale === 'th' ? th : en

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }

      // Auto-calculate total price
      if (name === 'quantity' || name === 'unitPrice') {
        const qty = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(updated.quantity) || 0
        const price = name === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updated.unitPrice) || 0
        updated.totalPrice = (qty * price).toFixed(2)
      }

      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerName) {
      alert(L('Please enter customer name', 'กรุณาใส่ชื่อลูกค้า'))
      return
    }
    if (!formData.productName) {
      alert(L('Please enter product name', 'กรุณาใส่ชื่อสินค้า'))
      return
    }
    console.log('Purchase Order Data:', formData)
    alert(L('Purchase order created successfully!', 'สร้างใบสั่งซื้อเรียบร้อยแล้ว!'))
  }

  return (
    <AdminLayout title="Purchase Order" titleTh="ใบสั่งซื้อ">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 12 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            {L('Create Purchase Order', 'สร้างใบสั่งซื้อ')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Create a new purchase order', 'สร้างใบสั่งซื้อใหม่')}
          </p>
        </div>
        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {/* Customer Information */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{L('Customer Information', 'ข้อมูลลูกค้า')}</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('Enter customer name', 'กรอกชื่อลูกค้า')}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Email', 'อีเมล')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('Enter email', 'กรอกอีเมล')}
                    required
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Phone', 'เบอร์โทร')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('Enter phone number', 'กรอกเบอร์โทร')}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Delivery Date', 'วันที่ส่งมอบ')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{L('Product Information', 'ข้อมูลสินค้า')}</h3>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Product Name', 'ชื่อสินค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder={L('Enter product name', 'กรอกชื่อสินค้า')}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>
                    {L('Quantity', 'จำนวน')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('Enter quantity', 'กรอกจำนวน')}
                    required
                    min="1"
                    step="1"
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>
                    {L('Unit Price', 'ราคาต่อหน่วย')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('Enter unit price', 'กรอกราคาต่อหน่วย')}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.formLabel}>{L('Total Price', 'ราคารวม')}</label>
                  <input
                    type="text"
                    name="totalPrice"
                    value={formData.totalPrice ? `${Number(formData.totalPrice).toLocaleString()} ฿` : ''}
                    readOnly
                    className={styles.formInput}
                    style={{ background: '#f3f4f6', fontWeight: 700, color: '#0369a1' }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{L('Additional Notes', 'หมายเหตุเพิ่มเติม')}</h3>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className={styles.formTextarea}
                  placeholder={L('Enter any additional notes...', 'กรอกหมายเหตุเพิ่มเติม...')}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {L('Create Purchase Order', 'สร้างใบสั่งซื้อ')}
              </button>
              <button type="button" onClick={() => router.back()} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}>
                {L('Cancel', 'ยกเลิก')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
