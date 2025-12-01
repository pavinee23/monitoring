"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MonitorPower_MetricsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // reuse currents endpoint; filter for power_metrics measurement/fields
        const res = await fetch('/api/influx/currents')
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (mounted) setError(body?.error || 'Failed to load')
          return
        }
        const all = body.rows || []
        const filtered = all.filter((r: any) => String((r._measurement || r.measurement || '')).toLowerCase().includes('power_metrics') || String((r._measurement || r.measurement || '')).toLowerCase().includes('power-metrics') || String((r._field || '')).toLowerCase().includes('power') || String((r._field || '')).toLowerCase().includes('metric'))
        if (mounted) setRows(filtered.length ? filtered : all)
      } catch (e: any) {
        if (mounted) setError(String(e?.message || e))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Monitor Power Metrics</h2>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Power metrics (kWh, avg/max, derived fields)</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="k-btn" onClick={() => router.push('/sites')} style={{ padding: '8px 12px', borderRadius: 6 }}>Back</button>
          <button className="k-btn k-btn-primary" onClick={() => window.location.reload()} style={{ padding: '8px 12px', borderRadius: 6, background: '#2563eb', color: '#fff' }}>Refresh</button>
        </div>
      </header>

      <main style={{ marginTop: 18 }}>
        {loading ? (
          <div>Loading…</div>
        ) : error ? (
          <div style={{ color: '#b91c1c' }}>Error: {error}</div>
        ) : (
          <div style={{ overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Time</th>
                      <th style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Device</th>
                      <th style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Site</th>
                      <th style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Measurement</th>
                      <th style={{ padding: 8, textAlign: 'right', border: '1px solid #e5e7eb' }}>Value</th>
                    </tr>
                  </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 12, textAlign: 'center' }}>No recent metrics</td></tr>
                ) : rows.map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.time ? new Date(r.time).toLocaleString() : '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.device || r.ksave || '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.location || '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.measurement || r._measurement || r._field || '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'right' }}>{typeof r.value === 'number' ? r.value.toFixed(3) : r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
