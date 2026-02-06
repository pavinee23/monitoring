"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Machine = {
  id: string
  name: string
  status?: string
  power?: string
  ksave?: string
  powerValue?: number
  location?: string
  ipAddress?: string
  beforeMeterNo?: string
  metricsMeterNo?: string
  phone?: string
}
function MachineCard({ m, services, selectedSiteFilter }: { m: Machine; services?: any; selectedSiteFilter?: string }) {
    // Stub for saveDeviceMetrics to prevent TS error
    function saveDeviceMetrics() {
      // TODO: implement saving device metrics if needed
    }
  const [isMounted, setIsMounted] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const [devicePower, setDevicePower] = useState<string | null>(null)
  const [devicePowerValue, setDevicePowerValue] = useState<number | null>(null)
  const [deviceKsave, setDeviceKsave] = useState<string | null>(null)
  const [seriesName, setSeriesName] = useState<string | null>(null)
  const [seriesNo, setSeriesNo] = useState<string | null>(null)
  const [localSeriesNo, setLocalSeriesNo] = useState<string | null>(null)
  const [deviceLocation, setDeviceLocation] = useState<string | null>(null)
  const [deviceSecondsAgo, setDeviceSecondsAgo] = useState<number | null>(null)
  const [deviceReportingOk, setDeviceReportingOk] = useState<boolean | null>(null)
  const router = useRouter()

  // Ensure component only renders on client after mount
  useEffect(() => {
    setIsMounted(true)
    setNow(new Date())
  }, [])

  useEffect(() => {
    if (!isMounted) return
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [isMounted])

  // fetch per-device latest metrics from Influx (best-effort)
  useEffect(() => {
    let mounted = true
    const id = m.ksave || m.id
    if (!id) return
    async function fetchDevice() {
      try {
        const res = await fetch(`/api/influx/device?id=${encodeURIComponent(id)}`)
        if (!res.ok) return
        const body = await res.json()
        if (!mounted) return
        const raw = body.raw || ''
        // if the server already provided parsed fields, use them
        if (body.parsed) {
          if (body.parsed.seriesName) setSeriesName(String(body.parsed.seriesName))
          if (body.parsed.seriesNo) setSeriesNo(String(body.parsed.seriesNo))
          if (body.parsed.location) setDeviceLocation(String(body.parsed.location))
          if (typeof body.parsed.secondsAgo === 'number') setDeviceSecondsAgo(body.parsed.secondsAgo)
          if (typeof body.parsed.ok === 'boolean') setDeviceReportingOk(body.parsed.ok)
        }

        // try to extract a numeric _value from the raw JSON/text as fallback for seriesNo
        const match = String(raw).match(/"_value"\s*:\s*([0-9.+\-eE]+)/)
        if (match) {
          const v = Number(match[1])
          if (!Number.isNaN(v)) {
            setDevicePowerValue(v)
            // keep old devicePower for compatibility but we prefer seriesNo for display
            setDevicePower(`${v} W`)
            if (!seriesNo) setSeriesNo(String(v))
          }
        } else {
          // fallback: look for a number in the text
          const mnum = String(raw).match(/([0-9]+(?:\.[0-9]+)?)/)
          if (mnum) {
            setDevicePower(`${mnum[1]} W`)
            if (!seriesNo) setSeriesNo(String(mnum[1]))
          }
        }

  // try to find a ksave or other name tag in the response as fallback for seriesName
  const mk = String(raw).match(/"ksave"\s*:\s*"([^\"]+)"/i)
  const sMatch = String(raw).match(/"series(?:_name)?"\s*:\s*"([^\"]+)"/i)
  const mMatch = String(raw).match(/"_measurement"\s*:\s*"([^\"]+)"/i)
  if (mk && !seriesName) setSeriesName(mk[1])
  else if (sMatch && !seriesName) setSeriesName(sMatch[1])
  else if (mMatch && !seriesName) setSeriesName(mMatch[1])

  // try to extract a location/site tag for display
  const locMatch = String(raw).match(/"location"\s*:\s*"([^\"]+)"/i)
  const siteMatch = String(raw).match(/"site(?:_name)?"\s*:\s*"([^\"]+)"/i)
  const locTagMatch = String(raw).match(/"loc"\s*:\s*"([^\"]+)"/i)
  if (locMatch && !deviceLocation) setDeviceLocation(locMatch[1])
  else if (siteMatch && !deviceLocation) setDeviceLocation(siteMatch[1])
  else if (locTagMatch && !deviceLocation) setDeviceLocation(locTagMatch[1])
      } catch (e) {
        // ignore
      }
    }
    fetchDevice()
    // no interval to avoid many queries; if you want polling, add an interval here
    return () => { mounted = false }
  }, [m.id, m.ksave])

  // Save metrics to database whenever they change
  useEffect(() => {
    if (seriesName || seriesNo || devicePowerValue || deviceLocation || deviceReportingOk !== null) {
      saveDeviceMetrics()
    }
  }, [seriesName, seriesNo, devicePowerValue, deviceLocation, deviceReportingOk, deviceSecondsAgo])

  // Ensure a stable 10-digit series number per device when Influx doesn't provide one.
  useEffect(() => {
    
    try {
      const idKey = (m.ksave || m.id || '').toString()
      if (!idKey) return
      const storageKey = `seriesNo:${idKey}`
      // If server provided a seriesNo, persist it to localStorage and use it
      if (seriesNo) {
        try { localStorage.setItem(storageKey, seriesNo) } catch (e) {}
        setLocalSeriesNo(seriesNo)
        return
      }
      // otherwise read or generate a stable 10-digit number
      let existing = null
      try { existing = localStorage.getItem(storageKey) } catch (e) { existing = null }
      if (existing) {
        setLocalSeriesNo(existing)
        return
      }
      // generate a 10-digit run number between 1000000000 and 9999999999
      const gen = String(Math.floor(1000000000 + Math.random() * 9000000000))
      try { localStorage.setItem(storageKey, gen) } catch (e) {}
      setLocalSeriesNo(gen)
    } catch (e) {
      // ignore
    }
  }, [m.id, m.ksave, seriesNo])

  return (
    <div className="card crisp-text machine-card" style={{ minWidth: 340, maxWidth: 520, flex: '0 0 auto', marginRight: 12, marginBottom: 12, padding: 20, background: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
      <div className="machine-card-header">
        <div>
          <div className="machine-name" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{m.name}</div>
          <div className="machine-sub" style={{ fontSize: 14, color: '#64748b', marginTop: 8 }} title={deviceLocation ? 'Value from InfluxDB' : (m.location ? 'Value from machine metadata' : (selectedSiteFilter && selectedSiteFilter !== 'All' ? 'Site from current filter' : 'No site tag in InfluxDB'))}>
            📍 Site: {deviceLocation ?? m.location ?? (selectedSiteFilter && selectedSiteFilter !== 'All' ? selectedSiteFilter : '—')}
          </div>
          <div className="machine-sub" style={{ marginTop: 6, fontSize: 14, color: '#64748b' }}>🕐 {isMounted && now ? now.toLocaleString() : '—'}</div>
          <div className="machine-sub" style={{ fontSize: 14, color: '#64748b' }}>
            🌐 IP: {m.ipAddress || (m.ksave ? `${m.ksave.toLowerCase()}.local` : '—')}
          </div>
          <div className="machine-sub" style={{ fontSize: 14, color: '#64748b' }}>
            ⚡ Before Meter No: {m.beforeMeterNo ?? '—'}
          </div>
          <div className="machine-sub" style={{ fontSize: 14, color: '#64748b' }}>
            📊 Metrics Meter No: {m.metricsMeterNo ?? '—'}
          </div>
          <div className="machine-sub" style={{ fontSize: 14, color: '#64748b' }}>
            📞 Phone: {m.phone ?? '—'}
          </div>
        </div>

        <div className={"status-pill " + (deviceReportingOk === true ? 'ok' : 'warn')} style={{ padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: 14, background: deviceReportingOk === true ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
          {deviceReportingOk === true ? 'ON' : 'OFF'}
        </div>
      </div>

      <div className="machine-info-row" style={{ display: 'flex', gap: 16, marginTop: 16, padding: '16px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div className="machine-info" style={{ flex: 1 }}>
          <div className="label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>K-Save ID:</div>
          <div className="value" style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{(seriesName ?? m.ksave ?? m.name) ?? ''}</div>
        </div>
        <div className="machine-info" style={{ flex: 1 }}>
          <div className="label" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Series no:</div>
          <div className="value" style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{(seriesNo ?? localSeriesNo) ?? ''}</div>
        </div>
      </div>

  <div className="machine-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
        <button
          className="k-btn k-btn-ghost machine-action-btn"
          style={{ flex: '0 0 auto', padding: '10px 20px', fontSize: 16, width: 'auto', minWidth: 0, whiteSpace: 'nowrap', fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', borderRadius: '10px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease' }}
          onClick={() => {
            const deviceId = (m.ksave || m.id || '').toUpperCase()

            // KSave01 uses Node-RED Dashboard (updated URL)
            if (deviceId === 'KSAVE01') {
              window.open('https://ksave01-nodered.ngrok.app/ui', '_blank')
            } else {
              // Other devices use new monitoring page
              router.push(`/device-monitoring?device=${encodeURIComponent(m.ksave || m.id || '')}`)
            }
          }}
        >
          📊 Monitoring
        </button>
        <button
          className="k-btn k-btn-ghost machine-action-btn small"
          style={{ padding: '8px 16px', fontSize: 15, width: 'auto', minWidth: 0, whiteSpace: 'nowrap', fontWeight: 600, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', border: 'none', borderRadius: '10px', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
          onClick={() => {
            const deviceId = m.ksave || m.id || ''
            router.push(`/reports?device=${encodeURIComponent(deviceId)}`)
          }}
        >
          📄 Report Carbon
        </button>
        <button
          className="k-btn k-btn-ghost machine-action-btn small"
          style={{ padding: '8px 16px', fontSize: 15, width: 'auto', minWidth: 0, whiteSpace: 'nowrap', fontWeight: 600, background: 'linear-gradient(135deg, #ec4899, #db2777)', color: '#fff', border: 'none', borderRadius: '10px', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)' }}
          onClick={() => {
            const id = m.ksave || m.id || ''
            // navigate to analytics page and pass device id as query param
            router.push(`/analytics/exprolore?device=${encodeURIComponent(id)}`)
          }}
        >
          📈 Peak Analysis
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 16, padding: '12px', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: '8px', background: deviceReportingOk === true ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }} title={deviceSecondsAgo != null ? `Last point ${deviceSecondsAgo} seconds ago` : (deviceReportingOk === true ? 'Connected' : 'Disconnected')}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: deviceReportingOk === true ? '#10B981' : '#EF4444', boxShadow: deviceReportingOk === true ? '0 0 8px rgba(16, 185, 129, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: deviceReportingOk === true ? '#059669' : '#dc2626' }}>Telegraf</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: '8px', background: deviceReportingOk === true ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }} title={deviceSecondsAgo != null ? `Last point ${deviceSecondsAgo} seconds ago` : (deviceReportingOk === true ? 'Connected' : 'Disconnected')}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: deviceReportingOk === true ? '#10B981' : '#EF4444', boxShadow: deviceReportingOk === true ? '0 0 8px rgba(16, 185, 129, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: deviceReportingOk === true ? '#059669' : '#dc2626' }}>Grafana</div>
        </div>
      </div>
    </div>
  )
}

function ServiceCard({ name, status, info }: { name: string; status?: boolean; info?: any }) {
  // show only green (ok) or red (not ok). undefined is treated as not ok (red).
  const bgGradient = status ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)'
  const label = status ? 'Connected' : 'Disconnected'
  return (
    <div className="card service-card crisp-text" title={info ? JSON.stringify(info) : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, borderRadius: 12, background: 'rgba(255, 255, 255, 0.95)', border: `2px solid ${status ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, position: 'relative', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', minWidth: 100 }}>
      <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 700 }}>{name}</div>
      <div style={{ marginTop: 8, padding: '6px 12px', borderRadius: 8, background: bgGradient, color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>{label}</div>
    </div>
  )
}

export default function SitesPage() {
  const router = useRouter()
  const [machines, setMachines] = useState<Machine[]>([])
  const [user, setUser] = useState<string | null>(null)
  const [services, setServices] = useState<any | null>(null)
  const [locationsFromInflux, setLocationsFromInflux] = useState<string[] | null>(null)
  const [devicesData, setDevicesData] = useState<any[]>([])

  // Fetch devices with IP addresses from database (real-time polling every 3 seconds)
  useEffect(() => {
    let mounted = true
    async function fetchDevices() {
      try {
        const res = await fetch('/api/devices')
        if (!res.ok) return
        const body = await res.json()
        if (mounted && body.devices) {
          setDevicesData(body.devices)
        }
      } catch (e) {
        console.error('Failed to fetch devices:', e)
      }
    }
    fetchDevices()
    const interval = setInterval(fetchDevices, 3000) // Poll every 3 seconds for real-time updates
    return () => { 
      mounted = false
      clearInterval(interval)
    }
  }, [])

  // poll service status every 5s
  useEffect(() => {
    let mounted = true
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status')
        if (!res.ok) return
        const body = await res.json()
        if (mounted) setServices(body.services)
      } catch (_) {}
    }
    fetchStatus()
    const iv = setInterval(fetchStatus, 5000)
    return () => {
      mounted = false
      clearInterval(iv)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function fetchTags() {
      try {
        const res = await fetch('/api/influx/tags')
        if (!res.ok) return
        const body = await res.json()
        if (!mounted) return
        if (body && Array.isArray(body.locations)) setLocationsFromInflux(body.locations)
      } catch (e) {
        // ignore
      }
    }
    fetchTags()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (devicesData.length === 0) return
    
    // Load machines from database with real-time data
    const machines = devicesData.map(device => {
      // Map database status: ON -> OK, OFF -> Warning
      const status = device.status === 'ON' ? 'OK' : device.status === 'OFF' ? 'Warning' : 'OK'
      
      return {
        id: device.deviceName,
        name: device.deviceName,
        status: status,
        ksave: device.ksaveID,
        location: device.location,
        ipAddress: device.ipAddress,
        beforeMeterNo: device.beforeMeterNo,
        metricsMeterNo: device.metricsMeterNo,
        phone: device.phone
      }
    })
    
    setMachines(machines)
    try {
      const u = localStorage.getItem('k_system_user')
      setUser(u)
    } catch (_) {}
  }, [devicesData])

  function handleOpenAllBefore() {
    router.push('/monitor/Compare-Monitoring')
  }

  // filters and sorting
  const [locationFilter, setLocationFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortMode, setSortMode] = useState<string>('efficiency_desc')

  const locations = Array.from(new Set(machines.map((m) => m.location || 'Unknown')))

  function getFilteredSortedMachines() {
    let out = machines.slice()
    if (locationFilter !== 'All') {
      out = out.filter((m) => (m.location || 'Unknown') === locationFilter)
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'ON') {
        out = out.filter((m) => (m.status || '') === 'OK')
      } else if (statusFilter === 'OFF') {
        out = out.filter((m) => (m.status || '') === 'Warning')
      } else {
        out = out.filter((m) => (m.status || '') === statusFilter)
      }
    }

    if (sortMode === 'efficiency_desc') {
      // most efficient (lowest powerValue) to least
      out.sort((a, b) => (a.powerValue ?? 0) - (b.powerValue ?? 0))
    } else if (sortMode === 'power_asc') {
      out.sort((a, b) => (a.powerValue ?? 0) - (b.powerValue ?? 0))
    } else if (sortMode === 'power_desc') {
      out.sort((a, b) => (b.powerValue ?? 0) - (a.powerValue ?? 0))
    } else if (sortMode === 'id_asc') {
      // sort by numeric part of device id (e.g., Ksave01 -> 1)
      const extractNumber = (id?: string) => {
        if (!id) return 0
        const m = id.match(/\d+/)
        return m ? parseInt(m[0], 10) : 0
      }
      out.sort((a, b) => extractNumber(a.id) - extractNumber(b.id))
    }
    return out
  }

  return (
    <div className="page-shell" style={{ padding: 20, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: 'rgba(255, 255, 255, 0.9)', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>K System Energy - Monitoring</h2>
          <div style={{ fontSize: 16, color: '#64748b', marginTop: 4 }}>Devices and monitoring overview</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
            <ServiceCard name="InfluxDB" status={services?.influx?.ok} info={services?.influx?.info} />
            <ServiceCard name="Grafana" status={services?.grafana?.ok} info={services?.grafana?.info} />
            <ServiceCard name="Telegraf" status={services?.telegraf?.ok} />
            <ServiceCard name="MQTT" status={services?.mqtt?.ok} />
          </div>
          <button
            className="k-btn k-btn-primary crisp-text"
            onClick={() => window.open('https://connect.momohub.net/app-main.php', '_blank')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              border: 0,
              fontSize: 18,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
            }}
          >
            K-save (Devices Running)
          </button>
          <button
            className="k-btn k-btn-primary crisp-text"
            onClick={handleOpenAllBefore}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              border: 0,
              fontSize: 18,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            📊 Compare
          </button>

        </div>
      </header>

      <section style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <label style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>📍 Site:</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={{ padding: '10px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600, border: '2px solid #e2e8f0', background: '#fff', color: '#1e293b', cursor: 'pointer', outline: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <option value="All">All</option>
            {(locationsFromInflux && locationsFromInflux.length > 0 ? locationsFromInflux : locations).map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <label style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>⚡ Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600, border: '2px solid #e2e8f0', background: '#fff', color: '#1e293b', cursor: 'pointer', outline: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <option value="All">All</option>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>

          <label style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>🔄 Sort:</label>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} style={{ padding: '10px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600, border: '2px solid #e2e8f0', background: '#fff', color: '#1e293b', cursor: 'pointer', outline: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <option value="efficiency_desc">Efficiency: High → Low</option>
            <option value="power_asc">Power: Low → High</option>
            <option value="power_desc">Power: High → Low</option>
            <option value="id_asc">Device no: Low → High</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {getFilteredSortedMachines().map((m) => (
            <MachineCard key={m.id} m={m} services={services} selectedSiteFilter={locationFilter} />
          ))}
        </div>
      </section>
    </div>
  )
}
