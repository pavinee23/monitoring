"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetValuesPage() {
  const router = useRouter()
  const [device, setDevice] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [writeToken, setWriteToken] = useState<string>('')
  const [selectedAt, setSelectedAt] = useState<string>('')
  const [foundRows, setFoundRows] = useState<any[] | null>(null)

  // power_before fields
  const [b_kWh, setB_kWh] = useState<string>('')
  const [b_P, setB_P] = useState<string>('')
  const [b_Q, setB_Q] = useState<string>('')
  const [b_S, setB_S] = useState<string>('')
  const [b_PF, setB_PF] = useState<string>('')
  const [b_THD, setB_THD] = useState<string>('')
  const [b_F, setB_F] = useState<string>('')

  // power_metrics fields
  const [m_kWh, setM_kWh] = useState<string>('')
  const [m_P, setM_P] = useState<string>('')
  const [m_Q, setM_Q] = useState<string>('')
  const [m_S, setM_S] = useState<string>('')
  const [m_PF, setM_PF] = useState<string>('')
  const [m_THD, setM_THD] = useState<string>('')
  const [m_F, setM_F] = useState<string>('')

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        time: selectedAt || undefined,
        device: device || undefined,
        location: location || undefined,
        power_before: {
          kWh: b_kWh ? Number(b_kWh) : undefined,
          P: b_P ? Number(b_P) : undefined,
          Q: b_Q ? Number(b_Q) : undefined,
          S: b_S ? Number(b_S) : undefined,
          PF: b_PF ? Number(b_PF) : undefined,
          THD: b_THD ? Number(b_THD) : undefined,
          F: b_F ? Number(b_F) : undefined,
        },
        power_metrics: {
          kWh: m_kWh ? Number(m_kWh) : undefined,
          P: m_P ? Number(m_P) : undefined,
          Q: m_Q ? Number(m_Q) : undefined,
          S: m_S ? Number(m_S) : undefined,
          PF: m_PF ? Number(m_PF) : undefined,
          THD: m_THD ? Number(m_THD) : undefined,
          F: m_F ? Number(m_F) : undefined,
        }
      }

      // send to existing write endpoint (assumes it accepts this JSON shape)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (writeToken) headers['x-write-token'] = writeToken

      const res = await fetch('/api/influx/write', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult(`Failed: ${body?.error || res.status}`)
      } else {
        // show more detailed response for debugging
        setResult(JSON.stringify(body, null, 2))
        // clear inputs on successful save
        setDevice('')
        setLocation('')
        setSelectedAt('')
        setB_kWh('')
        setB_P('')
        setB_Q('')
        setB_S('')
        setB_PF('')
        setB_THD('')
        setB_F('')
        setM_kWh('')
        setM_P('')
        setM_Q('')
        setM_S('')
        setM_PF('')
        setM_THD('')
        setM_F('')
      }
    } catch (err: any) {
      setResult(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  async function handleFindAt() {
    if (!selectedAt) return setResult('Please choose date/time')
    setLoading(true)
    setFoundRows(null)
    setResult(null)
    try {
      const iso = new Date(selectedAt).toISOString()
      const res = await fetch(`/api/influx/currents?at=${encodeURIComponent(iso)}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult(body?.error || 'Failed to fetch readings')
      } else {
        setFoundRows(body.rows || [])
        if ((body.rows || []).length === 0) setResult('No readings found around selected time')
      }
    } catch (err: any) {
      setResult(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  function applyFoundRow(r: any) {
    if (!r) return
    setDevice(r.device || r.ksave || '')
    setLocation(r.location || '')
    // heuristics: map field to a metric input
    const f = (r.field || '').toString().toLowerCase()
    if (f.includes('p')) setM_P(String(r.value ?? ''))
    else if (f.includes('q')) setM_Q(String(r.value ?? ''))
    else if (f.includes('kwh')) setM_kWh(String(r.value ?? ''))
    else setM_P(String(r.value ?? ''))
  }

  return (
    <div className="page-shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Set values</h2>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Save Power Before and Power Metrics for a device</div>
        </div>
        <div>
          <button className="k-btn" onClick={() => router.push('/admin')} style={{ padding: '8px 12px', borderRadius: 6 }}>Back</button>
        </div>
      </header>

      <main style={{ marginTop: 18 }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="k-input" type="datetime-local" value={selectedAt} onChange={(e) => setSelectedAt(e.target.value)} />
              <button className="k-btn k-btn-ghost" type="button" onClick={handleFindAt}>Find readings</button>
              {foundRows && foundRows.length > 0 && (
                <div style={{ marginLeft: 8 }}>
                  <small>Found {foundRows.length} readings — click to apply:</small>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, overflowX: 'auto' }}>
                    {foundRows.map((r, idx) => (
                      <div key={idx} onClick={() => applyFoundRow(r)} className="found-row" style={{ cursor: 'pointer' }}>
                        <div className="found-row-time">{new Date(r.time).toLocaleString()}</div>
                        <div className="found-row-device">{r.device || r.ksave}</div>
                        <div className="found-row-field">{r.field}: {r.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="form-row">
              <label>Machine/Series name.</label>
              <input value={device} onChange={e => setDevice(e.target.value)} className="k-input large" />
            </div>
            <div className="form-row">
              <label>Machine/Series no. (device)</label>
              <input value={device} onChange={e => setDevice(e.target.value)} className="k-input large" />
            </div>
            <div className="form-row">
              <label>Location / Site</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className="k-input" />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 6 }}>
              <h4 className="power-section-heading">Power Before</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <input className="k-input" placeholder="kWh" value={b_kWh} onChange={e => setB_kWh(e.target.value)} />
                <input className="k-input" placeholder="P" value={b_P} onChange={e => setB_P(e.target.value)} />
                <input className="k-input" placeholder="Q" value={b_Q} onChange={e => setB_Q(e.target.value)} />
                <input className="k-input" placeholder="S" value={b_S} onChange={e => setB_S(e.target.value)} />
                <input className="k-input" placeholder="PF" value={b_PF} onChange={e => setB_PF(e.target.value)} />
                <input className="k-input" placeholder="THD" value={b_THD} onChange={e => setB_THD(e.target.value)} />
                <input className="k-input" placeholder="F" value={b_F} onChange={e => setB_F(e.target.value)} />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 6 }}>
              <h4 className="power-section-heading">Power Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <input className="k-input" placeholder="kWh" value={m_kWh} onChange={e => setM_kWh(e.target.value)} />
                <input className="k-input" placeholder="P" value={m_P} onChange={e => setM_P(e.target.value)} />
                <input className="k-input" placeholder="Q" value={m_Q} onChange={e => setM_Q(e.target.value)} />
                <input className="k-input" placeholder="S" value={m_S} onChange={e => setM_S(e.target.value)} />
                <input className="k-input" placeholder="PF" value={m_PF} onChange={e => setM_PF(e.target.value)} />
                <input className="k-input" placeholder="THD" value={m_THD} onChange={e => setM_THD(e.target.value)} />
                <input className="k-input" placeholder="F" value={m_F} onChange={e => setM_F(e.target.value)} />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="k-btn k-btn-primary" type="submit" disabled={loading} style={{ padding: '8px 12px', borderRadius: 6, background: '#2563eb', color: '#fff' }}>{loading ? 'Saving…' : 'Save'}</button>
              <button className="k-btn" type="button" onClick={() => { /* reset */ setDevice(''); setLocation(''); setB_kWh(''); setB_P(''); setB_Q(''); setB_S(''); setB_PF(''); setB_THD(''); setB_F(''); setM_kWh(''); setM_P(''); setM_Q(''); setM_S(''); setM_PF(''); setM_THD(''); setM_F(''); setResult(null) }} style={{ padding: '8px 12px', borderRadius: 6 }}>Reset</button>
              {result && <div style={{ marginLeft: 8 }}>{result}</div>}
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
