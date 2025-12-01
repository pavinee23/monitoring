"use client"

import React, { useEffect, useMemo, useState } from 'react'

type CurrentRow = {
  time: string
  device?: string
  p?: number
  q?: number
  s?: number
  // allow other fields
  [k: string]: any
}

function detectPeaks(values: { t: string; v: number }[], windowSize = 3) {
  // Simple local-maximum + threshold detector
  // returns array of {time, value, score}
  if (!values || values.length === 0) return []
  const nums = values.map((x) => x.v)
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length
  const std = Math.sqrt(variance)
  const thresh = mean + std * 0.9 // moderately above average

  const peaks: { time: string; value: number; score: number }[] = []
  for (let i = 1; i < values.length - 1; i++) {
    const v = values[i].v
    if (v > values[i - 1].v && v > values[i + 1].v && v >= thresh) {
      const score = (v - mean) / (std || 1)
      peaks.push({ time: values[i].t, value: v, score })
    }
  }
  // if none found, fallback to top-N
  if (peaks.length === 0) {
    const top = [...values].sort((a, b) => b.v - a.v).slice(0, Math.min(5, values.length))
    top.forEach((t) => peaks.push({ time: t.t, value: t.v, score: (t.v - mean) / (std || 1) }))
  }
  return peaks
}

export default function AnaAIPage(): React.ReactElement {
  const [device, setDevice] = useState<string>('')
  const [range, setRange] = useState<string>('-1h')
  const [rows, setRows] = useState<CurrentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [peaks, setPeaks] = useState<{ time: string; value: number; score: number }[]>([])
  const [summary, setSummary] = useState<string>('')
  const [analyzing, setAnalyzing] = useState<boolean>(false)
  const [lastAnalysis, setLastAnalysis] = useState<number | null>(null)
  const [realtime, setRealtime] = useState<boolean>(false)
  const [intervalMs, setIntervalMs] = useState<number>(5000)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    let iv: ReturnType<typeof setInterval> | null = null

    const fetchCurrents = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = `/api/influx/currents?range=${encodeURIComponent(range)}`
        if (device) url += `&device=${encodeURIComponent(device)}`
        const res = await fetch(url)
        const b = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (mounted) {
            setError(b?.error || 'Failed to fetch currents')
            setRows([])
          }
        } else {
          if (mounted) {
            setRows(b.rows || b || [])
            setLastUpdate(Date.now())
          }
        }
      } catch (e: any) {
        if (mounted) setError(String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // initial fetch
    fetchCurrents()

    if (realtime) {
      iv = setInterval(fetchCurrents, Math.max(1000, intervalMs))
    }

    return () => { mounted = false; if (iv) clearInterval(iv) }
  }, [device, range, realtime, intervalMs])

  const series = useMemo(() => {
    // pick p if available, else s, else q
    return rows
      .map((r) => ({ t: r.time || r._time || r.ts || r.timestamp || String(new Date()), v: Number(r.p ?? r.P ?? r.s ?? r.S ?? r.q ?? r.Q ?? 0) }))
      .filter((x) => Number.isFinite(x.v))
  }, [rows])

  const runAnalysis = () => {
    // protect against concurrent runs
    if (analyzing) return
    setAnalyzing(true)
    try {
      const detected = detectPeaks(series, 3)
      setPeaks(detected)
      // generate a simple 'AI' style textual summary using heuristics
      if (detected.length === 0) {
        setSummary('No significant peaks detected in the selected period.')
      } else {
        const top = [...detected].sort((a, b) => b.value - a.value)[0]
        const avg = series.reduce((s, x) => s + x.v, 0) / (series.length || 1)
        const msg = `Detected ${detected.length} peak(s). Highest peak at ${new Date(top.time).toLocaleString()} with value ${top.value.toFixed(3)} (≈ ${(top.value / (avg || 1)).toFixed(2)}× average). Peaks: ${detected.map(p => `${new Date(p.time).toLocaleTimeString()}:${p.value.toFixed(2)}`).join('; ')}`
        setSummary(msg)
      }
      setLastAnalysis(Date.now())
    } finally {
      setAnalyzing(false)
    }
  }

  // Auto-run analysis whenever series updates in realtime mode (debounced)
  useEffect(() => {
    if (!realtime) return
    // short debounce to avoid spamming analysis on every tick
    const id = setTimeout(() => {
      runAnalysis()
    }, 800)
    return () => clearTimeout(id)
  }, [series, realtime])

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-3">AI Peak Analysis</h1>

      <div className="mb-4 flex gap-2 items-end">
        <div>
          <label className="block text-sm">Device (optional)</label>
          <input value={device} onChange={(e) => setDevice(e.target.value)} className="k-input" placeholder="ksave or device id" />
        </div>
        <div>
          <label className="block text-sm">Range</label>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="k-input">
            <option value="-15m">Last 15 minutes</option>
            <option value="-1h">Last 1 hour</option>
            <option value="-6h">Last 6 hours</option>
            <option value="-24h">Last 24 hours</option>
            <option value="-7d">Last 7 days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Realtime</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input id="realtime" type="checkbox" checked={realtime} onChange={(e) => setRealtime(e.target.checked)} />
            <label htmlFor="realtime" className="text-sm">Enable</label>
            <input value={String(intervalMs)} onChange={(e) => setIntervalMs(Number(e.target.value || 1000))} className="k-input narrow" style={{ width: 100 }} />
            <span className="text-sm">ms</span>
          </div>
        </div>
        <div>
          <button className="k-btn k-btn-primary" onClick={runAnalysis} disabled={loading}>Generate AI Analysis</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        {loading && <div>Loading data…</div>}
        {lastUpdate && <div className="text-sm text-muted-foreground">Last update: {new Date(lastUpdate).toLocaleTimeString()}</div>}
        {realtime && <div className="text-sm text-green-600">Realtime ON</div>}
      </div>
      {error && <div className="text-red-600">Error: {error}</div>}

      <section className="mb-4">
        <h2 className="font-semibold">Summary</h2>
        <div className="p-3 bg-white border rounded min-h-[48px]">{summary || 'Press Generate AI Analysis to detect peaks.'}</div>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Detected Peaks</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Time</th>
              <th className="border px-2 py-1 text-right">Value</th>
              <th className="border px-2 py-1 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {peaks.length === 0 ? (
              <tr><td colSpan={3} className="p-3 text-center">No peaks detected</td></tr>
            ) : peaks.map((p, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{new Date(p.time).toLocaleString()}</td>
                <td className="border px-2 py-1 text-right">{p.value.toFixed(3)}</td>
                <td className="border px-2 py-1 text-right">{p.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-semibold">Raw series preview</h2>
        <div className="overflow-auto max-h-64 border rounded p-2">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="border px-2 py-1">Time</th>
                <th className="border px-2 py-1 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {series.slice(0, 200).map((s, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{new Date(s.t).toLocaleString()}</td>
                  <td className="border px-2 py-1 text-right">{s.v.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
