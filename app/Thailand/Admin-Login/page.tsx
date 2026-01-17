"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [site, setSite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate site - only allow "thailand" or "admin"
    const siteLower = site.toLowerCase().trim()
    if (siteLower !== 'thailand' && siteLower !== 'admin') {
      setError('สิทธิ์การเข้าถึงสำหรับ Site Thailand และ Admin เท่านั้น')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, site })
      })

      const data = await res.json()

      console.log('🔍 Login response:', data)

      if (!res.ok || data.error) {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ')
        return
      }

      // Check user's site from response data
      const userSite = (data.site || '').toLowerCase().trim()
      console.log('🔍 User site:', userSite, 'typeID:', data.typeID)

      // Verify user's site is thailand or admin
      if (userSite !== 'thailand' && userSite !== 'admin') {
        setError('บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบ Thailand')
        return
      }

      // Store user data and token
      localStorage.setItem('k_system_admin_user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        name: data.name,
        email: data.email,
        site: data.site,
        typeID: data.typeID
      }))
      localStorage.setItem('k_system_admin_token', data.token || '')

      console.log('🔍 About to redirect - site:', userSite, 'typeID:', data.typeID)

      // Redirect based on typeID and site
      // For Thailand/Admin site logins, send to the new Thailand dashboard
      if (userSite === 'thailand' || userSite === 'admin') {
        if (data.typeID === 1 || data.typeID === 2) {
          console.log('✅ Redirecting to Thailand dashboard')
          router.push('/Thailand/Admin-Login/dashboard')
          return
        } else {
          console.log('⚠️ Not admin - typeID:', data.typeID)
          router.push('/sites')
          return
        }
      } else {
        // Fallback: send super/admin users to the global admin main
        if (data.typeID === 1 || data.typeID === 2) {
          router.push('/admin/main')
        } else {
          router.push('/sites')
        }
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 20
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: 40,
        maxWidth: 450,
        width: '100%'
      }}>
        {/* Company Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/k-energy-save-logo.jpg" alt="K Energy Save Logo" style={{ width: 72, height: 'auto', margin: '0 auto 12px', display: 'block' }} />
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 8
          }}>
            K Energy Save Co., Ltd.
          </div>
          <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 4 }}>
            บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
            สาขาประเทศไทย
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          padding: '16px 24px',
          borderRadius: 8,
          marginTop: 24,
          marginBottom: 24,
          textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 700 }}>
            ระบบการจัดการ
          </h2>
          <div style={{ fontSize: 14, color: '#e5e7eb', marginTop: 4 }}>
            Management System Login
          </div>
        </div>

        {error && (
          <div style={{
            padding: 12,
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 15,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                outline: 'none'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 15,
                borderRadius: 6,
                border: '1px solid #d1d5db',
                outline: 'none'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#374151' }}>
              Site <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 15,
                borderRadius: 6,
                border: '1px solid #d1d5db',
                outline: 'none',
                cursor: 'pointer',
                background: '#fff'
              }}
              required
            >
              <option value="">-- เลือก Site --</option>
              <option value="thailand">Thailand</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              marginTop: 8
            }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>



        <div style={{
          marginTop: 16,
          textAlign: 'center'
        }}>
          <button
            onClick={() => router.push('/sites')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontSize: 14,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  )
}
