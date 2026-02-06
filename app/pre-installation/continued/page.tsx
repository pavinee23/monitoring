"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

export default function PreInstallationContinued() {
  const router = useRouter()
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Pre-Installation — Continued</h1>
        <p>Additional steps, configuration notes, and post-installation checks.</p>

        <section style={styles.section}>
          <h3>Configuration Notes</h3>
          <ul>
            <li>Device firmware: record version and update notes</li>
            <li>Set device hostname and static IP if required</li>
            <li>Test connectivity to cloud endpoints</li>
            <li>Verify data reporting and sample readings</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h3>Post-Installation Checks</h3>
          <ol>
            <li>Confirm sensors and CT wiring</li>
            <li>Validate readings against meter</li>
            <li>Document serial numbers and site photos</li>
          </ol>
        </section>

        <div style={styles.actions}>
          <button onClick={() => router.push('/pre-installation')} style={styles.secondary}>ย้อนกลับ</button>
          <button onClick={() => router.push('/pre-installation-report')} style={styles.primary}>บันทึกเป็นรายงาน</button>
        </div>
      </div>
    </div>
  )
}

const styles: { [k: string]: React.CSSProperties } = {
  page: { padding: 24, display: 'flex', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 900, background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  section: { marginTop: 12 },
  actions: { marginTop: 18, display: 'flex', gap: 8 },
  primary: { background: '#10b981', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' },
  secondary: { background: '#fff', color: '#111827', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' }
}
