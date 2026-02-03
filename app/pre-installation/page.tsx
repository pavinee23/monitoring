"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

export default function PreInstallationPage() {
  const router = useRouter()
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Pre-Installation</h1>
        <p>This page contains the main pre-installation checklist and instructions for installers.</p>

        <section style={styles.section}>
          <h3>Checklist</h3>
          <ul>
            <li>Confirm power source & earth</li>
            <li>Verify network (IP, DHCP, firewall)</li>
            <li>Confirm mounting location and space</li>
            <li>Gather site contact details</li>
          </ul>
        </section>

        <div style={styles.actions}>
          <button onClick={() => router.push('/pre-installation/continued')} style={styles.primary}>ต่อไป (Pre-installation ต่อ)</button>
          <button onClick={() => router.push('/pre-installation-report')} style={styles.secondary}>เปิดรายงาน (Report)</button>
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
  primary: { background: '#2563eb', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' },
  secondary: { background: '#fff', color: '#111827', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' }
}
