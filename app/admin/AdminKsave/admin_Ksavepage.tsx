"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AnyObj = Record<string, any>

export default function AdminPage(): React.ReactElement {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [services, setServices] = useState<AnyObj | null>(null)

  const [currents, setCurrents] = useState<AnyObj[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedQuery, setDebouncedQuery] = useState<string>('')
  const [selectedRange, setSelectedRange] = useState<string>('-1h')
  const [selectedDevice, setSelectedDevice] = useState<string>('all')
  // custom start/stop datetime (datetime-local format)
  const [startAt, setStartAt] = useState<string>(() => {
    try {
      const now = new Date()
      const start = new Date(now.getTime() - 60 * 60 * 1000)
      return start.toISOString().slice(0, 16)
    } catch (_) { return '' }
  })
  const [endAt, setEndAt] = useState<string>(() => {
    try { return new Date().toISOString().slice(0, 16) } catch (_) { return '' }
  })

  useEffect(() => { try { setToken(localStorage.getItem('k_system_admin_token')) } catch (_) {} }, [])

  useEffect(() => {
    let mounted = true
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status')
        if (!res.ok) return
        const b = await res.json().catch(() => ({}))
        if (mounted) setServices(b.services)
      } catch (_) {}
    }
    fetchStatus()
    const iv = setInterval(fetchStatus, 5000)
    return () => { mounted = false; clearInterval(iv) }
  }, [])

  useEffect(() => {
    // fetcher can be called from UI (Search button) as well as interval/useEffect
    let mounted = true
    const fetchCurrents = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = `/api/influx/currents?range=${encodeURIComponent(selectedRange)}`
        // if both startAt and endAt are present, prefer explicit start/stop query params
        if (startAt && endAt) {
          const startIso = new Date(startAt).toISOString()
          const endIso = new Date(endAt).toISOString()
          url = `/api/influx/currents?start=${encodeURIComponent(startIso)}&stop=${encodeURIComponent(endIso)}`
        }
        const res = await fetch(url)
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (mounted) setError(body?.error || 'Failed to load currents')
        } else {
          if (mounted) setCurrents(body.rows || body || [])
        }
      } catch (e: any) {
        if (mounted) setError(String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchCurrents()
    const iv = setInterval(fetchCurrents, 15000)
    return () => { mounted = false; clearInterval(iv) }
  }, [selectedRange, startAt, endAt])

  function handleLogout() {
    try { localStorage.removeItem('k_system_admin_token') } catch (_) {}
    router.replace('/admin/AdminKsavelogin')
  }

  // Debounce the search input so filtering doesn't happen on every keystroke
  useEffect(() => {
    const iv = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300)
    return () => clearTimeout(iv)
  }, [searchQuery])

  const devices = useMemo(() => {
    const s = new Set<string>()
    for (const r of currents) {
      const d = (r.device || r.ksave || r.ksave_id || r.device_id || '')?.toString() || ''
      if (d) s.add(d)
    }
    return Array.from(s).sort()
  }, [currents])

  const filtered = useMemo(() => {
    const q = (debouncedQuery || '').trim().toLowerCase()
    return currents.filter((r: AnyObj) => {
      // if a device is selected, filter by exact device/ksave match first
      if (selectedDevice && selectedDevice !== 'all') {
        const rd = (r.device || r.ksave || r.ksave_id || r.device_id || '')?.toString() || ''
        if (rd !== selectedDevice) return false
      }
      if (!q) return true
      // otherwise match across common fields: series name/no, measurement/field, device, ksave, location
      // match across common fields: series name/no, measurement/field, device, ksave, location
      const name = (r.series_name || r.seriesName || (r.series && r.series.name) || '').toString().toLowerCase()
      const no = (r.series_no || r.seriesNo || (r.series && (r.series.no || r.series.number)) || '').toString().toLowerCase()
      const device = (r.device || r.ksave || r.ksave_id || '').toString().toLowerCase()
      const location = (r.location || r.site || '').toString().toLowerCase()
      const measurement = (r.measurement || r._measurement || '').toString().toLowerCase()
      const field = (r.field || r._field || '').toString().toLowerCase()
      return (
        name.includes(q) ||
        no.includes(q) ||
        device.includes(q) ||
        location.includes(q) ||
        measurement.includes(q) ||
        field.includes(q)
      )
    })
  }, [currents, debouncedQuery, selectedDevice])

  const rows = useMemo(() => {
    if (loading) return [<tr key="loading"><td colSpan={17} style={{ padding: 12, textAlign: 'center' }}>Loading…</td></tr>]
    if (error) return [<tr key="error"><td colSpan={17} style={{ padding: 12, textAlign: 'center', color: '#b91c1c' }}>Error: {error}</td></tr>]
    if (!loading && currents.length === 0) return [<tr key="none"><td colSpan={17} style={{ padding: 12, textAlign: 'center' }}>No recent metrics</td></tr>]
    if (filtered.length === 0) return [<tr key="nomatch"><td colSpan={17} style={{ padding: 12, textAlign: 'center' }}>No matching metrics</td></tr>]

    const trs: React.ReactElement[] = []
    const totals = {
      b_kWh: 0, b_P: 0, b_Q: 0, b_S: 0, b_PF: 0, b_THD: 0, b_F: 0,
      m_kWh: 0, m_P: 0, m_Q: 0, m_S: 0, m_PF: 0, m_THD: 0, m_F: 0,
      count: 0
    }

    filtered.forEach((r: AnyObj, i: number) => {
      const before = r.power_before ?? r.before ?? {}
      const metrics = r.power_metrics ?? r.metrics ?? {}

      const b_kWh = Number(before.kWh ?? before.kwh ?? r.power_before_kWh ?? r.kWh ?? 0) || 0
      const b_P = Number(before.P ?? before.p ?? before.active_power ?? r.power_before_P ?? r.P ?? 0) || 0
      const b_Q = Number(before.Q ?? before.q ?? before.reactive_power ?? r.power_before_Q ?? r.Q ?? 0) || 0
      const b_S = Number(before.S ?? before.s ?? before.apparent_power ?? r.power_before_S ?? r.S ?? 0) || 0
      const b_PF = Number((before.PF ?? before.pf ?? before.power_factor ?? r.power_before_PF ?? r.PF ?? 0)) || 0
      const b_THD = Number(before.THD ?? before.thd ?? before.total_harmonic_distortion ?? r.power_before_THD ?? r.THD ?? 0) || 0
      const b_F = Number(before.F ?? before.f ?? before.freq ?? before.frequency ?? r.power_before_F ?? r.F ?? 0) || 0

      const m_kWh = Number(metrics.kWh ?? metrics.kwh ?? r.power_metrics_kWh ?? r.kWh ?? 0) || 0
      const m_P = Number(metrics.P ?? metrics.p ?? metrics.active_power ?? r.power_metrics_P ?? r.P ?? 0) || 0
      const m_Q = Number(metrics.Q ?? metrics.q ?? metrics.reactive_power ?? r.power_metrics_Q ?? r.Q ?? 0) || 0
      const m_S = Number(metrics.S ?? metrics.s ?? metrics.apparent_power ?? r.power_metrics_S ?? r.S ?? 0) || 0
      const m_PF = Number((metrics.PF ?? metrics.pf ?? metrics.power_factor ?? r.power_metrics_PF ?? r.PF ?? 0)) || 0
      const m_THD = Number(metrics.THD ?? metrics.thd ?? metrics.total_harmonic_distortion ?? r.power_metrics_THD ?? r.THD ?? 0) || 0
      const m_F = Number(metrics.F ?? metrics.f ?? metrics.freq ?? metrics.frequency ?? r.power_metrics_F ?? r.F ?? 0) || 0

      totals.b_kWh += b_kWh
      totals.b_P += b_P
      totals.b_Q += b_Q
      totals.b_S += b_S
      totals.b_PF += b_PF
      totals.b_THD += b_THD
      totals.b_F += b_F

      totals.m_kWh += m_kWh
      totals.m_P += m_P
      totals.m_Q += m_Q
      totals.m_S += m_S
      totals.m_PF += m_PF
      totals.m_THD += m_THD
      totals.m_F += m_F

      totals.count += 1

      trs.push(
        <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
          <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{r.time ? new Date(r.time).toLocaleString() : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{r.device || r.ksave || '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{r.location || '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_kWh) ? b_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_P) ? b_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_Q) ? b_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_S) ? b_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_PF) ? b_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_THD) ? b_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(b_F) ? b_F.toFixed(3) : '-'}</td>

          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_kWh) ? m_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_P) ? m_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_Q) ? m_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_S) ? m_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_PF) ? m_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_THD) ? m_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{Number.isFinite(m_F) ? m_F.toFixed(3) : '-'}</td>
        </tr>
      )
    })

    // totals row (sums for kWh, P, Q, S; averages for PF, THD, F)
    const cnt = totals.count || 1
    const avg = (v: number) => (cnt ? (v / cnt) : 0)
    trs.push(
      <tr key="totals" style={{ borderTop: '2px solid #cbd5e1', background: '#fbfdff', fontWeight: 700 }}>
        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>Total</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}></td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8 }}></td>

        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_kWh.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_P.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_Q.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.b_S.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.b_PF).toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.b_THD).toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.b_F).toFixed(3)}</td>

        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_kWh.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_P.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_Q.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{totals.m_S.toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.m_PF).toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.m_THD).toFixed(3)}</td>
        <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{avg(totals.m_F).toFixed(3)}</td>
      </tr>
    )

    return trs
  }, [filtered, loading, error, currents.length])

  return (
    <div className="page-shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin System</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/sites" className="k-btn k-btn-ghost crisp-text">Back to Sites</Link>
          <Link href="/add-machine" className="k-btn k-btn-ghost crisp-text">Add Machine</Link>
          <Link href="/admin/set-values" className="k-btn k-btn-ghost crisp-text">Add Value</Link>

          <button className="k-btn k-btn-primary crisp-text" onClick={handleLogout}>
            {token ? 'Logout' : 'Exit'}
          </button>
        </div>
      </header>

      <section style={{ marginTop: 18 }}>
        <h3>System Services</h3>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>InfluxDB:</strong>
            <span className="clickable-status">{services?.influx?.ok ? 'OK' : services?.influx?.ok === false ? 'Down' : 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Grafana:</strong>
            <span className="clickable-status">{services?.grafana?.ok ? 'OK' : services?.grafana?.ok === false ? 'Down' : 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>MQTT:</strong>
            <span className="clickable-status">{services?.mqtt?.ok ? 'OK' : services?.mqtt?.ok === false ? 'Down' : 'Unknown'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>Telegraf:</strong>
            <span className="clickable-status">{services?.telegraf?.ok ? 'OK' : services?.telegraf?.ok === false ? 'Down' : 'Unknown'}</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
       

        <div style={{ marginTop: 18 }} className="data-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Current readings (from Influx)</h3>
            <div className="controls-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
             
            </div>
          </div>

          <div style={{ height: 8 }} />

          {/* Date/time controls placed inside a small inset card for spacing & clarity */}
          <div className="controls-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220, flex: '0 0 240px' }}>
                <label style={{ fontSize: 12, color: '#374151' }}>From</label>
                <input type="datetime-local" className="k-input" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220, flex: '0 0 240px' }}>
                <label style={{ fontSize: 12, color: '#374151' }}>To</label>
                <input type="datetime-local" className="k-input" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
              </div>
              {/* Search button removed per user request; users can use the lower search input or refresh via range controls */}
            </div>
          </div>

          <div className="search-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="k-input narrow" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
              <option value="all">All devices</option>
              {devices.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input className="k-input narrow" placeholder="Search (series name / no / device / ksave / location)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button className="k-btn k-btn-ghost crisp-text" onClick={async (e) => {
              // visual click feedback: add 'clicked' class briefly
              try { (e.currentTarget as HTMLElement).classList.add('clicked') } catch (_) {}
              setTimeout(() => { try { (e.currentTarget as HTMLElement).classList.remove('clicked') } catch (_) {} }, 260)
              setDebouncedQuery(searchQuery.trim());
              // also trigger a fetch that respects the date selectors and range
              try {
                setLoading(true)
                setError(null)
                let url = `/api/influx/currents?range=${encodeURIComponent(selectedRange)}`
                if (startAt && endAt) {
                  const startIso = new Date(startAt).toISOString()
                  const endIso = new Date(endAt).toISOString()
                  url = `/api/influx/currents?start=${encodeURIComponent(startIso)}&stop=${encodeURIComponent(endIso)}`
                }
                const res = await fetch(url)
                const body = await res.json().catch(() => ({}))
                if (!res.ok) {
                  setError(body?.error || 'Failed to load currents')
                } else {
                  setCurrents(body.rows || body || [])
                }
              } catch (err: any) {
                setError(String(err?.message || err))
              } finally { setLoading(false) }
            }}>Search</button>
          </div>

          <div style={{ marginTop: 12 }} className="k-table-wrapper">
            <table className="k-table">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Time</th>
                <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Device</th>
                <th rowSpan={2} style={{ padding: 8, textAlign: 'left', border: '1px solid #e5e7eb' }}>Site</th>
                <th colSpan={7} className="power-group-header" style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Power (before)</th>
                <th colSpan={7} className="power-group-header" style={{ padding: 8, textAlign: 'center', border: '1px solid #e5e7eb' }}>Power (metrics)</th>
              </tr>
              <tr>
                {['kWh','P','Q','S','PF','THD','F'].map((c) => (
                  <th key={`before-${c}`} style={{ padding: 8, textAlign: c === 'kWh' ? 'right' : 'right', border: '1px solid #e5e7eb' }}>{c}</th>
                ))}
                {['kWh','P','Q','S','PF','THD','F'].map((c) => (
                  <th key={`metrics-${c}`} style={{ padding: 8, textAlign: c === 'kWh' ? 'right' : 'right', border: '1px solid #e5e7eb' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
        </div>
      </section>
    </div>
  )
}





