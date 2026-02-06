"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PanelFrame from '../../components/grafana/PanelFrame'

export default function CompareMonitoringPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<Date>(() => new Date())
  const [siteFilter, setSiteFilter] = useState<string>('All')
  const [seriesNoFilter, setSeriesNoFilter] = useState<string>('All')

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

  // Extract unique sites and series numbers for filters
  const uniqueSites = useMemo(() => {
    const sites = new Set<string>()
    for (const [_, items] of groups) {
      const latest = items[0]
      const site = latest?.location || 'Unknown'
      sites.add(site)
    }
    return Array.from(sites).sort()
  }, [groups])

  const uniqueSeriesNos = useMemo(() => {
    const seriesNos = new Set<string>()
    for (const [device, items] of groups) {
      const latest = items[0]
      const seriesNo = latest?.series_no || latest?.seriesNo || device
      seriesNos.add(seriesNo)
    }
    return Array.from(seriesNos).sort()
  }, [groups])

  // Filter groups based on selected filters
  const filteredGroups = useMemo(() => {
    return groups.filter(([device, items]) => {
      const latest = items[0]
      const site = latest?.location || 'Unknown'
      const seriesNo = latest?.series_no || latest?.seriesNo || device

      const siteMatch = siteFilter === 'All' || site === siteFilter
      const seriesNoMatch = seriesNoFilter === 'All' || seriesNo === seriesNoFilter

      return siteMatch && seriesNoMatch
    })
  }, [groups, siteFilter, seriesNoFilter])

  // ComparisonCard: render a single device card comparing Power Before and Power Metrics
  function ComparisonCard({ device, displayName, items, now }: { device: string; displayName?: string; items: any[]; now: Date }) {
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

    // Extract both Power Before and Power Metrics
    const before = latest?.power_before ?? latest?.before ?? {}
    const metrics = latest?.power_metrics ?? latest?.metrics ?? {}

    // Power Before values
    const before_I = Number(before?.current ?? before?.I ?? 0) || 0
    const before_P = Number(before?.P ?? before?.p ?? 0) || 0
    const before_Q = Number(before?.Q ?? before?.q ?? 0) || 0
    const before_S = Number(before?.S ?? before?.s ?? 0) || 0
    const before_PF = Number(before?.PF ?? before?.pf ?? 0) || 0
    const before_THD = Number(before?.THD ?? before?.thd ?? 0) || 0
    const before_F = Number(before?.F ?? before?.f ?? 0) || 0

    // Power Metrics values (current state)
    const metrics_I = Number(parsed?.current ?? latest?.current ?? metrics?.current ?? latest?._value ?? 0) || 0
    const metrics_P = Number(parsed?.P ?? parsed?.p ?? metrics.P ?? metrics.p ?? latest?.P ?? 0) || 0
    const metrics_Q = Number(parsed?.Q ?? parsed?.q ?? metrics.Q ?? metrics.q ?? latest?.Q ?? 0) || 0
    const metrics_S = Number(parsed?.S ?? parsed?.s ?? metrics.S ?? metrics.s ?? latest?.S ?? 0) || 0
    const metrics_PF = Number(parsed?.PF ?? parsed?.pf ?? metrics.PF ?? metrics.pf ?? latest?.PF ?? 0) || 0
    const metrics_THD = Number(parsed?.THD ?? parsed?.thd ?? metrics.THD ?? metrics.thd ?? latest?.THD ?? 0) || 0
    const metrics_F = Number(parsed?.F ?? parsed?.f ?? metrics.F ?? metrics.f ?? latest?.F ?? 0) || 0

    // Calculate savings/differences
    const savings_I = before_I - metrics_I
    const savings_P = before_P - metrics_P
    const savings_Q = before_Q - metrics_Q
    const savings_S = before_S - metrics_S
    const savings_PF = metrics_PF - before_PF // Higher PF is better
    const savings_THD = before_THD - metrics_THD // Lower THD is better
    const savings_F = metrics_F - before_F

    // Calculate percentage savings for power
    const savingsPercent_P = before_P > 0 ? ((savings_P / before_P) * 100) : 0
    const savingsPercent_I = before_I > 0 ? ((savings_I / before_I) * 100) : 0

    // last seen timestamp for this device (used for "Last seen" label)
    const lastSeenDate = latest?.time ? new Date(latest.time) : null
    const lastSeenAgo = timeAgo(lastSeenDate, now)
    const lastSeenStr = lastSeenDate ? lastSeenDate.toLocaleString() : '—'

    return (
      <div key={device} style={{
        minWidth: 600,
        maxWidth: 800,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '2px solid rgba(255,255,255,0.8)',
        transition: 'all 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              {displayName || device}
            </div>
            <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>
              🏢 Site: <span style={{ color: '#334155', fontWeight: 600 }}>{location}</span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              🕐 Last seen: <span style={{ color: '#334155', fontWeight: 600 }}>{lastSeenAgo}</span>
              {lastSeenDate ? ` (${lastSeenStr})` : ''}
            </div>
          </div>
          <div style={{
            padding: '8px 20px',
            borderRadius: 12,
            background: statusOn
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            boxShadow: statusOn
              ? '0 4px 12px rgba(16,185,129,0.4)'
              : '0 4px 12px rgba(245,158,11,0.4)'
          }}>
            {statusOn ? '✓ ON' : '○ OFF'}
          </div>
        </div>

        {/* Info Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '2px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>SERIES NAME</div>
            <div style={{ fontSize: 15, color: '#1e293b', fontWeight: 600 }}>{seriesName || device}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            padding: '12px 16px',
            borderRadius: 12,
            border: '2px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>SERIES NO</div>
            <div style={{ fontSize: 15, color: '#1e293b', fontWeight: 600 }}>{displaySeriesNo || '—'}</div>
          </div>
        </div>

        {/* Power Savings Summary */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: 16,
          color: '#fff',
          boxShadow: '0 6px 20px rgba(16,185,129,0.4)',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚡ Power Savings Analysis
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
                {Number.isFinite(savingsPercent_P) ? savingsPercent_P.toFixed(1) : '0'}%
              </div>
              <div style={{ fontSize: 14, opacity: 0.95, marginTop: 4 }}>Power Reduction</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
                {Number.isFinite(savings_P) ? savings_P.toFixed(2) : '0'} W
              </div>
              <div style={{ fontSize: 14, opacity: 0.95, marginTop: 4 }}>Energy Saved</div>
            </div>
          </div>
        </div>

        {/* Grafana Chart */}
        <div style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          padding: '16px',
          borderRadius: 16,
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#334155',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            📈 Real-time Power Graph
          </div>
          <div style={{
            height: 200,
            borderRadius: 12,
            overflow: 'hidden',
            background: '#fff',
            border: '1px solid #e2e8f0'
          }}>
            <PanelFrame
              uid={process.env.NEXT_PUBLIC_GRAFANA_DASH_UID || 'all-power'}
              panelId={Number(process.env.NEXT_PUBLIC_GRAFANA_PANEL_ID || 2)}
              vars={{ ksave: device }}
              height={200}
            />
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          padding: '20px',
          borderRadius: 16,
          border: '2px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#334155',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            📊 Detailed Comparison
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr 1fr', gap: '8px 12px', fontSize: 14 }}>
            {/* Header Row */}
            <div style={{
              fontWeight: 700,
              color: '#1e293b',
              padding: '10px 12px',
              background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
              borderRadius: 8
            }}>
              Parameter
            </div>
            <div style={{
              fontWeight: 700,
              textAlign: 'right',
              padding: '10px 12px',
              background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
              color: '#991b1b',
              borderRadius: 8
            }}>
              Before
            </div>
            <div style={{
              fontWeight: 700,
              textAlign: 'right',
              padding: '10px 12px',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              color: '#065f46',
              borderRadius: 8
            }}>
              Current
            </div>
            <div style={{
              fontWeight: 700,
              textAlign: 'right',
              padding: '10px 12px',
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              color: '#1e40af',
              borderRadius: 8
            }}>
              Savings
            </div>

            {/* Current (A) */}
            <div style={{
              color: '#475569',
              fontWeight: 600,
              padding: '8px 12px',
              background: '#fff',
              borderRadius: 8
            }}>
              Current (A)
            </div>
            <div style={{
              textAlign: 'right',
              color: '#b91c1c',
              fontWeight: 600,
              padding: '8px 12px',
              background: '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(before_I) ? before_I.toFixed(3) : '-'}
            </div>
            <div style={{
              textAlign: 'right',
              color: '#047857',
              fontWeight: 700,
              padding: '8px 12px',
              background: '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(metrics_I) ? metrics_I.toFixed(3) : '-'}
            </div>
            <div style={{
              textAlign: 'right',
              color: savings_I > 0 ? '#1d4ed8' : '#6b7280',
              fontWeight: 700,
              padding: '8px 12px',
              background: savings_I > 0 ? '#eff6ff' : '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(savings_I) ? `${savings_I > 0 ? '↓' : '↑'} ${Math.abs(savings_I).toFixed(3)}` : '-'}
            </div>

            {/* P (W) */}
            <div style={{ color: '#475569', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              P (W)
            </div>
            <div style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(before_P) ? before_P.toFixed(3) : '-'}
            </div>
            <div style={{ textAlign: 'right', color: '#047857', fontWeight: 700, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(metrics_P) ? metrics_P.toFixed(3) : '-'}
            </div>
            <div style={{
              textAlign: 'right',
              color: savings_P > 0 ? '#1d4ed8' : '#6b7280',
              fontWeight: 700,
              padding: '8px 12px',
              background: savings_P > 0 ? '#eff6ff' : '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(savings_P) ? `${savings_P > 0 ? '↓' : '↑'} ${Math.abs(savings_P).toFixed(3)}` : '-'}
            </div>

            {/* Q (var) */}
            <div style={{ color: '#475569', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              Q (var)
            </div>
            <div style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(before_Q) ? before_Q.toFixed(3) : '-'}
            </div>
            <div style={{ textAlign: 'right', color: '#047857', fontWeight: 700, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(metrics_Q) ? metrics_Q.toFixed(3) : '-'}
            </div>
            <div style={{
              textAlign: 'right',
              color: savings_Q > 0 ? '#1d4ed8' : '#6b7280',
              fontWeight: 700,
              padding: '8px 12px',
              background: savings_Q > 0 ? '#eff6ff' : '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(savings_Q) ? `${savings_Q > 0 ? '↓' : '↑'} ${Math.abs(savings_Q).toFixed(3)}` : '-'}
            </div>

            {/* S (VA) */}
            <div style={{ color: '#475569', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              S (VA)
            </div>
            <div style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(before_S) ? before_S.toFixed(3) : '-'}
            </div>
            <div style={{ textAlign: 'right', color: '#047857', fontWeight: 700, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(metrics_S) ? metrics_S.toFixed(3) : '-'}
            </div>
            <div style={{
              textAlign: 'right',
              color: savings_S > 0 ? '#1d4ed8' : '#6b7280',
              fontWeight: 700,
              padding: '8px 12px',
              background: savings_S > 0 ? '#eff6ff' : '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(savings_S) ? `${savings_S > 0 ? '↓' : '↑'} ${Math.abs(savings_S).toFixed(3)}` : '-'}
            </div>

            {/* PF */}
            <div style={{ color: '#475569', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              PF
            </div>
            <div style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(before_PF) ? before_PF.toFixed(3) : '-'}
            </div>
            <div style={{ textAlign: 'right', color: '#047857', fontWeight: 700, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(metrics_PF) ? metrics_PF.toFixed(3) : '-'}
            </div>
            <div style={{
              textAlign: 'right',
              color: savings_PF > 0 ? '#1d4ed8' : '#6b7280',
              fontWeight: 700,
              padding: '8px 12px',
              background: savings_PF > 0 ? '#eff6ff' : '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(savings_PF) ? `${savings_PF > 0 ? '↑' : '↓'} ${Math.abs(savings_PF).toFixed(3)}` : '-'}
            </div>

            {/* THD */}
            <div style={{ color: '#475569', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              THD
            </div>
            <div style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(before_THD) ? before_THD.toFixed(3) : '-'}
            </div>
            <div style={{ textAlign: 'right', color: '#047857', fontWeight: 700, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(metrics_THD) ? metrics_THD.toFixed(3) : '-'}
            </div>
            <div style={{
              textAlign: 'right',
              color: savings_THD > 0 ? '#1d4ed8' : '#6b7280',
              fontWeight: 700,
              padding: '8px 12px',
              background: savings_THD > 0 ? '#eff6ff' : '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(savings_THD) ? `${savings_THD > 0 ? '↓' : '↑'} ${Math.abs(savings_THD).toFixed(3)}` : '-'}
            </div>

            {/* F (Hz) */}
            <div style={{ color: '#475569', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              F (Hz)
            </div>
            <div style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 600, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(before_F) ? before_F.toFixed(3) : '-'}
            </div>
            <div style={{ textAlign: 'right', color: '#047857', fontWeight: 700, padding: '8px 12px', background: '#fff', borderRadius: 8 }}>
              {Number.isFinite(metrics_F) ? metrics_F.toFixed(3) : '-'}
            </div>
            <div style={{
              textAlign: 'right',
              color: Math.abs(savings_F) < 1 ? '#1d4ed8' : '#6b7280',
              fontWeight: 700,
              padding: '8px 12px',
              background: Math.abs(savings_F) < 1 ? '#eff6ff' : '#fff',
              borderRadius: 8
            }}>
              {Number.isFinite(savings_F) ? `${savings_F > 0 ? '↑' : '↓'} ${Math.abs(savings_F).toFixed(3)}` : '-'}
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          🔄 Refresh Data
        </button>
      </div>
    )
  }

  // Calculate totals for summary cards
  const totals = useMemo(() => {
    let totalDevices = filteredGroups.length
    let totalPowerSaved = 0
    let totalCurrentReduction = 0
    let avgPowerFactor = 0
    let pfCount = 0

    filteredGroups.forEach(([device, items]) => {
      const latest = items[0]
      const before = latest?.power_before ?? latest?.before ?? {}
      const metrics = latest?.power_metrics ?? latest?.metrics ?? {}

      const before_P = Number(before?.P ?? before?.p ?? 0) || 0
      const before_I = Number(before?.current ?? before?.I ?? 0) || 0
      const metrics_P = Number(metrics.P ?? metrics.p ?? 0) || 0
      const metrics_I = Number(metrics?.current ?? metrics?.I ?? 0) || 0
      const metrics_PF = Number(metrics.PF ?? metrics.pf ?? 0) || 0

      totalPowerSaved += (before_P - metrics_P)
      totalCurrentReduction += (before_I - metrics_I)

      if (metrics_PF > 0) {
        avgPowerFactor += metrics_PF
        pfCount++
      }
    })

    avgPowerFactor = pfCount > 0 ? avgPowerFactor / pfCount : 0

    return { totalDevices, totalPowerSaved, totalCurrentReduction, avgPowerFactor }
  }, [filteredGroups])

  return (
    <div style={{
      padding: 20,
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '8px'
          }}>
            📊 Compare Monitoring
          </h1>
          <div style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>
            Power Savings Analysis - Compare Before vs Current Metrics
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => router.push('/sites')}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '2px solid #e2e8f0',
              background: '#fff',
              color: '#475569',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59,130,246,0.4)'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {/* Total Devices */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '2px solid rgba(16,185,129,0.2)'
          }}>
            <div style={{ fontSize: 14, color: '#0f766e', fontWeight: 600, marginBottom: '8px' }}>
              ACTIVE DEVICES
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
              {totals.totalDevices}
            </div>
            <div style={{ fontSize: 13, color: '#14b8a6' }}>
              Devices monitored
            </div>
          </div>

          {/* Total Power Saved */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '2px solid rgba(245,158,11,0.2)'
          }}>
            <div style={{ fontSize: 14, color: '#92400e', fontWeight: 600, marginBottom: '8px' }}>
              TOTAL POWER SAVED
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
              {Number.isFinite(totals.totalPowerSaved) ? totals.totalPowerSaved.toFixed(1) : '0'}
            </div>
            <div style={{ fontSize: 13, color: '#d97706' }}>
              Watts
            </div>
          </div>

          {/* Current Reduction */}
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '2px solid rgba(59,130,246,0.2)'
          }}>
            <div style={{ fontSize: 14, color: '#1e40af', fontWeight: 600, marginBottom: '8px' }}>
              CURRENT REDUCTION
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>
              {Number.isFinite(totals.totalCurrentReduction) ? totals.totalCurrentReduction.toFixed(2) : '0'}
            </div>
            <div style={{ fontSize: 13, color: '#2563eb' }}>
              Amperes
            </div>
          </div>

          {/* Average Power Factor */}
          <div style={{
            background: 'linear-gradient(135deg, #fae8ff, #f3e8ff)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '2px solid rgba(168,85,247,0.2)'
          }}>
            <div style={{ fontSize: 14, color: '#6b21a8', fontWeight: 600, marginBottom: '8px' }}>
              AVG POWER FACTOR
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#a855f7', marginBottom: '4px' }}>
              {Number.isFinite(totals.avgPowerFactor) ? totals.avgPowerFactor.toFixed(3) : '0.000'}
            </div>
            <div style={{ fontSize: 13, color: '#9333ea' }}>
              Power factor
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>🏢 Site:</label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 15,
                border: '2px solid #e2e8f0',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 500,
                color: '#475569',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="All">All Sites</option>
              {uniqueSites.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>🔢 Series No:</label>
            <select
              value={seriesNoFilter}
              onChange={(e) => setSeriesNoFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 15,
                border: '2px solid #e2e8f0',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 500,
                color: '#475569',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="All">All Series</option>
              {uniqueSeriesNos.map(seriesNo => (
                <option key={seriesNo} value={seriesNo}>{seriesNo}</option>
              ))}
            </select>
          </div>

          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#64748b',
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            padding: '10px 20px',
            borderRadius: 10,
            border: '2px solid #e2e8f0'
          }}>
            📊 Showing {filteredGroups.length} of {groups.length} devices
          </div>
        </div>
      </section>

      <main style={{ marginTop: 0 }}>
        {loading ? (
          <div>Loading…</div>
        ) : error ? (
          <div style={{ color: '#b91c1c' }}>Error: {error}</div>
        ) : (
          <div>
            {rows.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center' }}>No recent readings</div>
            ) : filteredGroups.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center', color: '#6b7280' }}>
                No devices match the selected filters
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                {filteredGroups.map(([device, items], idx) => {
                  // display names: KSave01, KSave02, ...
                  const displayName = `KSave${String(idx + 1).padStart(2, '0')}`
                  return <ComparisonCard key={device} device={device} displayName={displayName} items={items} now={now} />
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
