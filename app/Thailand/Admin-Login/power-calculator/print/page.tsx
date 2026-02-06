"use client"

import React, { useEffect, useState } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

export default function PowerCalcPrintPage() {
  const searchParams = useSearchParams()
  const calcID = searchParams?.get('calcID') || searchParams?.get('id') || ''
  const auto = searchParams?.get('autoPrint')
  const [calc, setCalc] = useState<any | null>(null)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)

  const paramLangInit = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
  const [selectedLang, setSelectedLang] = useState<'en'|'th'>(() => {
    if (paramLangInit === 'en') return 'en'
    if (paramLangInit === 'th') return 'th'
    try { const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang'); return l === 'th' ? 'th' : 'en' } catch { return 'en' }
  })

  useEffect(() => {
    const handler = (e: any) => {
      try { const d = e?.detail ?? e; const v = typeof d === 'string' ? d : (d?.locale || d); if (v === 'en' || v === 'th') setSelectedLang(v) } catch (err) {}
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => { window.removeEventListener('k-system-lang', handler); window.removeEventListener('locale-changed', handler) }
  }, [])

  useEffect(() => {
    if (!calcID) return
    ;(async () => {
      try {
        const res = await fetch(`/api/power-calculations?id=${encodeURIComponent(calcID)}`)
        const j = await res.json()
        if (res.ok && j && j.success && j.calculation) {
          const c = j.calculation
          try { if (c.parameters && typeof c.parameters === 'string') c.parameters = JSON.parse(c.parameters) } catch (_) {}
          try { if (c.result && typeof c.result === 'string') c.result = JSON.parse(c.result) } catch (_) {}
          setCalc(c)
        }
      } catch (err) { console.error('Failed to load calculation for print', err) }
    })()
  }, [calcID])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) { const u = JSON.parse(raw); setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || '')) }
    } catch {}
    const key = `print_count:power_calc:${calcID || 'unknown'}`
    setPrintCount(parseInt(localStorage.getItem(key) || '0', 10) || 0)
    setLastPrinted(localStorage.getItem(key + ':last') || null)
    const onAfter = () => {
      try {
        const newCnt = (parseInt(localStorage.getItem(key) || '0', 10) || 0) + 1
        const ts = new Date().toLocaleString()
        localStorage.setItem(key, String(newCnt))
        localStorage.setItem(key + ':last', ts)
        setPrintCount(newCnt)
        setLastPrinted(ts)
      } catch (e) { console.error('print count update error', e) }
    }
    ;(window as any).onafterprint = onAfter
    return () => { try { (window as any).onafterprint = null } catch (_) {} }
  }, [calcID])

  useEffect(() => { if (calc && (auto === '1' || auto === 'true')) { setTimeout(() => { try { window.print() } catch(e){} }, 300) } }, [calc, auto])

  if (!calcID) return <div style={{ padding: 20 }}>Missing calcID</div>
  if (!calc) return <div style={{ padding: 20 }}>Loading...</div>

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  const params = calc.parameters || {}
  const res = calc.result || {}

  return (
    <>
      <style>{`
        @media print { .no-print { display: none !important } }
      `}</style>
      <PrintStyles />
      <div className="no-print" style={{ textAlign: 'center', padding: 12, background: '#f0f0f0' }}>
        <button onClick={() => { setSelectedLang('th'); try { localStorage.setItem('locale','th'); localStorage.setItem('k_system_lang','th') } catch(_){} }} style={{ marginRight: 8 }}>{L('ไทย','ไทย')}</button>
        <button onClick={() => { setSelectedLang('en'); try { localStorage.setItem('locale','en'); localStorage.setItem('k_system_lang','en') } catch(_){} }} style={{ marginRight: 8 }}>{L('English','English')}</button>
        <button onClick={() => window.print()} style={{ marginLeft: 12 }}>{L('Print','พิมพ์')}</button>
      </div>

      <div className="a4-page" style={{ ['--theme-color' as any]: '#2b6cb0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottom: '2px solid var(--theme-color)', paddingBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/k-energy-save-logo.jpg" alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--theme-color)' }}>K Energy Save</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>K Energy Save Co., Ltd.</div>
              </div>
            </div>
            <div style={{ marginTop: 8, color: '#666' }}>84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>Tel: 02-080-8916</div>
          </div>

            <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, fontSize: 22, color: 'var(--theme-color)' }}>{L('POWER CALCULATION REPORT','รายงานการคำนวณพลังงาน')}</h1>
            <div style={{ marginTop: 6 }}>{L('Report ID','รหัสรายงาน')}: <strong>{calc.calcID}</strong></div>
            <div>{L('Power No','เลขที่บิล')}: <strong>{calc.power_calcuNo || '-'}</strong></div>
            <div>{L('Created','สร้างเมื่อ')}: {calc.created_at ? new Date(calc.created_at).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US') : '-'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 6, padding: 10, background: '#fafafa' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{L('Customer','ลูกค้า')}</div>
            <div>{(calc.customer && (calc.customer.name || calc.customer.fullname)) || '-'}</div>
            {calc.customer?.phone && <div style={{ marginTop: 6 }}>{L('Phone','โทร')}: {calc.customer.phone}</div>}
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 6, padding: 10, background: '#fafafa' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{L('Inputs','ค่าป้อน')}</div>
            <div>Voltage (V): {params.voltage ?? '-'}</div>
            <div>Current (A): {params.current ?? '-'}</div>
            <div>Power Factor: {params.pf ?? '-'}</div>
            <div>Phase: {params.phase ?? '-'}</div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{L('Appliances','อุปกรณ์')}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="items-table">
            <thead>
              <tr>
                <th style={{ border: '1px solid #eee', padding: 8 }}>{L('Name','ชื่อ')}</th>
                <th style={{ border: '1px solid #eee', padding: 8, textAlign: 'right' }}>{L('Power (W)','กำลัง (W)')}</th>
                <th style={{ border: '1px solid #eee', padding: 8, textAlign: 'center' }}>{L('Qty','จำนวน')}</th>
                <th style={{ border: '1px solid #eee', padding: 8, textAlign: 'center' }}>{L('Hours/day','ชม./วัน')}</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(params.appliances) ? params.appliances : []).map((a: any, i: number) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #eee', padding: 8 }}>{a.name || '-'}</td>
                  <td style={{ border: '1px solid #eee', padding: 8, textAlign: 'right' }}>{Number(a.power || 0).toLocaleString()}</td>
                  <td style={{ border: '1px solid #eee', padding: 8, textAlign: 'center' }}>{a.qty || 1}</td>
                  <td style={{ border: '1px solid #eee', padding: 8, textAlign: 'center' }}>{a.hours || '-'}</td>
                </tr>
              ))}
              {(!params.appliances || params.appliances.length === 0) && (
                <tr><td colSpan={4} style={{ padding: 12, textAlign: 'center', color: '#999' }}>-</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{L('Results','ผลลัพธ์')}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><th style={{ textAlign: 'left', padding: 8, width: 200 }}>Apparent (VA)</th><td style={{ padding: 8 }}>{Number(res.apparent ?? 0).toFixed(2)}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>Real (W)</th><td style={{ padding: 8 }}>{Number(res.real ?? 0).toFixed(2)}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>Reactive (VAR)</th><td style={{ padding: 8 }}>{Number(res.reactive ?? 0).toFixed(2)}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: 8 }}>Estimated Current (A)</th><td style={{ padding: 8 }}>{Number((res.estimated_current ?? 0)).toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
          <div style={{ width: '48%' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{L('Usage History','ประวัติการใช้')}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={{ border: '1px solid #eee', padding: 6 }}>{L('Period','ช่วง')}</th><th style={{ border: '1px solid #eee', padding: 6, textAlign: 'right' }}>{L('kWh','หน่วย')}</th><th style={{ border: '1px solid #eee', padding: 6, textAlign: 'right' }}>{L('Peak kW','พีค kW')}</th></tr></thead>
              <tbody>
                {(Array.isArray(calc.usage_history) ? calc.usage_history : []).map((u: any, i: number) => (
                  <tr key={i}><td style={{ padding: 6 }}>{u.period || '-'}</td><td style={{ padding: 6, textAlign: 'right' }}>{Number(u.kwh || 0).toFixed(2)}</td><td style={{ padding: 6, textAlign: 'right' }}>{u.peak_kw ? Number(u.peak_kw).toFixed(2) : '-'}</td></tr>
                ))}
                {(!calc.usage_history || calc.usage_history.length === 0) && (<tr><td colSpan={3} style={{ padding: 8, textAlign: 'center', color: '#999' }}>-</td></tr>)}
              </tbody>
            </table>
          </div>

          <div style={{ width: '48%' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{L('Notes','หมายเหตุ')}</div>
            <div style={{ minHeight: 120, border: '1px solid #eee', padding: 10, borderRadius: 6, background: '#fff' }}>{(calc.notes || '-')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }} className="signature-section">
          <div style={{ textAlign: 'center', width: '30%' }}>
            <div style={{ borderBottom: '1px solid #333', height: 40, marginBottom: 8 }}></div>
            <div style={{ fontWeight: 700 }}>{L('Prepared By','ผู้จัดทำ')}</div>
          </div>
          <div style={{ textAlign: 'center', width: '30%' }}>
            <div style={{ borderBottom: '1px solid #333', height: 40, marginBottom: 8 }}></div>
            <div style={{ fontWeight: 700 }}>{L('Approved By','ผู้อนุมัติ')}</div>
          </div>
          <div style={{ textAlign: 'center', width: '30%' }}>
            <div style={{ borderBottom: '1px solid #333', height: 40, marginBottom: 8 }}></div>
            <div style={{ fontWeight: 700 }}>{L('Customer','ลูกค้า')}</div>
          </div>
        </div>

        

        <div className="footer-info">
          <span>{L('User:', 'ผู้พิมพ์:')} {loggedUser || '-'}</span>
          <span>{L('Printed:', 'พิมพ์เมื่อ:')} {lastPrinted || new Date().toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
          <span>{L('Print Count:', 'ครั้งที่พิมพ์:')} {printCount + 1}</span>
        </div>
      </div>
    </>
  )
}
