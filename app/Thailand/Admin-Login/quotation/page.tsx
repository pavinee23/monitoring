"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

export default function QuotationPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' })
  const [items, setItems] = useState([{ desc: '', qty: 1, price: 0 }])
  const [discount, setDiscount] = useState(0)
  const [taxRate, setTaxRate] = useState(7)
  const [errors, setErrors] = useState<string[]>([])
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 })
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
    const subtotal = items.reduce((s, it) => s + it.qty * Number(it.price || 0), 0)
    const afterDiscount = Math.max(0, subtotal - Number(discount || 0))
    const tax = (afterDiscount * Number(taxRate || 0)) / 100
    setTotals({ subtotal, tax, total: afterDiscount + tax })
  }, [items, discount, taxRate])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  function addItem() {
    setItems([...items, { desc: '', qty: 1, price: 0 }])
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  function updateItem(i: number, key: string, value: any) {
    const copy = [...items]
    // @ts-ignore
    copy[i][key] = key === 'desc' ? value : Number(value)
    setItems(copy)
  }

  function validate() {
    const e: string[] = []
    if (!customer.name) e.push(L('Please enter customer name', 'กรุณาใส่ชื่อลูกค้า'))
    items.forEach((it, idx) => {
      if (!it.desc) e.push(L(`Item ${idx + 1} needs description`, `รายการที่ ${idx + 1} ต้องมีคำอธิบาย`))
      if (it.qty <= 0) e.push(L(`Qty must be > 0 for item ${idx + 1}`, `จำนวนสำหรับรายการ ${idx + 1} ต้องมากกว่า 0`))
    })
    setErrors(e)
    return e.length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    console.log({ customer, items, discount, taxRate, totals })
    alert(L('Quotation saved (demo)', 'บันทึกใบเสนอราคาแล้ว (demo)'))
  }

  function handleReset() {
    setCustomer({ name: '', phone: '', address: '' })
    setItems([{ desc: '', qty: 1, price: 0 }])
    setDiscount(0)
    setErrors([])
  }

  return (
    <AdminLayout title="Quotation" titleTh="ใบเสนอราคา">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 12 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M12 18v-6"/>
              <path d="M9 15h6"/>
            </svg>
            {L('Create Quotation', 'สร้างใบเสนอราคา')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Create a new quotation for customer', 'สร้างใบเสนอราคาใหม่สำหรับลูกค้า')}
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
                    className={styles.formInput}
                    placeholder={L('Enter customer name', 'กรอกชื่อลูกค้า')}
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                  <input
                    className={styles.formInput}
                    placeholder={L('Phone number', 'หมายเลขโทรศัพท์')}
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder={L('Customer address', 'ที่อยู่ลูกค้า')}
                  value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Product Items */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{L('Product Details', 'รายละเอียดสินค้า')}</h3>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}>
                    <label className={styles.formLabel}>{L('Description', 'รายละเอียด')} <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      className={styles.formInput}
                      placeholder={L('Item description', 'รายละเอียดสินค้า')}
                      value={it.desc}
                      onChange={e => updateItem(i, 'desc', e.target.value)}
                    />
                  </div>
                  <div style={{ width: 100 }}>
                    <label className={styles.formLabel}>{L('Qty', 'จำนวน')}</label>
                    <input
                      type="number"
                      min={1}
                      className={styles.formInput}
                      value={it.qty}
                      onChange={e => updateItem(i, 'qty', e.target.value)}
                    />
                  </div>
                  <div style={{ width: 140 }}>
                    <label className={styles.formLabel}>{L('Price', 'ราคา')}</label>
                    <input
                      type="number"
                      min={0}
                      className={styles.formInput}
                      value={it.price}
                      onChange={e => updateItem(i, 'price', e.target.value)}
                    />
                  </div>
                  <div style={{ width: 100, textAlign: 'right', paddingBottom: 8 }}>
                    <strong>{(it.qty * Number(it.price || 0)).toLocaleString()} ฿</strong>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                      style={{ marginBottom: 8 }}
                    >
                      {L('Remove', 'ลบ')}
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className={`${styles.btn} ${styles.btnSecondary}`}>
                + {L('Add Item', 'เพิ่มรายการ')}
              </button>
            </div>

            {/* Summary */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Discount (THB)', 'ส่วนลด (บาท)')}</label>
                <input
                  type="number"
                  min={0}
                  className={styles.formInput}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('VAT (%)', 'ภาษีมูลค่าเพิ่ม (%)')}</label>
                <input
                  type="number"
                  min={0}
                  className={styles.formInput}
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                />
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: 8,
                padding: 16,
                minWidth: 220,
                border: '1px solid #bae6fd'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#0369a1' }}>{L('Summary', 'สรุปยอด')}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{L('Subtotal', 'ยอดรวมย่อย')}: {totals.subtotal.toLocaleString()} ฿</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{L('Discount', 'ส่วนลด')}: {Number(discount).toLocaleString()} ฿</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{L('Tax', 'ภาษี')}: {totals.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</div>
                <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: '#0c4a6e' }}>
                  {L('Total', 'รวม')}: {totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                </div>
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className={`${styles.alert} ${styles.alertError}`}>
                {errors.map((er, idx) => <div key={idx}>{er}</div>)}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {L('Save Quotation', 'บันทึกใบเสนอราคา')}
              </button>
              <button type="button" onClick={handleReset} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}>
                {L('Reset', 'ล้างข้อมูล')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
