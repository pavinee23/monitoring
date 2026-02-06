"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type FollowUpNote = {
  date: string
  status: string
  action: string
  notes: string
}

export default function FollowUpPage() {
  const router = useRouter()
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState<FollowUpNote[]>([])
  const [form, setForm] = useState<FollowUpNote>({
    date: new Date().toISOString().split('T')[0],
    status: 'Open',
    action: '',
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

  function addNote() {
    if (!form.date || !form.action) {
      alert(L('Please enter date and next action', 'กรุณากรอกวันที่และการกระทำถัดไป'))
      return
    }
    setNotes([form, ...notes])
    setForm({ date: new Date().toISOString().split('T')[0], status: 'Open', action: '', notes: '' })
  }

  function removeNote(index: number) {
    setNotes(notes.filter((_, i) => i !== index))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName) {
      alert(L('Please enter customer name', 'กรุณาใส่ชื่อลูกค้า'))
      return
    }
    if (notes.length === 0) {
      alert(L('Please add at least one follow-up note', 'กรุณาเพิ่มบันทึกติดตามอย่างน้อย 1 รายการ'))
      return
    }
    console.log({ customerName, notes })
    alert(L('Follow-up saved (demo)', 'บันทึกการติดตามแล้ว (demo)'))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return styles.badgeInfo
      case 'In Progress':
        return styles.badgeWarning
      case 'Closed':
        return styles.badgeSuccess
      default:
        return styles.badgePending
    }
  }

  return (
    <AdminLayout title="Follow-up" titleTh="ติดตามผล">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 12 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {L('Create Follow-up', 'สร้างการติดตามผล')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Track customer follow-up activities', 'ติดตามกิจกรรมการติดตามลูกค้า')}
          </p>
        </div>
        <div className={styles.cardBody}>
          <form onSubmit={handleSave}>
            {/* Customer Information */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{L('Customer Information', 'ข้อมูลลูกค้า')}</h3>
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

            {/* Add New Note */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{L('Add Follow-up Note', 'เพิ่มบันทึกติดตาม')}</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Date', 'วันที่')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Status', 'สถานะ')}</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="Open">{L('Open', 'เปิด')}</option>
                    <option value="In Progress">{L('In Progress', 'กำลังดำเนินการ')}</option>
                    <option value="Closed">{L('Closed', 'ปิด')}</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Next Action', 'การกระทำถัดไป')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  placeholder={L('Enter next action', 'กรอกการกระทำถัดไป')}
                  value={form.action}
                  onChange={e => setForm({ ...form, action: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Notes', 'บันทึก')}</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className={styles.formTextarea}
                  placeholder={L('Enter additional notes...', 'กรอกหมายเหตุเพิ่มเติม...')}
                  rows={3}
                />
              </div>
              <button type="button" onClick={addNote} className={`${styles.btn} ${styles.btnSecondary}`}>
                + {L('Add Note', 'เพิ่มบันทึก')}
              </button>
            </div>

            {/* Notes History */}
            {notes.length > 0 && (
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionTitle}>{L('Follow-up History', 'ประวัติการติดตาม')} ({notes.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {notes.map((n, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        position: 'relative'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => removeNote(idx)}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#dc2626',
                          fontSize: 18
                        }}
                        title={L('Remove', 'ลบ')}
                      >
                        ×
                      </button>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <strong style={{ color: '#1f2937' }}>{n.date}</strong>
                          <span className={`${styles.badge} ${getStatusBadge(n.status)}`}>
                            {n.status === 'Open' ? L('Open', 'เปิด') :
                             n.status === 'In Progress' ? L('In Progress', 'กำลังดำเนินการ') :
                             L('Closed', 'ปิด')}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: '#4b5563', marginBottom: 4 }}>
                        <strong>{L('Next Action', 'การกระทำถัดไป')}:</strong> {n.action}
                      </div>
                      {n.notes && (
                        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                          {n.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                {L('Save Follow-up', 'บันทึกการติดตาม')}
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
