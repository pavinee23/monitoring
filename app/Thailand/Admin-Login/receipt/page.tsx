"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type PaymentRecord = {
  date: string
  method: string
  amount: number
  reference: string
}

export default function ReceiptPage() {
  const router = useRouter()
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [receiptNo, setReceiptNo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [records, setRecords] = useState<PaymentRecord[]>([
    { date: new Date().toISOString().split('T')[0], method: 'Cash', amount: 0, reference: '' }
  ])

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

  function addRow() {
    setRecords([...records, { date: new Date().toISOString().split('T')[0], method: 'Cash', amount: 0, reference: '' }])
  }

  function removeRow(index: number) {
    if (records.length > 1) {
      setRecords(records.filter((_, i) => i !== index))
    }
  }

  function update(i: number, key: keyof PaymentRecord, value: any) {
    const c = [...records]
    c[i][key] = key === 'amount' ? Number(value) : value
    setRecords(c)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!receiptNo) {
      alert(L('Please enter receipt number', 'กรุณาใส่เลขที่ใบเสร็จ'))
      return
    }
    if (!customerName) {
      alert(L('Please enter customer name', 'กรุณาใส่ชื่อลูกค้า'))
      return
    }
    console.log({ receiptNo, customerName, records })
    alert(L('Receipt saved (demo)', 'บันทึกใบเสร็จแล้ว (demo)'))
  }

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)

  return (
    <AdminLayout title="Receipt" titleTh="ใบเสร็จรับเงิน">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 12 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M16 13H8"/>
              <path d="M16 17H8"/>
              <path d="M10 9H8"/>
            </svg>
            {L('Create Receipt', 'สร้างใบเสร็จรับเงิน')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Record payment receipts', 'บันทึกใบเสร็จรับเงิน')}
          </p>
        </div>
        <div className={styles.cardBody}>
          <form onSubmit={handleSave}>
            {/* Receipt Details */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{L('Receipt Details', 'รายละเอียดใบเสร็จ')}</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Receipt No.', 'เลขที่ใบเสร็จ')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    placeholder={L('Enter receipt number', 'กรอกเลขที่ใบเสร็จ')}
                    value={receiptNo}
                    onChange={e => setReceiptNo(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    placeholder={L('Enter customer name', 'กรอกชื่อลูกค้า')}
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Payment Records */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{L('Payment Records', 'รายการชำระเงิน')}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 160 }}>{L('Date', 'วันที่')}</th>
                      <th style={{ width: 160 }}>{L('Payment Method', 'วิธีชำระ')}</th>
                      <th style={{ width: 160 }}>{L('Amount', 'จำนวนเงิน')}</th>
                      <th>{L('Reference / Notes', 'อ้างอิง / หมายเหตุ')}</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            type="date"
                            value={r.date}
                            onChange={e => update(i, 'date', e.target.value)}
                            className={styles.formInput}
                          />
                        </td>
                        <td>
                          <select
                            value={r.method}
                            onChange={e => update(i, 'method', e.target.value)}
                            className={styles.formSelect}
                          >
                            <option value="Cash">{L('Cash', 'เงินสด')}</option>
                            <option value="Bank Transfer">{L('Bank Transfer', 'โอนเงิน')}</option>
                            <option value="Credit Card">{L('Credit Card', 'บัตรเครดิต')}</option>
                            <option value="Cheque">{L('Cheque', 'เช็ค')}</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={r.amount}
                            onChange={e => update(i, 'amount', e.target.value)}
                            className={styles.formInput}
                          />
                        </td>
                        <td>
                          <input
                            placeholder={L('Reference / Notes', 'อ้างอิง / หมายเหตุ')}
                            value={r.reference}
                            onChange={e => update(i, 'reference', e.target.value)}
                            className={styles.formInput}
                          />
                        </td>
                        <td>
                          {records.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(i)}
                              className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                            >
                              {L('Remove', 'ลบ')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <button type="button" onClick={addRow} className={`${styles.btn} ${styles.btnSecondary}`}>
                  + {L('Add Record', 'เพิ่มรายการ')}
                </button>
                <div style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  borderRadius: 8,
                  padding: 16,
                  minWidth: 200,
                  border: '1px solid #a7f3d0',
                  textAlign: 'right'
                }}>
                  <div style={{ fontSize: 13, color: '#064e3b' }}>{L('Total Amount', 'ยอดรวม')}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#047857' }}>
                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button type="submit" className={`${styles.btn} ${styles.btnSuccess} ${styles.btnLarge}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {L('Save Receipt', 'บันทึกใบเสร็จ')}
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
