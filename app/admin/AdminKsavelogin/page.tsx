"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('9999')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      let body: any = null
      try {
        body = await res.json()
      } catch (parseErr) {
        console.error('Failed to parse login response JSON', parseErr)
      }
      console.log('Login response', res.status, body)
      if (!res.ok) {
        const msg = body?.error || `Login failed (status ${res.status})`
        setError(msg)
        setLoading(false)
        return
      }
      // store token and redirect to admin login success page
      try { 
        localStorage.setItem('k_system_admin_token', body.token) 
        console.log('Login successful, token stored:', body.token)
      } catch (err) {
        console.error('Failed to store token:', err)
        setError('Failed to store authentication token')
        setLoading(false)
        return
      }
      console.log('Redirecting to AdminKsave page...')
      // redirect to AdminKsave landing page after successful login
      router.push('/admin/AdminKsave')
    } catch (err) {
      console.error('Login request failed:', err)
      setError('Network error - please check connection')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={submit} style={{ width: 420, padding: 24, borderRadius: 8, background: '#fff', boxShadow: '0 8px 20px rgba(2,6,23,0.08)' }}>
        <h3 style={{ marginTop: 0 }}>Admin System Login</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
        </div>
        {error ? <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div> : null}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="k-btn k-btn-primary" style={{ background: '#2563eb', color: '#fff', padding: '10px 16px', borderRadius: 6, border: 0 }}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <button type="button" onClick={() => { setUsername(''); setPassword(''); setError(null); }} className="k-btn" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f8fafc' }}>Reset</button>
        </div>
      </form>
    </div>
  )
}
