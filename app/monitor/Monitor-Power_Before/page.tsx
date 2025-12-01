"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PanelFrame from '../../components/grafana/PanelFrame'

export default function MonitorPowerBeforePage() {
  const router = useRouter()
  const [rows, setRows] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/influx/currents')
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (mounted) setError(body?.error || 'Failed to load')
          return
        }
        if (mounted) setRows(body.rows || [])
      } catch (e: any) {
        if (mounted) setError(String(e?.message || e))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // update `now` every second so timestamps / "ago" labels refresh in real-time
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  function timeAgo(d: Date | null, ref: Date) {
    if (!d) return ''
    const s = Math.max(0, Math.floor((ref.getTime() - d.getTime()) / 1000))
    if (s < 5) return 'just now'
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const days = Math.floor(h / 24)
    return `${days}d ago`
  }

  // group rows by device/ksave for card rendering
  const groups = useMemo(() => {
    const map = new Map<string, Array<any>>()
    for (const r of rows) {
      const key = (r.device || r.ksave || 'Unknown') as string
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    // compute latest timestamp per group and sort by latest desc
    const entries = Array.from(map.entries()).map(([k, items]) => {
      const latestTime = items.reduce((t, it) => {
        const tm = it?.time ? new Date(it.time).getTime() : 0
        return Math.max(t, tm)
      }, 0)
      return { k, items, latestTime }
    })
    entries.sort((a, b) => b.latestTime - a.latestTime)
    return entries.map(e => [e.k, e.items] as [string, Array<any>])
  }, [rows])

  // DeviceCard: render a single device card and fetch per-device parsed info from /api/influx/device
  function DeviceCard({ device, displayName, items, now }: { device: string; displayName?: string; items: any[]; now: Date }) {
    const router = useRouter()
    const [parsed, setParsed] = useState<any | null>(null)
    const [loadingParsed, setLoadingParsed] = useState(false)

    useEffect(() => {
      let mounted = true
      async function fetchParsed() {
        setLoadingParsed(true)
        try {
          const res = await fetch(`/api/influx/device?id=${encodeURIComponent(device)}`)
          const body = await res.json().catch(() => ({}))
          if (!mounted) return
          if (res.ok && body && body.parsed) setParsed(body.parsed)
        } catch (e) {
          // ignore
        } finally {
          if (mounted) setLoadingParsed(false)
        }
      }
      fetchParsed()
      return () => { mounted = false }
    }, [device])

    const sorted = items.slice().sort((a: any, b: any) => (new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()))
    const latest = sorted[0]

    // prefer parsed values from /api/influx/device when available
    const location = parsed?.location ?? latest?.location ?? '—'
    const seriesName = parsed?.seriesName ?? (latest?.series_name ?? latest?.seriesName ?? latest?.ksave ?? device)
    const seriesNoRaw = parsed?.seriesNo ?? (latest?.series_no ?? latest?.seriesNo ?? '')
    // stable seriesNo: prefer parsed, else stored/generated
    let displaySeriesNo = seriesNoRaw
    if (!displaySeriesNo) {
      try {
        const storageKey = `seriesNo:${device}`
        const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null
        if (stored) displaySeriesNo = stored
        else {
          const gen = String(Math.floor(1000000000 + Math.random() * 9000000000))
          try { localStorage.setItem(storageKey, gen) } catch (_) {}
          displaySeriesNo = gen
        }
      } catch (_) {
        displaySeriesNo = ''
      }
    }

    const statusOn = parsed?.ok ?? latest?.ok ?? false

    // metrics: prefer parsed numeric fields when present, fallback to latest
    const before = latest?.power_before ?? latest?.before ?? {}
    const metrics = latest?.power_metrics ?? latest?.metrics ?? {}
    const currentVal = Number(parsed?.current ?? latest?.current ?? before?.current ?? metrics?.current ?? latest?._value ?? 0) || 0

    const m_P = Number(parsed?.P ?? parsed?.p ?? metrics.P ?? metrics.p ?? latest?.P ?? 0) || 0
    const m_Q = Number(parsed?.Q ?? parsed?.q ?? metrics.Q ?? metrics.q ?? latest?.Q ?? 0) || 0
    const m_S = Number(parsed?.S ?? parsed?.s ?? metrics.S ?? metrics.s ?? latest?.S ?? 0) || 0
    const m_PF = Number(parsed?.PF ?? parsed?.pf ?? metrics.PF ?? metrics.pf ?? latest?.PF ?? 0) || 0
    const m_THD = Number(parsed?.THD ?? parsed?.thd ?? metrics.THD ?? metrics.thd ?? latest?.THD ?? 0) || 0
    const m_F = Number(parsed?.F ?? parsed?.f ?? metrics.F ?? metrics.f ?? latest?.F ?? 0) || 0

    // last seen timestamp for this device (used for "Last seen" label)
    const lastSeenDate = latest?.time ? new Date(latest.time) : null
    const lastSeenAgo = timeAgo(lastSeenDate, now)
    const lastSeenStr = lastSeenDate ? lastSeenDate.toLocaleString() : '—'

    // per-phase extraction (if present)
    const phasesObj: Record<string, any> | null = parsed?.phases ?? parsed?.phaseCurrents ?? metrics?.phases ?? latest?.phases ?? null
    let phaseList: Array<{ name: string; I?: number; V?: number }> = []
    if (phasesObj && typeof phasesObj === 'object' && !Array.isArray(phasesObj)) {
      phaseList = Object.keys(phasesObj).map(k => {
        const entry = phasesObj[k]
        return {
          name: k,
          I: Number(entry?.I ?? entry?.i ?? entry?.current ?? entry?.curr ?? entry) || undefined,
          V: Number(entry?.V ?? entry?.v ?? entry?.voltage) || undefined,
        }
      })
    } else if (Array.isArray(phasesObj)) {
      phaseList = phasesObj.map((entry: any, idx: number) => ({
        name: entry?.name ?? `L${idx + 1}`,
        I: Number(entry?.I ?? entry?.i ?? entry?.current ?? entry) || undefined,
        V: Number(entry?.V ?? entry?.v ?? entry?.voltage) || undefined,
      }))
    }

    return (
      <div key={device} className="card machine-card" style={{ minWidth: 260, maxWidth: 380 }}>
        <div className="machine-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
            <div className="machine-name">{displayName || device}</div>
            <div className="machine-sub">Site: {location}</div>
            <div className="machine-sub" style={{ marginTop: 6 }}>Last seen: {lastSeenAgo}{lastSeenDate ? ` (${lastSeenStr})` : ''}</div>
          </div>
          <div className={"status-pill " + (statusOn ? 'ok' : 'warn')}>
            {statusOn ? 'ON' : 'OFF'}
          </div>
        </div>

        <div className="machine-info-row" style={{ marginTop: 8 }}>
          <div className="machine-info">
            <div className="label">Series name:</div>
            <div className="value">{seriesName || device}</div>
          </div>
          <div className="machine-info">
            <div className="label">Series no:</div>
            <div className="value">{displaySeriesNo || '—'}</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ height: 140, marginBottom: 8 }}>
            <PanelFrame uid={process.env.NEXT_PUBLIC_GRAFANA_DASH_UID || 'all-power'} panelId={Number(process.env.NEXT_PUBLIC_GRAFANA_PANEL_ID || 2)} vars={{ ksave: device }} height={140} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ color: '#374151' }}>Current (A)</div>
            <div style={{ fontWeight: 700, textAlign: 'right' }}>{Number.isFinite(currentVal) ? currentVal.toFixed(3) : '-'}</div>

            <div style={{ color: '#374151' }}>P (W)</div>
            <div style={{ fontWeight: 700, textAlign: 'right' }}>{Number.isFinite(m_P) ? m_P.toFixed(3) : '-'}</div>

            <div style={{ color: '#374151' }}>Q (var)</div>
            <div style={{ fontWeight: 700, textAlign: 'right' }}>{Number.isFinite(m_Q) ? m_Q.toFixed(3) : '-'}</div>

            <div style={{ color: '#374151' }}>S (VA)</div>
            <div style={{ fontWeight: 700, textAlign: 'right' }}>{Number.isFinite(m_S) ? m_S.toFixed(3) : '-'}</div>

            <div style={{ color: '#374151' }}>PF</div>
            <div style={{ fontWeight: 700, textAlign: 'right' }}>{Number.isFinite(m_PF) ? m_PF.toFixed(3) : '-'}</div>

            <div style={{ color: '#374151' }}>THD</div>
            <div style={{ fontWeight: 700, textAlign: 'right' }}>{Number.isFinite(m_THD) ? m_THD.toFixed(3) : '-'}</div>

            <div style={{ color: '#374151' }}>F (Hz)</div>
            <div style={{ fontWeight: 700, textAlign: 'right' }}>{Number.isFinite(m_F) ? m_F.toFixed(3) : '-'}</div>
          </div>

          {phaseList.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>Per-phase</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                <div style={{ fontWeight: 600 }}>Phase</div>
                <div style={{ fontWeight: 600, textAlign: 'right' }}>I (A)</div>
                <div style={{ fontWeight: 600, textAlign: 'right' }}>V (V)</div>
                {phaseList.map(p => (
                  <React.Fragment key={p.name}>
                    <div>{p.name}</div>
                    <div style={{ textAlign: 'right' }}>{p.I != null ? p.I.toFixed(3) : '-'}</div>
                    <div style={{ textAlign: 'right' }}>{p.V != null ? p.V.toFixed(1) : '-'}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            className="k-btn k-btn-ghost machine-action-btn"
            onClick={() => {
              try {
                const grafanaBase = (process.env.NEXT_PUBLIC_GRAFANA_URL) || (typeof window !== 'undefined' && window.location.origin.replace(/:\d+$/, ':3000')) || ''
                const uid = process.env.NEXT_PUBLIC_GRAFANA_DASH_UID || 'all-power'
                const panelId = Number(process.env.NEXT_PUBLIC_GRAFANA_PANEL_ID || 2)
                const q = new URLSearchParams()
                q.set('orgId', '1')
                q.set('panelId', String(panelId))
                q.set('from', 'now-6h')
                q.set('to', 'now')
                q.set(`var-ksave`, String(device))
                const url = `${grafanaBase.replace(/\/$/, '')}/d-solo/${encodeURIComponent(uid)}?${q.toString()}`
                window.open(url, '_blank')
              } catch (e) {
                window.open(process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3000', '_blank')
              }
            }}
          >Open Graph</button>
          <button className="k-btn machine-action-btn small" onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Monitor Power Before</h2>
          <div style={{ fontSize: 13, color: '#6b7280' }}>current readings and power_before values</div>
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
          <div>
            {rows.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center' }}>No recent readings</div>
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {groups.map(([device, items], idx) => {
                  // display names: KSave01, KSave02, ...
                  const displayName = `KSave${String(idx + 1).padStart(2, '0')}`
                  return <DeviceCard key={device} device={device} displayName={displayName} items={items} now={now} />
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

