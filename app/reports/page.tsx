"use client"

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type AnyObj = Record<string, any>

function AdminPageContent(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deviceParam = searchParams.get('device')
  const [token, setToken] = useState<string | null>(null)

  // Add professional print styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        @page {
          size: A4 landscape;
          margin: 12mm 10mm 15mm 10mm;
        }
        body {
          counter-reset: page 1;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body, html {
          background: white !important;
        }
        .print\\:hidden { display: none !important; }
        .page-shell {
          margin: 0;
          padding: 8mm;
          width: 100%;
          max-width: none;
          font-family: 'Times New Roman', Times, serif;
          background: white !important;
          position: relative;
          border: 2px solid #1e293b;
          box-shadow: inset 0 0 0 1px #64748b;
        }

        /* Official Document Watermark */
        .page-shell::before {
          content: 'OFFICIAL REPORT';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          font-weight: 900;
          color: rgba(16, 185, 129, 0.03);
          z-index: 0;
          pointer-events: none;
          font-family: Arial, sans-serif;
          letter-spacing: 12px;
        }

        section {
          position: relative !important;
          z-index: 1 !important;
        }

        /* Company Logo - Top Right Corner */
        .watermark-logo {
          display: block !important;
          position: absolute !important;
          top: 8mm !important;
          right: 12mm !important;
          width: 120px !important;
          height: 120px !important;
          max-width: none !important;
          opacity: 1 !important;
          z-index: 999 !important;
          pointer-events: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          filter: brightness(1.05) saturate(1.1) !important;
          background: white !important;
          padding: 8px !important;
          border: 2px solid #10b981 !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }

        section > div {
          position: relative !important;
          z-index: 2 !important;
        }

        /* Page Number with Document Info */
        .print-page-number {
          display: block !important;
          position: fixed;
          bottom: 8mm;
          right: 12mm;
          text-align: right;
          font-size: 10px;
          color: #1e293b;
          font-family: 'Times New Roman', serif;
          font-weight: 600;
          border-top: 1px solid #94a3b8;
          padding-top: 3mm;
          width: 80mm;
        }
        .print-page-number::before {
          content: "Page " counter(page) " | Document Date: " attr(data-date);
        }
        .print-page-number::after {
          content: "K Energy Save Co., Ltd. - Carbon Credit Report";
          display: block;
          font-size: 8px;
          color: #64748b;
          margin-top: 2px;
          font-style: italic;
        }

        /* Header - Official Document Style */
        header {
          display: block !important;
          margin-bottom: 8px;
          padding: 6mm;
          text-align: center;
          page-break-after: avoid;
          border: 2px solid #10b981;
          background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%) !important;
          border-radius: 6px;
          position: relative;
        }

        header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981, #059669, #10b981);
        }

        header h1 {
          display: block !important;
          font-size: 24px !important;
          margin: 0 0 6px 0 !important;
          font-weight: bold;
          line-height: 1.2;
          color: #065f46 !important;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: 'Times New Roman', serif;
        }

        header p {
          display: block !important;
          font-size: 12px !important;
          margin: 3px 0 !important;
          font-weight: 500;
          color: #334155 !important;
          font-style: italic;
        }

        /* Company Info Section */
        section:first-of-type {
          border: 1px solid #cbd5e1;
          background: #f8fafc !important;
          padding: 4mm !important;
          margin-bottom: 5mm !important;
          border-radius: 4px;
        }

        section:first-of-type h3 {
          display: block !important;
          font-size: 11px !important;
          margin: 2px 0 !important;
          font-weight: 600 !important;
          line-height: 1.4;
          color: #1e293b !important;
        }

        /* Data Period Section */
        section:nth-of-type(2) > div {
          border: 2px solid #3b82f6 !important;
          background: #eff6ff !important;
          padding: 4mm !important;
          border-radius: 4px;
        }

        section:nth-of-type(2) h3 {
          font-size: 13px !important;
          font-weight: bold !important;
          color: #1e40af !important;
          margin-bottom: 3mm !important;
        }

        /* Table Container */
        .k-table-wrapper {
          overflow: visible;
          width: 100%;
          border: 2px solid #334155;
          border-radius: 4px;
          margin-top: 4mm;
        }

        /* Professional Table Styling */
        table.k-table {
          font-size: 9px !important;
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          table-layout: auto;
          font-family: Arial, sans-serif;
        }

        .k-table th {
          padding: 4px 6px !important;
          font-size: 10px !important;
          font-weight: bold;
          text-align: center !important;
          border: 1px solid #1e293b !important;
          background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%) !important;
          line-height: 1.3;
          white-space: nowrap;
          min-width: 35px;
          color: #0f172a !important;
        }

        .k-table thead tr:first-child th {
          background: linear-gradient(180deg, #1e293b 0%, #334155 100%) !important;
          color: white !important;
          font-size: 11px !important;
          padding: 5px 6px !important;
        }

        .k-table td {
          padding: 3px 5px !important;
          font-size: 9px !important;
          border: 0.5px solid #475569 !important;
          text-align: center !important;
          line-height: 1.3;
          white-space: nowrap;
          overflow: visible;
          color: #1e293b !important;
        }

        .k-table td:nth-child(1),
        .k-table td:nth-child(2),
        .k-table td:nth-child(3) {
          text-align: left !important;
          font-size: 9px !important;
          white-space: nowrap;
          font-weight: 500;
        }

        .k-table thead th {
          height: auto;
          vertical-align: middle;
          white-space: nowrap;
        }

        .k-table tbody tr {
          height: auto;
          page-break-inside: avoid;
        }

        .k-table tbody tr:nth-child(even) {
          background: #f8fafc !important;
        }

        .k-table tbody tr:nth-child(odd) {
          background: white !important;
        }

        /* Total Row - Highlighted */
        .k-table tbody tr:last-child {
          background: linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%) !important;
          font-weight: bold !important;
          border-top: 3px double #1e40af !important;
          border-bottom: 3px double #1e40af !important;
        }

        .k-table tbody tr:last-child td {
          font-size: 10px !important;
          font-weight: bold !important;
          padding: 4px 5px !important;
          color: #1e40af !important;
        }

        /* ER Column - Highlighted for Carbon Credits */
        .k-table td:last-child {
          background: linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%) !important;
          color: #065f46 !important;
          font-weight: bold !important;
          white-space: nowrap;
          border-left: 2px solid #10b981 !important;
        }

        /* Document Footer */
        .page-shell::after {
          content: '';
          display: block;
          position: fixed;
          bottom: 8mm;
          left: 12mm;
          right: 12mm;
          height: 1px;
          background: linear-gradient(90deg, transparent, #94a3b8, transparent);
        }

        /* Signature Area (can be added to the page) */
        .signature-section {
          display: flex !important;
          justify-content: space-between;
          margin-top: 15mm;
          padding-top: 8mm;
          border-top: 2px solid #e2e8f0;
          page-break-inside: avoid;
        }

        .signature-box {
          width: 40%;
          text-align: center;
          border: 1px solid #cbd5e1;
          padding: 8mm;
          background: #fafafa !important;
        }

        .signature-line {
          border-top: 1px solid #1e293b;
          margin: 15mm auto 3mm;
          width: 60%;
        }

        /* Security Features */
        .security-pattern {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20mm;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(16, 185, 129, 0.02) 10px,
            rgba(16, 185, 129, 0.02) 20px
          );
          z-index: 0;
          pointer-events: none;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
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

  useEffect(() => {
    try { setToken(localStorage.getItem('k_system_admin_token')) } catch (_) {}
    // Set device from URL parameter
    if (deviceParam) setSelectedDevice(deviceParam)
  }, [deviceParam])

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
    const result = currents.filter((r: AnyObj) => {
      // if a device is selected, filter by exact device/ksave match first
      if (selectedDevice && selectedDevice !== 'all') {
        const rd = (r.device || r.ksave || r.ksave_id || r.device_id || '')?.toString().toUpperCase() || ''
        const selectedUpper = selectedDevice.toUpperCase()
        // Check both exact match and case-insensitive match
        if (rd !== selectedDevice && rd !== selectedUpper) return false
      }
      if (!q) return true
      // otherwise match across common fields: series name/no, measurement/field, device, ksave, location
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

    // Debug log
    console.log('Filter Debug:', {
      selectedDevice,
      totalCurrents: currents.length,
      filteredCount: result.length,
      sampleDevices: currents.slice(0, 3).map(r => ({
        device: r.device,
        ksave: r.ksave
      }))
    })

    return result
  }, [currents, debouncedQuery, selectedDevice])

  const rows = useMemo(() => {
    if (loading) return [<tr key="loading"><td colSpan={24} style={{ padding: 20, textAlign: 'center', fontSize: 16, color: '#6b7280' }}>Loading…</td></tr>]
    if (error) return [<tr key="error"><td colSpan={24} style={{ padding: 20, textAlign: 'center', fontSize: 16, color: '#dc2626', fontWeight: 600 }}>Error: {error}</td></tr>]
    if (!loading && currents.length === 0) return [<tr key="none"><td colSpan={24} style={{ padding: 20, textAlign: 'center', fontSize: 16, color: '#6b7280' }}>No recent metrics</td></tr>]
    if (filtered.length === 0) return [<tr key="nomatch"><td colSpan={24} style={{ padding: 20, textAlign: 'center', fontSize: 16, color: '#6b7280' }}>No matching metrics</td></tr>]

    const trs: React.ReactElement[] = []
    const totals = {
      b_kWh: 0, b_P: 0, b_Q: 0, b_S: 0, b_PF: 0, b_THD: 0, b_F: 0,
      m_kWh: 0, m_P: 0, m_Q: 0, m_S: 0, m_PF: 0, m_THD: 0, m_F: 0,
      totalER: 0,
      count: 0
    }

    filtered.forEach((r: AnyObj, i: number) => {
      const before = r.power_before ?? r.before ?? {}
      const metrics = r.power_metrics ?? r.metrics ?? {}

      const b_L1 = Number(before.L1 ?? before.l1 ?? r.power_before_L1 ?? 0) || 0
      const b_L2 = Number(before.L2 ?? before.l2 ?? r.power_before_L2 ?? 0) || 0
      const b_L3 = Number(before.L3 ?? before.l3 ?? r.power_before_L3 ?? 0) || 0
      const b_kWh = Number(before.kWh ?? before.kwh ?? r.power_before_kWh ?? r.kWh ?? 0) || 0
      const b_P = Number(before.P ?? before.p ?? before.active_power ?? r.power_before_P ?? r.P ?? 0) || 0
      const b_Q = Number(before.Q ?? before.q ?? before.reactive_power ?? r.power_before_Q ?? r.Q ?? 0) || 0
      const b_S = Number(before.S ?? before.s ?? before.apparent_power ?? r.power_before_S ?? r.S ?? 0) || 0
      const b_PF = Number((before.PF ?? before.pf ?? before.power_factor ?? r.power_before_PF ?? r.PF ?? 0)) || 0
      const b_THD = Number(before.THD ?? before.thd ?? before.total_harmonic_distortion ?? r.power_before_THD ?? r.THD ?? 0) || 0
      const b_F = Number(before.F ?? before.f ?? before.freq ?? before.frequency ?? r.power_before_F ?? r.F ?? 0) || 0

      const m_L1 = Number(metrics.L1 ?? metrics.l1 ?? r.power_metrics_L1 ?? 0) || 0
      const m_L2 = Number(metrics.L2 ?? metrics.l2 ?? r.power_metrics_L2 ?? 0) || 0
      const m_L3 = Number(metrics.L3 ?? metrics.l3 ?? r.power_metrics_L3 ?? 0) || 0
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

      // Calculate ER (Energy Reduction) = Before kWh - After kWh
      const energyReduction = b_kWh - m_kWh
      totals.totalER += energyReduction

      totals.count += 1

      trs.push(
        <tr key={i} style={{ borderTop: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'left', fontSize: '14px', color: '#1e293b' }}>{r.time ? new Date(r.time).toLocaleString() : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'left', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>{r.device || r.ksave || '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'left', fontSize: '14px', color: '#64748b' }}>{r.location || '-'}</td>

          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_L1) && b_L1 > 0 ? b_L1.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_L2) && b_L2 > 0 ? b_L2.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_L3) && b_L3 > 0 ? b_L3.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_kWh) ? b_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_P) ? b_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_Q) ? b_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_S) ? b_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_PF) ? b_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_THD) ? b_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(b_F) ? b_F.toFixed(3) : '-'}</td>

          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_L1) && m_L1 > 0 ? m_L1.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_L2) && m_L2 > 0 ? m_L2.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_L3) && m_L3 > 0 ? m_L3.toFixed(2) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_kWh) ? m_kWh.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_P) ? m_P.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_Q) ? m_Q.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_S) ? m_S.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_PF) ? m_PF.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_THD) ? m_THD.toFixed(3) : '-'}</td>
          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{Number.isFinite(m_F) ? m_F.toFixed(3) : '-'}</td>

          <td style={{ border: '1px solid #e2e8f0', padding: 10, textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#059669', background: 'rgba(16, 185, 129, 0.05)' }}>
            {Number.isFinite(energyReduction) && energyReduction > 0 ?
              `${(energyReduction * 0.5135).toFixed(4)} kgCO₂` : '-'}
          </td>
        </tr>
      )
    })

    // totals row (sums for kWh, P, Q, S; averages for PF, THD, F)
    const cnt = totals.count || 1
    const avg = (v: number) => (cnt ? (v / cnt) : 0)
    trs.push(
      <tr key="totals" style={{ borderTop: '3px solid #3b82f6', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', fontWeight: 700, fontSize: '14px' }}>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#1e40af' }}>
          <strong>📊 TOTAL ({cnt})</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, background: 'transparent' }}></td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, background: 'transparent' }}></td>

        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#1e40af', fontSize: '15px' }}>
          <strong>{totals.b_kWh.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#1e40af', fontSize: '15px' }}>
          <strong>{totals.b_P.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#1e40af', fontSize: '15px' }}>
          <strong>{totals.b_Q.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#1e40af', fontSize: '15px' }}>
          <strong>{totals.b_S.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#1e40af', fontSize: '15px' }}>
          <strong>{avg(totals.b_PF).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#1e40af', fontSize: '15px' }}>
          <strong>{avg(totals.b_THD).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#1e40af', fontSize: '15px' }}>
          <strong>{avg(totals.b_F).toFixed(3)}</strong>
        </td>

        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center' }}></td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#059669', fontSize: '15px' }}>
          <strong>{totals.m_kWh.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#059669', fontSize: '15px' }}>
          <strong>{totals.m_P.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#059669', fontSize: '15px' }}>
          <strong>{totals.m_Q.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#059669', fontSize: '15px' }}>
          <strong>{totals.m_S.toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#059669', fontSize: '15px' }}>
          <strong>{avg(totals.m_PF).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#059669', fontSize: '15px' }}>
          <strong>{avg(totals.m_THD).toFixed(3)}</strong>
        </td>
        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#059669', fontSize: '15px' }}>
          <strong>{avg(totals.m_F).toFixed(3)}</strong>
        </td>

        <td style={{ border: '1px solid #3b82f6', padding: 12, textAlign: 'center', color: '#065f46', fontSize: '15px', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
          <strong>🌱 {(totals.totalER * 0.5135).toFixed(4)} kgCO₂</strong>
        </td>
      </tr>
    )

    return trs
  }, [filtered, loading, error, currents.length])

  return (
    <div className="page-shell" style={{ position: 'relative', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', minHeight: '100vh', padding: '20px' }}>
      {/* Company logo - only visible when printing */}
      <img
        src="/k-energy-save-logo.jpg"
        alt="K Energy Save"
        className="watermark-logo"
        style={{
          position: 'fixed',
          top: '0%',
          right: '5%',
          width: '160px',
          height: '160px',
          opacity: 1,
          zIndex: 999,
          pointerEvents: 'none',
          objectFit: 'contain',
          display: 'none' // Hidden on screen, visible in print
        }}
      />
      {/* Page number footer - only visible when printing */}
      <div className="print-page-number" style={{ display: 'none' }}></div>

      <header style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              📊 Reports Carbon Credit
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', marginTop: '8px', marginBottom: 0 }}>
              Energy savings and carbon reduction analysis
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="print:hidden">
            <button
              className="k-btn k-btn-secondary crisp-text"
              onClick={() => window.print()}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
            >
              🖨️ Print Report
            </button>
            <Link href="/sites" className="k-btn k-btn-ghost crisp-text" style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 600, background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: 'none' }}>
              ← Back to Sites
            </Link>
            <button className="k-btn k-btn-primary crisp-text" onClick={handleLogout} style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 600, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
              {token ? 'Logout' : 'Exit'}
            </button>
          </div>
        </div>
      </header>

      {/* Summary Cards - Only show on screen, not print */}
      <div className="print:hidden" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Total Energy Saved Card */}
        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', padding: '24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)', border: '2px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Energy Saved</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginTop: '8px' }}>
            {filtered.reduce((sum, r) => {
              const b_kWh = Number((r.power_before?.kWh ?? r.power_before?.kwh ?? r.kWh ?? 0)) || 0
              const m_kWh = Number((r.power_metrics?.kWh ?? r.power_metrics?.kwh ?? r.kWh ?? 0)) || 0
              return sum + (b_kWh - m_kWh)
            }, 0).toFixed(2)} kWh
          </div>
        </div>

        {/* Total CO2 Reduction Card */}
        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', padding: '24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)', border: '2px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total CO₂ Reduction</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#059669', marginTop: '8px' }}>
            {(filtered.reduce((sum, r) => {
              const b_kWh = Number((r.power_before?.kWh ?? r.power_before?.kwh ?? r.kWh ?? 0)) || 0
              const m_kWh = Number((r.power_metrics?.kWh ?? r.power_metrics?.kwh ?? r.kWh ?? 0)) || 0
              return sum + (b_kWh - m_kWh)
            }, 0) * 0.5135).toFixed(2)} kg
          </div>
        </div>

        {/* Total Devices Card */}
        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', padding: '24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)', border: '2px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Devices Monitored</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6', marginTop: '8px' }}>
            {devices.length}
          </div>
        </div>

        {/* Average Power Factor Card */}
        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)', padding: '24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)', border: '2px solid rgba(251, 191, 36, 0.2)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Power Factor</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b', marginTop: '8px' }}>
            {filtered.length > 0 ? (filtered.reduce((sum, r) => {
              const pf = Number((r.power_before?.PF ?? r.power_before?.pf ?? r.PF ?? 0)) || 0
              return sum + pf
            }, 0) / filtered.length).toFixed(3) : '0.000'}
          </div>
        </div>
      </div>

      <section style={{ marginTop: 18, background: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>Company Name: K Energy Save co.,Ltd</h3>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>Address: 1114,27 Dunchon-daero 457beon-gil, Jungwon-gu, Seongnam-si, Gyeonggi-do, Republic of korea</h3>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Date: {new Date().toLocaleString()}</h3>
      </section>

      <section style={{ marginTop: 18, position: 'relative', zIndex: 1 }}>
        <div style={{ marginTop: 18, background: 'rgba(255, 255, 255, 0.95)', padding: '24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>
                📅 Data Collection Period
              </h3>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, display: 'block', marginTop: '8px' }}>
                Period: {startAt && endAt ?
                  `${new Date(startAt).toLocaleString()} - ${new Date(endAt).toLocaleString()}` :
                  `Last ${selectedRange.replace('-', '').replace('h', ' hour').replace('d', ' day').replace('m', ' minute')}`
                }
              </span>
            </div>
          </div>

          <div style={{ height: 8 }} />

          {/* Date/time controls placed inside a small inset card for spacing & clarity */}
          <div className="controls-card print:hidden" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220, flex: '0 0 240px' }}>
                <label style={{ fontSize: 14, color: '#1e293b', fontWeight: 600, marginBottom: '8px' }}>📆 From</label>
                <input type="datetime-local" className="k-input" value={startAt} onChange={(e) => setStartAt(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220, flex: '0 0 240px' }}>
                <label style={{ fontSize: 14, color: '#1e293b', fontWeight: 600, marginBottom: '8px' }}>📆 To</label>
                <input type="datetime-local" className="k-input" value={endAt} onChange={(e) => setEndAt(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px' }} />
              </div>
            </div>
          </div>

          <div className="search-controls print:hidden" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ flex: '0 0 auto', minWidth: 200 }}>
              <label style={{ fontSize: 14, color: '#1e293b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>🔍 Device</label>
              <select className="k-input" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600, border: '2px solid #e2e8f0', background: '#fff', color: '#1e293b', cursor: 'pointer', outline: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
                <option value="all">All devices</option>
                {devices.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 14, color: '#1e293b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>🔎 Search</label>
              <input className="k-input" placeholder="Search by device, location, or measurement" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, fontSize: 16, border: '2px solid #e2e8f0', background: '#fff', outline: 'none' }} />
            </div>
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
            <button className="k-btn k-btn-ghost crisp-text" style={{ padding: '12px 24px', borderRadius: 10, fontWeight: 600, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} onClick={async (e) => {
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
          </div>

          <div style={{ marginTop: 20, background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }} className="k-table-wrapper">
            <table className="k-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
              <tr>
                <th rowSpan={2} style={{ padding: 12, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>🕐 Time</th>
                <th rowSpan={2} style={{ padding: 12, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>📱 Device</th>
                <th rowSpan={2} style={{ padding: 12, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>📍 Site</th>
                <th colSpan={10} className="power-group-header" style={{ padding: 12, textAlign: 'center', border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', fontWeight: 700, fontSize: '14px', color: '#92400e' }}>⚡ Power (before)</th>
                <th colSpan={10} className="power-group-header" style={{ padding: 12, textAlign: 'center', border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', fontWeight: 700, fontSize: '14px', color: '#065f46' }}>⚡ Power (metrics)</th>
                <th rowSpan={2} style={{ padding: 12, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '14px', color: '#1e293b', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}>🌱 ER</th>
              </tr>
              <tr>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>L1</th>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>L2</th>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>L3</th>
                {['kWh','P','Q','S','PF','THD','F'].map((c) => (
                  <th key={`before-${c}`} style={{ padding: 10, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>{c}</th>
                ))}
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>L1</th>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>L2</th>
                <th style={{ padding: 10, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>L3</th>
                {['kWh','P','Q','S','PF','THD','F'].map((c) => (
                  <th key={`metrics-${c}`} style={{ padding: 10, textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '13px', color: '#64748b' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
        </div>
      </section>

      {/* Signature Section - Only visible when printing */}
      <div className="signature-section" style={{ display: 'none', marginTop: '40px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
        <div className="signature-box" style={{ display: 'inline-block', width: '45%', textAlign: 'center', border: '1px solid #cbd5e1', padding: '24px', background: '#fafafa', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Prepared By</div>
          <div className="signature-line" style={{ borderTop: '1px solid #1e293b', margin: '48px auto 12px', width: '60%' }}></div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Technical Department</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Date: {new Date().toLocaleDateString()}</div>
        </div>
        <div className="signature-box" style={{ display: 'inline-block', width: '45%', textAlign: 'center', border: '1px solid #cbd5e1', padding: '24px', background: '#fafafa', borderRadius: '8px', marginLeft: '5%' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Approved By</div>
          <div className="signature-line" style={{ borderTop: '1px solid #1e293b', margin: '48px auto 12px', width: '60%' }}></div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Management</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Date: _______________</div>
        </div>
      </div>

      {/* Security Pattern Footer - Only visible when printing */}
      <div className="security-pattern" style={{ display: 'none' }}></div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  )
}

