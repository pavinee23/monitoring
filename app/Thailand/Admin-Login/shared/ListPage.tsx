"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type Column = { key: string; label: string }

function getAuthHeaders() {
  try { const t = localStorage.getItem('k_system_admin_token') || ''; return t ? { Authorization: `Bearer ${t}` } : {} } catch { return {} }
}

function StatusCell({ current, apiPath, rowId, onUpdate, rowIdKey }: { current: string, apiPath: string, rowId: any, rowIdKey: string, onUpdate?: (val: string, followUp?: any) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current)
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  let options: string[] = ['open', 'in_progress', 'done', 'closed']

  if (apiPath.includes('/purchase-orders')) options = ['pending', 'received', 'cancelled']
  else if (apiPath.includes('/contracts')) options = ['active', 'pending', 'expired', 'terminated', 'completed']
  else if (apiPath.includes('/quotations')) options = ['pending', 'accepted', 'rejected']
  else if (apiPath.includes('/sales-orders')) options = ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled']
  else if (apiPath.includes('/invoices')) options = ['draft', 'issued', 'paid', 'cancelled', 'void']

  if (current && !options.includes(current)) options = [current, ...options]

  const badgeFor = (s: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      open: { label: 'Open', color: '#92400e', bg: '#fff7ed' },
      in_progress: { label: 'In Progress', color: '#1e40af', bg: '#dbeafe' },
      done: { label: 'Done', color: '#166534', bg: '#dcfce7' },
      closed: { label: 'Closed', color: '#991b1b', bg: '#fee2e2' }
    }
    return map[s] || { label: s, color: '#666', bg: '#f5f5f5' }
  }
  const save = async () => {
    if (code !== '1114') { alert('Invalid confirmation code'); return }
    if (!rowId) return alert('Missing id')
    try {
      setSaving(true)
      const method = 'PATCH'
      const body: any = { status: value }
      try { body[rowIdKey] = rowId } catch (_) { body.id = rowId }
      body.id = rowId
      const resp = await fetch(apiPath, { method, headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(body) })
      // Read raw text so we can show helpful error messages for non-JSON replies
      let text: string | null = null
      try { text = await resp.text() } catch (_) { text = null }
      let j: any = null
      if (text) {
        try { j = JSON.parse(text) } catch (_) { j = null }
      }
      if (!resp.ok) {
        const msg = j?.error || j?.message || text || resp.statusText || `HTTP ${resp.status}`
        alert('Failed to update status: ' + msg)
        console.error('Status update failed', { status: resp.status, body: text, json: j })
      } else {
        // Success: either empty/204 or JSON { success: true }
        if (j === null || j.success === undefined || j.success) {
          onUpdate && onUpdate(value, j && j.followUp)
          setEditing(false)
          setCode('')
        } else {
          const msg = j?.error || j?.message || text || `HTTP ${resp.status}`
          alert('Failed to update status: ' + msg)
          console.error('Status update returned failure', { status: resp.status, body: text, json: j })
        }
      }
    } catch (err) {
      console.error('status update error', err)
      alert('Error updating status')
    } finally { setSaving(false) }
  }

  if (!editing) {
    const b = badgeFor(current)
    return (
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: b.color, background: b.bg }}>{b.label}</span>
          <button onClick={() => setEditing(true)} style={{ padding: '6px 8px', borderRadius: 6, background: '#fff', border: '1px solid #e6eef0' }}>Edit</button>
        </div>
      </td>
    )
  }

  return (
    <td>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select value={value} onChange={e => setValue(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6 }}>
          {options.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code to save" style={{ padding: '6px 8px', borderRadius: 6, width: 120 }} />
        <button onClick={save} disabled={saving} className={styles.btnPrimary} style={{ padding: '6px 10px' }}>{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={() => { setEditing(false); setCode(''); setValue(current) }} className={styles.btnOutline} style={{ padding: '6px 10px' }}>Cancel</button>
      </div>
    </td>
  )
}

export default function ListPage({ title, apiPath, createPath, columns, link, print, selectable }: {
  title: string
  apiPath: string
  createPath?: string
  columns: Column[]
  link?: { columnKey: string; path: string; paramName?: string }
  , print?: { path: string; paramName?: string; idKey?: string; newTab?: boolean }
  , selectable?: boolean
  
}) {
  const [locale, setLocale] = useState<'en'|'th'>(() => {
    try { const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang'); return l === 'th' ? 'th' : 'en' } catch { return 'en' }
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const T = (en: string, th: string) => locale === 'th' ? th : en
  const translateLabel = (raw: string) => {
    const r = String(raw || '').toLowerCase()
    if (r.includes('receipt')) return T('Receipt No', 'เลขที่ใบรับเงิน')
    if (r === 'date') return T('Date', 'วันที่')
    if (r.includes('invoice')) return T('Invoice', 'ใบแจ้งหนี้')
    if (r === 'status') return T('Status', 'สถานะ')
    if (r === 'amount') return T('Amount', 'จำนวนเงิน')
    if (r === '+ create' || r === 'create') return T('+ Create', '+ สร้างใหม่')
    return raw
  }
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoiceHasReceipt, setInvoiceHasReceipt] = useState<Record<string, boolean>>({})

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(apiPath, { headers: getAuthHeaders() })
      // Safer JSON parsing: when an HTML error page is returned (starts with '<'), capture text for debugging
      let j: any = null
      try {
        j = await res.json()
      } catch (parseErr) {
        try {
          const text = await res.text()
          console.error('Failed to parse JSON from', apiPath, 'response text:', text)
          setError(`Invalid JSON response from ${apiPath}: ${String(text).slice(0, 200)}`)
        } catch (e) {
          console.error('Failed to read response text for', apiPath, e)
          setError(`Invalid JSON response from ${apiPath}`)
        }
        setRows([])
        return
      }

      if (!res.ok || !j || !j.success) {
        setError(j?.error || j?.message || 'Failed to load')
        setRows([])
      } else {
        let data: any[] = []
        for (const v of Object.values(j)) {
          if (Array.isArray(v)) { data = v; break }
        }
        setRows(data)
      }
    } catch (err: any) { setError(String(err)); setRows([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [apiPath])

  useEffect(() => {
    if (!print) return
    try {
      const p: any = print
      const isInvoiceList = apiPath?.includes('/invoices') || (p?.path && String(p.path).includes('invoice/print'))
      if (!isInvoiceList) return
      const idKey = p?.idKey || p?.paramName || (columns && columns[0]?.key)
      rows.forEach((r: any) => {
        const val = r?.[idKey] ?? r?.[p?.paramName] ?? r?.[columns[0].key]
        if (!val) return
        if (invoiceHasReceipt[val] !== undefined) return
        ;(async () => {
          try {
            const res = await fetch(`/api/receipts?invNo=${encodeURIComponent(String(val))}&limit=1`)
            const j = await res.json().catch(() => null)
            const has = res.ok && j && j.success && Array.isArray(j.receipts) && j.receipts.length > 0
            setInvoiceHasReceipt(prev => ({ ...prev, [val]: !!has }))
          } catch (e) {
            setInvoiceHasReceipt(prev => ({ ...prev, [val]: false }))
          }
        })()
      })
    } catch (e) { /* ignore */ }
  }, [rows, print, apiPath, columns])

  const [modalMessage, setModalMessage] = useState<string | null>(null)

  const handleOpenWithSignatureCheck = async (r: any, c: Column) => {
    try {
      const rowId = r?.receiptID ?? r?.id ?? null
      if (!rowId) {
        // fallback to original link behaviour
        const param = link?.paramName || c.key
        const href = `${link?.path}?${param}=${encodeURIComponent(String(r?.[c.key] ?? ''))}`
        window.location.href = href
        return
      }
      const res = await fetch(`/api/receipts?id=${encodeURIComponent(String(rowId))}`)
      const j = await res.json().catch(() => null)
      if (!res.ok || !j || !j.success || !j.receipt) {
        alert(T('Receipt not found', 'ไม่พบใบเสร็จ'))
        return
      }
      const rec = j.receipt
      const hasSig = Boolean(
        rec?.signature || rec?.signatures || rec?.signed || rec?.received_signature || rec?.verified_signature || rec?.approved_signature || rec?.signed_by || rec?.signature_image || (typeof rec?.notes === 'string' && rec.notes.toLowerCase().includes('signature'))
      )
      if (!hasSig) {
        setModalMessage(T('No signed document yet', 'ยังไม่มีการอนุมัติเซ็นเอกสารใดๆ'))
        setTimeout(() => setModalMessage(null), 6000)
        return
      }
      // open print view
      const p: any = print
      let printPath = String(p?.path || '')
      if (!printPath.includes('/print')) printPath = printPath.replace(/\/$/, '') + '/print'
      const paramName = p?.paramName || p?.idKey || 'receiptID'
      const href = `${printPath}?${paramName}=${encodeURIComponent(String(rowId))}`
      try { window.open(href, '_blank') } catch (e) { window.location.href = href }
    } catch (e) {
      console.error('open with signature check error', e)
      alert(T('Error loading receipt', 'เกิดข้อผิดพลาดขณะเปิดใบเสร็จ'))
    }
  }

  return (
    <>
    <AdminLayout title={locale === 'th' ? (title + '') : title} titleTh={locale === 'th' ? title : title}>
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{T(title, title)}</h2>
          <p className={styles.cardSubtitle}>{T(title, title)}</p>
        </div>
        <div className={styles.cardBody}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {createPath ? (
              <Link href={createPath}>
                <button className={`${styles.btn} ${styles.btnPrimary}`}>{T('+ Create', '+ สร้างใหม่')}</button>
              </Link>
            ) : <div />}
            <div>
              <button onClick={async () => {
                // If this list is the invoices list, pre-generate an invoice number
                try {
                  if (apiPath && apiPath.includes('/invoices')) {
                    try {
                      const today = new Date()
                      const d = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
                      const ts = Date.now()
                      const res = await fetch(`/api/invoice-seq?date=${encodeURIComponent(d)}&_t=${ts}`)
                      const j = await res.json().catch(() => null)
                      if (res.ok && j && j.success && j.invNo) {
                        try { localStorage.setItem('k_system_next_invNo', String(j.invNo)) } catch (_) {}
                        alert('Next invoice number generated: ' + j.invNo)
                      }
                    } catch (e) { /* ignore */ }
                  }
                  // Also support tax-invoice sequence when refreshing tax-invoice lists
                  if (apiPath && apiPath.includes('/tax-invoices')) {
                    try {
                      const ts = Date.now()
                      const res2 = await fetch(`/api/tiv-seq?_t=${ts}`)
                      const j2 = await res2.json().catch(() => null)
                      if (res2.ok && j2 && j2.success && j2.formatted) {
                        try { localStorage.setItem('k_system_next_tivNo', String(j2.formatted)) } catch (_) {}
                        alert('Next tax-invoice number generated: ' + j2.formatted)
                      }
                    } catch (e) { /* ignore */ }
                  }
                } finally {
                  load()
                }
                }} className={styles.btnOutline} disabled={loading}>{loading ? (T('Loading...', 'กำลังโหลด...')) : T('Refresh', 'รีเฟรช')}</button>
            </div>
          </div>

          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map(c => (
                    <th key={c.key}>{translateLabel(c.label || c.key)}</th>
                  ))}
                  {(print || selectable) && <th>{T('Actions', 'การกระทำ')}</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r?.id ?? r?.[columns[0].key] ?? idx}>
                    {columns.map(c => {
                      const v = r?.[c.key]
                      if (link && link.columnKey === c.key) {
                        const param = link.paramName || c.key
                        // For receipts, check signatures before opening print view
                        if (apiPath && apiPath.includes('/receipts')) {
                          return <td key={c.key}><button onClick={() => handleOpenWithSignatureCheck(r, c)} style={{ background: 'transparent', border: 'none', color: '#0b5394', textDecoration: 'underline', cursor: 'pointer' }}>{v ?? '-'}</button></td>
                        }
                        const href = `${link.path}?${param}=${encodeURIComponent(String(v ?? ''))}`
                        return <td key={c.key}><Link href={href}>{v ?? '-'}</Link></td>
                      }
                      if (c.key === 'checklist') {
                        try {
                          const list = Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v) : null)
                          if (Array.isArray(list)) {
                            const texts = list.filter((it: any) => it && (it.ok === true || it.checked === true)).map((it: any) => (it.label_en || it.label || it.label_th || '')).filter(Boolean)
                            return <td key={c.key}>{texts.length ? texts.join(', ') : '-'}</td>
                          }
                        } catch (_) { }
                        return <td key={c.key}>{'-'}</td>
                      }
                      if (c.key === 'photos' || c.key === 'images') {
                        const arr = Array.isArray(v) ? v : []
                        return (
                          <td key={c.key}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              {arr.length === 0 && <span>-</span>}
                              {arr.slice(0, 5).map((img: any) => {
                                const imgUrl = img && img.id ? `/api/pre-installation/image?id=${encodeURIComponent(String(img.id))}` : (img && img.url) || ''
                                if (link && link.columnKey) {
                                  const param = link.paramName || link.columnKey
                                  const rowId = r?.[param] ?? r?.[link.columnKey] ?? r?.id ?? ''
                                  const href = `${link.path}?${param}=${encodeURIComponent(String(rowId))}`
                                  return (
                                    <a key={img.id || imgUrl} href={href}>
                                      <img src={imgUrl} alt={img.filename || 'photo'} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                                    </a>
                                  )
                                }
                                return (
                                  <a key={img.id || imgUrl} href={imgUrl} target="_blank" rel="noreferrer">
                                    <img src={imgUrl} alt={img.filename || 'photo'} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                                  </a>
                                )
                              })}
                            </div>
                          </td>
                        )
                      }

                      if (typeof v === 'number') {
                        const isId = /id$/i.test(c.key)
                        return <td key={c.key}>{isId ? Number(v) : Number(v).toFixed(2)}</td>
                      }

                      if (c.key === 'status') {
                        // For receipts, show simple read-only availability (Used / Available)
                        if (apiPath && apiPath.includes('/receipts')) {
                          const used = !!(r && (r.invoice_no || r.invID || r.invoice_no || r.invoice || r.invoiceNo))
                          return <td key={c.key} style={{ fontWeight: 600 }}>{used ? T('Used', 'ถูกใช้งาน') : T('Available', 'ว่าง')}</td>
                        }
                        const rowIdKey = columns[0].key
                        const rowId = r?.[rowIdKey] ?? r?.id
                        const current = (r && (r.status ?? r[c.key])) || 'open'
                        return (
                          <StatusCell key={c.key} current={current} apiPath={apiPath} rowId={rowId} rowIdKey={rowIdKey} onUpdate={(val, followUp) => {
                            setRows((prev: any[]) => prev.map(it => (it && (it[rowIdKey] === rowId || it.id === rowId)) ? { ...it, status: (followUp && followUp.status) || val, ...(followUp || {}) } : it))
                          }} />
                        )
                      }

                      if (c.key === 'items') {
                        try {
                          const list = Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v) : null)
                          if (Array.isArray(list)) {
                            const texts = list.map((it: any) => {
                              const qty = it?.qty ?? it?.quantity ?? ''
                              const desc = it?.desc || it?.description || it?.name || it?.product_name || ''
                              const unit = it?.unitPrice ?? it?.unit_price ?? it?.price
                              let s = ''
                              if (qty !== '') s += qty + '×'
                              s += desc || '-'
                              if (unit !== undefined && unit !== null && unit !== '') s += ` (${Number(unit).toFixed(2)})`
                              return s
                            })
                            return <td key={c.key} style={{ whiteSpace: 'pre-wrap' }}>{texts.join('\n')}</td>
                          }
                        } catch (_) { }
                        return <td key={c.key}>{v ?? '-'}</td>
                      }

                      if (/created_by$/i.test(c.key) || c.key === 'created_by') {
                        try {
                          const obj = (typeof v === 'string' && v.length > 0) ? JSON.parse(v) : v
                          const name = obj?.name || obj?.username || obj?.userName || obj?.user?.name || obj?.user?.username
                          return <td key={c.key}>{name ?? (typeof v === 'string' ? v : JSON.stringify(v) || '-')}</td>
                        } catch (_) {
                          return <td key={c.key}>{String(v ?? '-')}</td>
                        }
                      }

                      if (typeof v === 'string' && v.length > 0) {
                        if (/id$/i.test(c.key)) {
                          const n = Number(v)
                          if (!isNaN(n)) return <td key={c.key}>{Number.isInteger(n) ? n : Math.trunc(n)}</td>
                        }
                        return <td key={c.key} style={{ whiteSpace: 'pre-wrap' }}>{v}</td>
                      }
                      return <td key={c.key}>{v ?? '-'}</td>
                    })}
                    {(print || selectable) && (
                      <td>
                        {print && (() => {
                          const p: any = print
                          const idKey = p?.idKey || p?.paramName || 'id'
                          const paramName = p?.paramName || idKey
                          const val = r?.[idKey] ?? r?.[paramName] ?? r?.[columns[0].key]
                          if (!val) return <span>-</span>
                          let printPath = String(p.path || '')
                          if (!printPath.includes('/print')) printPath = printPath.replace(/\/$/, '') + '/print'
                          const baseHref = `${printPath}?${paramName}=${encodeURIComponent(String(val))}`
                          const href = baseHref + `&autoPrint=1`

                          const idKey2 = p?.idKey || p?.paramName || columns[0].key
                          const val2 = r?.[idKey2] ?? r?.[p?.paramName] ?? r?.[columns[0].key]
                          const already = val2 ? (invoiceHasReceipt[val2] || (r && (r.status === 'paid' || r.status === 'Paid'))) : false

                          if (already) {
                            return (
                              <button disabled title={T('Invoice already used to create receipt', 'ใบแจ้งหนี้ถูกใช้สร้างใบเสร็จแล้ว')} aria-label="Print disabled" style={{ padding: 4, width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', opacity: 0.4, cursor: 'not-allowed' }}>
                                <img src="/icons/printer-color.png" alt="Print" style={{ width: 28, height: 28, display: 'block', filter: 'grayscale(1)' }} />
                              </button>
                            )
                          }

                            return (
                              <button onClick={() => { try { window.open(href, p?.newTab ? '_blank' : '_self') } catch (e) { window.location.href = href } }} aria-label="Print" title={T('Print', 'พิมพ์')} style={{ padding: 4, width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent' }}>
                                <img src="/icons/printer-color.png" alt="Print" style={{ width: 28, height: 28, display: 'block' }} />
                              </button>
                          )
                        })()}
                      </td>
                    )}
                    {selectable && (
                      // Render Select button; disable if receipt already used
                      <td>
                        {(() => {
                          const used = apiPath && apiPath.includes('/receipts') && !!(r && (r.invoice_no || r.invID || r.invoice || r.invoiceNo))
                          return (
                            <button
                                onClick={() => {
                                  if (!used) {
                                    window.dispatchEvent(new CustomEvent('k-system-list-select', { detail: r }))
                                  }
                                }}
                              aria-label="Select"
                              title={used ? 'Already used' : 'Select'}
                              disabled={used}
                              style={{ padding: '6px 10px', opacity: used ? 0.5 : 1, cursor: used ? 'not-allowed' : 'pointer' }}
                            >
                              Select
                            </button>
                          )
                        })()}
                      </td>
                    )}
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + (print || selectable ? 1 : 0)} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      {loading ? 'Loading...' : 'No records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
    {modalMessage && (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
        <div style={{ background: 'rgba(255,255,255,0.98)', padding: 24, borderRadius: 8, border: '3px solid #ef4444', color: '#b91c1c', fontWeight: 800, fontSize: 18, textAlign: 'center' }}>
          {modalMessage}
        </div>
      </div>
    )}
    </>
  )
}

