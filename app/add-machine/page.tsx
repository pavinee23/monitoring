"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AddMachinePage() {
  const [name, setName] = useState('')
  const [ksave, setKsave] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [machines, setMachines] = useState<any[]>([])
  const [loadingMachines, setLoadingMachines] = useState(false)

  // Fetch machines list from PostgreSQL
  async function fetchMachines() {
    setLoadingMachines(true)
    try {
      const res = await fetch('/api/admin_route/machines')
      const data = await res.json()
      if (data.ok && data.machines) {
        setMachines(data.machines)
      }
    } catch (err) {
      console.error('Failed to fetch machines:', err)
    } finally {
      setLoadingMachines(false)
    }
  }

  // Load machines on mount
  useEffect(() => {
    fetchMachines()
  }, [])

  // core submit logic separated so we can retry without an event
  async function submitMachine() {
    setSaving(true)
    setError(null)
    setResult(null)
    setSuccess(null)

    // basic client-side validation
    if (!name.trim() || !ksave.trim()) {
      setError('Please provide machine name and series no (ksave).')
      setSaving(false)
      throw new Error('validation')
    }

    try {
      const res = await fetch('/api/admin_route/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ksave, location })
      })

      // read response text for better error messages
      const text = await res.text().catch(() => '')
      if (!res.ok) {
        let serverMsg = text
        try {
          const parsed = JSON.parse(text || '{}')
          if (parsed && parsed.error) serverMsg = parsed.error
        } catch (_) {}
        const msg = serverMsg || `${res.status} ${res.statusText}`
        throw new Error(msg)
      }

      let body: any = {}
      try { body = JSON.parse(text || '{}') } catch (_) { body = {} }
      setResult(body)

      if (body && body.ok) {
        const dev = body?.machine?.ksaveID || body?.machine?.ksaveid || body?.machine?.ksave || ksave
        setSuccess(`Saved successfully${dev ? `: ${dev}` : ''}`)
        setTimeout(() => setSuccess(null), 4000)

        // Refresh machines list
        fetchMachines()
      }

      // clear inputs only on success
      setName('')
      setKsave('')
      setLocation('')
      return body
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(`Save failed: ${msg}`)
      console.error('AddMachine submit error:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await submitMachine()
    } catch (_) {
      // error already set
    }
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Add Machine</h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Register new device </p>
        </div>
        <Link href="/sites" className="k-btn k-btn-ghost">← Back to Sites</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left column - Add form */}
        <div style={{ background: 'white', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb', height: 'fit-content' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>Add New Machine</h2>
          <form onSubmit={handleSubmit}>
            {success && <div style={{ marginBottom: 12, padding: 10, background: '#ecfccb', border: '1px solid #86efac', color: '#065f46', borderRadius: 6 }}>{success}</div>}

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Machine/KSave No.</label>
          <input className="k-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Machine/Series no.</label>
          <input className="k-input" value={ksave} onChange={(e) => setKsave(e.target.value)} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Location / Site.</label>
          <input className="k-input" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="k-btn k-btn-primary" type="submit" disabled={saving || !name.trim() || !ksave.trim()}>{saving ? 'Saving...' : 'Create'}</button>
          <button className="k-btn k-btn-ghost" type="button" onClick={() => { setName(''); setKsave(''); setLocation(''); setResult(null); setError(null) }}>Reset</button>
        </div>

        {error && (
          <div style={{ marginTop: 12, color: '#b91c1c' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Save failed</div>
            <div>{error}</div>
            <div style={{ marginTop: 8 }}>
              <button className="k-btn k-btn-primary" type="button" onClick={() => submitMachine() } disabled={saving}>Retry</button>
            </div>
          </div>
        )}

            {result && <pre style={{ marginTop: 12, background: '#f8fafc', padding: 8, fontSize: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
          </form>
        </div>

        {/* Right column - Machines list */}
        <div style={{ background: 'white', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Registered Machines ({machines.length})</h2>
            <button
              onClick={fetchMachines}
              disabled={loadingMachines}
              className="k-btn k-btn-ghost"
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              {loadingMachines ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {loadingMachines && machines.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading machines...</div>
          ) : machines.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <div>No machines registered yet</div>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Device Name</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>KSAVE ID</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Location</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine, idx) => (
                    <tr
                      key={machine.deviceID || idx}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        background: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}
                    >
                      <td style={{ padding: '12px 8px', color: '#374151' }}>
                        {machine.deviceName || '—'}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#374151', fontFamily: 'monospace' }}>
                        {machine.ksaveID || '—'}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                        {machine.location || '—'}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          background: machine.status === 'ON' || machine.status === 'active' ? '#dcfce7' : '#f3f4f6',
                          color: machine.status === 'ON' || machine.status === 'active' ? '#166534' : '#6b7280'
                        }}>
                          {machine.status || 'unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
