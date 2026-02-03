"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../Admin-Login/components/AdminLayout'
import styles from '../../Admin-Login/admin-theme.module.css'

export default function ChatUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<Array<any>>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/users')
        const j = await res.json()
        if (!mounted) return
        if (j?.ok && Array.isArray(j.users)) {
          setUsers(j.users)
        }
      } catch (err) {
        console.error('failed to load users', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <AdminLayout title="Users" titleTh="ผู้ใช้">
      <div className={styles.contentCard} style={{ padding: 16 }}>
        <div className={styles.cardHeader} style={{ padding: '12px 18px' }}>
          <h3 className={styles.cardTitle}>Chat Users</h3>
        </div>
        <div className={styles.cardBody}>
          {users.length === 0 && <div style={{ color: '#666' }}>No users found</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {users.map((u: any) => (
              <div key={u.userId || u.id} className={styles.sectionBox} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(u.name||u.userName||'U').slice(0,2).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{u.name || u.userName || u.email}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{u.userName || u.email}</div>
                </div>
                <div>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push(`/Thailand/Chat?recipientId=${encodeURIComponent(String(u.userId||u.id))}&recipientName=${encodeURIComponent(u.name||u.userName||'')}`)}>Open</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
