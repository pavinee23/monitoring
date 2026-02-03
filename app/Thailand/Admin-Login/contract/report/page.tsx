"use client"

import React, { useEffect, useState } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

export default function ContractReportPage() {
  const searchParams = useSearchParams()
  const contractID = searchParams?.get('contractID') || ''
  const [contract, setContract] = useState<any | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedLang, setSelectedLang] = useState<'en'|'th'>(() => {
    try {
      const l = typeof window !== 'undefined' ? (localStorage.getItem('locale') || localStorage.getItem('k_system_lang')) : null
      return l === 'th' ? 'th' : 'en'
    } catch { return 'en' }
  })

  useEffect(() => {
    const handler = (e: any) => {
      try {
        const d = e?.detail ?? e
        const v = typeof d === 'string' ? d : (d?.locale || d)
        if (v === 'en' || v === 'th') setSelectedLang(v)
      } catch (err) {}
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  useEffect(() => {
    if (!contractID) return
    ;(async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetch(`/api/contracts?contractID=${encodeURIComponent(contractID)}`)
        const text = await res.text().catch(() => '')
        let j: any = null
        try { j = text ? JSON.parse(text) : null } catch (e) { j = null }

        if (res.ok && j && j.success) {
          const c = j.contract || (Array.isArray(j.contracts) && j.contracts[0]) || null
          setContract(c)
        } else {
          const serverMsg = (j && (j.error || j.message)) || text || `HTTP ${res.status}`
          console.error('Failed to load contract for report', serverMsg)
          setFetchError(String(serverMsg))
        }
      } catch (e: any) {
        console.error('Failed to load contract for report', e)
        setFetchError(String(e?.message || e))
      } finally {
        setLoading(false)
      }
    })()
  }, [contractID])

    if (!contractID) return <div style={{ padding: 20 }}>Missing contractID</div>
  if (fetchError) return (
    <div style={{ padding: 20 }}>
      <div style={{ color: 'red', fontWeight: 700, marginBottom: 8 }}>Failed to load contract</div>
      <div style={{ marginBottom: 12 }}>{fetchError}</div>
      <div>
        <button onClick={() => { setFetchError(null); window.location.reload() }} style={{ marginRight: 8, padding: '8px 12px' }}>Retry</button>
      </div>
    </div>
  )
  if (loading || !contract) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en

  const customerName = contract.customerName || contract.customer_name || '-'
  const customerAddress = contract.customerAddress || contract.customer_address || '-'
  const contractNo = contract.contractNo || contract.contract_no || '-'
  const contractDate = contract.contractDate || contract.contract_date || ''
  const startDate = contract.startDate || contract.start_date || ''
  const endDate = contract.endDate || contract.end_date || ''
  const totalAmount = Number(contract.totalAmount || contract.total_amount || 0)
  const warrantyPeriod = contract.warrantyPeriod || contract.warranty_period || 0
  const warrantyUnit = contract.warrantyUnit || contract.warranty_unit || 'months'
  const maintenanceScope = contract.maintenanceScope || contract.maintenance_scope || ''
  const contractContent = contract.contractContent || contract.contract_content || ''

  // Parse payment schedule
  let paymentSchedule: any[] = []
  try {
    const ps = contract.paymentSchedule || contract.payment_schedule
    if (typeof ps === 'string') paymentSchedule = JSON.parse(ps)
    else if (Array.isArray(ps)) paymentSchedule = ps
  } catch (e) {}

  const fmtCurrency = (n: number) => n.toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const fmtDate = (d: string) => {
    if (!d) return '-'
    try {
      return new Date(d).toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch { return d }
  }

  const warrantyText = () => {
    const unit = warrantyUnit === 'years' ? L('Years', 'ปี') : warrantyUnit === 'months' ? L('Months', 'เดือน') : L('Days', 'วัน')
    return `${warrantyPeriod} ${unit}`
  }

  // Pre-installation helpers (pull common fields from contract)
  const installationAddress = contract.installationAddress || contract.installation_address || contract.siteAddress || contract.site_address || customerAddress
  const siteContact = contract.siteContact || contract.site_contact || contract.contactName || contract.contact_name || contract.contact || ''
  const devices: any[] = contract.devices || contract.deviceList || contract.items || contract.products || []

  // Receipts data
  const receipts: any[] = contract.receipts || []
  const totalPaid = Number(contract.totalPaid || receipts.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0))
  const remainingBalance = totalAmount - totalPaid

  // Power calculation / report data (try multiple possible contract keys)
  const powerCalcRaw = contract.powerCalculation || contract.power_calc || contract.powerCalculationReport || contract.power_calc_report || contract.powerCalculationHtml || contract.power_calc_html || contract.powerCalculationData || contract.power_calc_data || contract.power_report || contract.powerCalculation_json || contract.power_calc_json || null

  let powerCalcObj: any = null
  try {
    if (typeof powerCalcRaw === 'string') {
      const t = powerCalcRaw.trim()
      try { powerCalcObj = JSON.parse(powerCalcRaw) } catch (e) {
        // keep HTML strings as-is, otherwise wrap as text
        if (t.startsWith('<')) powerCalcObj = powerCalcRaw
        else powerCalcObj = { text: powerCalcRaw }
      }
    } else if (powerCalcRaw) {
      powerCalcObj = powerCalcRaw
    }
  } catch (e) { powerCalcObj = null }

  const renderPowerCalculation = (pc: any) => {
    if (!pc) return null
    if (typeof pc === 'string') {
      return <div style={{ fontSize: 10 }} dangerouslySetInnerHTML={{ __html: pc }} />
    }
    if (Array.isArray(pc)) {
      return (
        <table className="payment-table" style={{ fontSize: 10 }}>
          <thead>
            <tr>
              <th>{L('Item', 'รายการ')}</th>
              <th>{L('Value', 'ค่า')}</th>
            </tr>
          </thead>
          <tbody>
            {pc.map((row: any, i: number) => (
              <tr key={i}>
                <td>{row.label || row.name || `#${i+1}`}</td>
                <td style={{ textAlign: 'right' }}>{row.value ?? JSON.stringify(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    if (typeof pc === 'object') {
      // render key-value pairs
      return (
        <div style={{ fontSize: 10 }}>
          <table className="payment-table" style={{ fontSize: 10 }}>
            <tbody>
              {Object.keys(pc).map((k) => (
                <tr key={k}>
                  <td style={{ fontWeight: 600 }}>{k}</td>
                  <td style={{ textAlign: 'right' }}>{typeof pc[k] === 'object' ? JSON.stringify(pc[k]) : String(pc[k])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            width: 210mm !important;
            height: auto !important;
          }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; }
          .cover-page, .content-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 15mm 18mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
          }
          .cover-page {
            padding: 0 !important;
          }
        }
        @media screen {
          html, body {
            overflow-x: hidden;
          }
          body { background: #e5e5e5; }
        }
        * { box-sizing: border-box; }

        /* Cover Page - friendlier style */
        .cover-page {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          background: #ffffff; /* white background requested */
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          color: #000; /* force black text */
          font-family: 'Sarabun', 'Segoe UI', sans-serif;
          page-break-after: always;
        }

        .cover-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0.0; /* hide subtle pattern on white cover */
        }

        .cover-top-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6mm;
          background: linear-gradient(90deg, #ffd78a, #ffc34d);
        }

        .cover-bottom-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 14mm; /* friendly band at bottom */
          background: linear-gradient(90deg, #fff1d6 0%, #ffd78a 50%, #fff1d6 100%);
        }

        .cover-content {
          text-align: center;
          z-index: 10;
          padding: 0 18mm;
          color: #000; /* force black text per request */
        }

        .cover-logo {
          width: 80mm;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .cover-logo-container {
          background: #ffffff;
          padding: 14px 20px;
          border-radius: 8px; /* rectangular with small radius */
          margin-bottom: 20mm;
          box-shadow: 0 8px 24px rgba(16,24,40,0.06);
          display: inline-block;
        }

        .cover-title {
          font-size: 24pt;
          font-weight: 700;
          margin-bottom: 6mm;
          letter-spacing: 1px;
          color: #0f172a;
        }

        .cover-subtitle {
          font-size: 12pt;
          font-weight: 500;
          margin-bottom: 10mm;
          color: #334155;
        }

        .cover-contract-no {
          font-size: 12pt;
          font-weight: 600;
          padding: 3mm 6mm;
          background: #fff9f0;
          border-radius: 8px;
          margin-bottom: 8mm;
          display: block; /* force on its own line */
          width: 100%;
          text-align: center;
          color: #92400e;
        }

        .cover-customer-section {
          background: #ffffff;
          padding: 8mm 12mm;
          border-radius: 12px;
          margin-top: 6mm; /* reduced, contract no now above */
          border: 1px solid #efe6dd;
          box-shadow: 0 12px 28px rgba(16,24,40,0.06);
          display: inline-block;
          text-align: center;
          min-width: 160px;
        }

        .cover-customer-label {
          font-size: 10pt;
          color: #666;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          display: block;
        }

        .cover-customer-name {
          font-size: 16pt;
          font-weight: 700;
          color: #000;
          display: block;
          margin-top: 4px; /* ensure on its own line */
        }

        .cover-contract-below {
          margin-top: 10mm;
          font-size: 10.5pt;
          color: #334155;
          text-align: center;
        }

        .cover-date {
          position: absolute;
          bottom: 18mm;
          font-size: 10pt;
          color: #475569;
        }

        .cover-greeting {
          font-size: 14pt;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 6mm;
        }

        /* Content Page */
        .content-page {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 15mm 18mm;
          background: white;
          font-family: 'Sarabun', 'Segoe UI', sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #111;
          position: relative;
          border: 1px solid #e6e6e6;
          border-radius: 8px;
          box-shadow: 0 12px 32px rgba(16,24,40,0.08);
          overflow: hidden;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 8mm;
          border-bottom: 2px solid #1e3a5f;
          margin-bottom: 8mm;
        }

        .content-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .content-header-logo {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }

        .content-company-name {
          font-size: 14pt;
          font-weight: 700;
          color: #1e3a5f;
        }

        .content-company-sub {
          font-size: 10pt;
          color: #666;
        }

        .content-doc-info {
          text-align: right;
        }

        .content-doc-title {
          font-size: 16pt;
          font-weight: 700;
          color: #1e3a5f;
        }

        .content-doc-no {
          font-size: 11pt;
          color: #666;
          margin-top: 4px;
        }

        .section-title {
          font-size: 13pt;
          font-weight: 700;
          color: #0f172a;
          margin: 8mm 0 4mm 0;
          padding-bottom: 2mm;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3mm 8mm;
          margin-bottom: 6mm;
        }

        .info-item {
          display: flex;
        }

        .info-label {
          width: 45mm;
          font-weight: 600;
          color: #555;
        }

        .info-value {
          flex: 1;
          color: #111;
        }

        .contract-terms {
          background: #f8fafc;
          padding: 5mm;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          white-space: pre-wrap;
          font-size: 10pt;
          line-height: 1.7;
          box-shadow: 0 8px 20px rgba(16,24,40,0.04);
        }

        .payment-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4mm;
          font-size: 10pt;
        }

        .payment-table th {
          background: #1e3a5f;
          color: white;
          padding: 3mm;
          text-align: left;
          font-weight: 600;
        }

        .payment-table td {
          padding: 3mm;
          border-bottom: 1px solid #e5e7eb;
        }

        .payment-table tr:nth-child(even) {
          background: #f8fafc;
        }

        .amount-cell {
          text-align: right;
          font-weight: 600;
        }

        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 15mm;
          padding-top: 8mm;
        }

        .sig-box {
          width: 28%;
          text-align: center;
        }

        .sig-line {
          border-bottom: 1px solid #333;
          height: 20mm;
          margin-bottom: 3mm;
        }

        .sig-label {
          font-size: 10pt;
          color: #555;
        }

        .sig-date {
          font-size: 9pt;
          color: #888;
          margin-top: 2mm;
        }

        .content-footer {
          position: absolute;
          bottom: 10mm;
          left: 18mm;
          right: 18mm;
          font-size: 9pt;
          color: #888;
          border-top: 1px solid #e5e7eb;
          padding-top: 4mm;
          display: flex;
          justify-content: space-between;
        }

        .highlight-box {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          padding: 4mm;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          margin: 4mm 0;
          box-shadow: 0 8px 18px rgba(16,24,40,0.05);
        }

        .total-amount {
          font-size: 14pt;
          font-weight: 700;
          color: #1e3a5f;
        }

        /* Separation and clearer page breaks */
        @media print {
          .content-page { page-break-after: always; break-after: page; page-break-inside: avoid; }
          .content-page:last-child { page-break-after: auto; }
          .cover-page { page-break-after: always; }
          /* Prevent tables/boxes from being split across pages */
          .contract-terms, .payment-table, .highlight-box, .signature-section { page-break-inside: avoid; break-inside: avoid; }
        }

        @media screen {
          /* Add visual spacing between pages when viewing on screen - like paper sheets */
          .cover-page { margin: 18px auto 32px; border: 1px solid #ccc; box-shadow: 0 12px 32px rgba(16,24,40,0.12); }
          .content-page { margin: 18px auto 32px; }
          /* Extra breathing room for section titles */
          .section-title { margin-top: 8mm; margin-bottom: 4mm; }
        }
      `}</style>

      <PrintStyles />

      {/* Control Bar */}
      <div className="no-print" style={{ textAlign: 'center', padding: '12px', background: '#f0f0f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <button
          onClick={() => setSelectedLang('th')}
          style={{ marginRight: 10, padding: '8px 20px', fontSize: 14, borderRadius: 8, border: selectedLang === 'th' ? '2px solid #1e3a5f' : '1px solid #ccc', background: selectedLang === 'th' ? '#1e3a5f' : '#fff', color: selectedLang === 'th' ? '#fff' : '#333', cursor: 'pointer', fontWeight: 700 }}
        >ไทย</button>
        <button
          onClick={() => setSelectedLang('en')}
          style={{ marginRight: 12, padding: '8px 20px', fontSize: 14, borderRadius: 8, border: selectedLang === 'en' ? '2px solid #1e3a5f' : '1px solid #ccc', background: selectedLang === 'en' ? '#1e3a5f' : '#fff', color: selectedLang === 'en' ? '#fff' : '#333', cursor: 'pointer', fontWeight: 700 }}
        >English</button>
        <button
          onClick={() => window.print()}
          style={{ marginLeft: 8, padding: '10px 26px', fontSize: 15, borderRadius: 8, border: 'none', background: '#1e3a5f', color: '#fff', cursor: 'pointer', fontWeight: 800 }}
        >{L('Print Report', 'พิมพ์รายงาน')}</button>
      </div>

      {/* Cover Page */}
      <div className="cover-page">
        <div className="cover-pattern"></div>
        <div className="cover-top-line"></div>
        <div className="cover-bottom-line"></div>

        <div className="cover-content">
          <div className="cover-logo-container">
              <img src="/k-energy-save-logo.jpg" alt="K Energy Save Logo" className="cover-logo" />
            </div>

            <div className="cover-title">
              {L('SALES CONTRACT', 'สัญญาซื้อขาย')}
            </div>

            <div className="cover-subtitle" style={{ lineHeight: 1.4, fontSize: '10.5pt', color: '#000' }}>
              K Energy Save Co., Ltd.<br/>
              84 Chaloem Phrakiat Rama 9 Soi 34<br/>
              Nong Bon, Prawet<br/>
              Bangkok 10250, Thailand<br/>
              +66 2 080 8916<br/>
              info@kenergy-save.com
            </div>

            <div className="cover-contract-no">
              {L('Contract No.', 'เลขที่สัญญา')}: {contractNo}
            </div>

            <div className="cover-customer-section">
              <div className="cover-customer-label">{L('Customer', 'ลูกค้า')}</div>
              <div className="cover-customer-name">{customerName}</div>
            </div>
        </div>

        <div className="cover-date">
          {L('Date', 'วันที่')}: {fmtDate(contractDate)}
        </div>
      </div>

      {/* Content Page */}
      <div className="content-page page-break">
        <div className="content-header">
          <div className="content-header-left">
            <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
            <div>
              <div className="content-company-name">K Energy Save Co., Ltd.</div>
              <div className="content-company-sub">
                {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                +66 2 080 8916 | info@kenergy-save.com
              </div>
            </div>
          </div>
          <div className="content-doc-info">
            <div className="content-doc-title">{L('SALES CONTRACT', 'สัญญาซื้อขาย')}</div>
            <div className="content-doc-no">{contractNo}</div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="section-title">{L('Customer Information', 'ข้อมูลลูกค้า')}</div>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">{L('Customer Name', 'ชื่อลูกค้า')}:</div>
            <div className="info-value">{customerName}</div>
          </div>
          <div className="info-item">
            <div className="info-label">{L('Contract Date', 'วันที่ทำสัญญา')}:</div>
            <div className="info-value">{fmtDate(contractDate)}</div>
          </div>
          <div className="info-item" style={{ gridColumn: 'span 2' }}>
            <div className="info-label">{L('Address', 'ที่อยู่')}:</div>
            <div className="info-value">{customerAddress}</div>
          </div>
        </div>

        {/* Contract Period */}
        <div className="section-title">{L('Contract Period', 'ระยะเวลาสัญญา')}</div>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">{L('Start Date', 'วันที่เริ่มต้น')}:</div>
            <div className="info-value">{fmtDate(startDate)}</div>
          </div>
          <div className="info-item">
            <div className="info-label">{L('End Date', 'วันที่สิ้นสุด')}:</div>
            <div className="info-value">{fmtDate(endDate)}</div>
          </div>
          <div className="info-item">
            <div className="info-label">{L('Warranty', 'การรับประกัน')}:</div>
            <div className="info-value">{warrantyText()}</div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="section-title">{L('Payment Summary', 'สรุปการชำระเงิน')}</div>
        <div className="highlight-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{L('Total Contract Value', 'มูลค่าสัญญารวม')}:</span>
            <span className="total-amount">฿ {fmtCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Payment Schedule */}
        {paymentSchedule.length > 0 && (
          <>
            <div className="section-title">{L('Payment Schedule', 'ตารางการชำระเงิน')}</div>
            <table className="payment-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>{L('No.', 'งวดที่')}</th>
                  <th style={{ width: '45%' }}>{L('Due Date', 'กำหนดชำระ')}</th>
                  <th style={{ width: '40%', textAlign: 'right' }}>{L('Amount', 'จำนวนเงิน')}</th>
                </tr>
              </thead>
              <tbody>
                {paymentSchedule.map((p: any, i: number) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>{p.installmentNo || i + 1}</td>
                    <td>{fmtDate(p.dueDate || p.due_date)}</td>
                    <td className="amount-cell">฿ {fmtCurrency(Number(p.amount) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Maintenance Scope */}
        {maintenanceScope && (
          <>
            <div className="section-title">{L('Maintenance Scope', 'ขอบเขตการดูแล')}</div>
            <div className="contract-terms">{maintenanceScope}</div>
          </>
        )}

        {/* Signature Section */}
        <div className="signature-section">
          <div className="sig-box">
            <div className="sig-line"></div>
            <div className="sig-label">{L('Seller', 'ผู้ขาย')}</div>
            <div className="sig-date">{L('Date', 'วันที่')}: _______________</div>
          </div>
          <div className="sig-box">
            <div className="sig-line"></div>
            <div className="sig-label">{L('Buyer', 'ผู้ซื้อ')}</div>
            <div className="sig-date">{L('Date', 'วันที่')}: _______________</div>
          </div>
          <div className="sig-box">
            <div className="sig-line"></div>
            <div className="sig-label">{L('Witness', 'พยาน')}</div>
            <div className="sig-date">{L('Date', 'วันที่')}: _______________</div>
          </div>
        </div>

        <div className="content-footer">
          <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
          <div>{L('Page', 'หน้า')} 1</div>
        </div>
      </div>

      {/* Contract Terms Page 1 */}
      {contractContent && (() => {
        // Split contract content into two parts for better pagination
        const lines = contractContent.split('\n')
        const midPoint = Math.ceil(lines.length / 2)
        const firstHalf = lines.slice(0, midPoint).join('\n')
        const secondHalf = lines.slice(midPoint).join('\n')

        return (
          <>
            <div className="content-page page-break">
              <div className="content-header">
                <div className="content-header-left">
                  <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
                  <div>
                    <div className="content-company-name">K Energy Save Co., Ltd.</div>
                    <div className="content-company-sub">
                      {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                      +66 2 080 8916 | info@kenergy-save.com
                    </div>
                  </div>
                </div>
                <div className="content-doc-info">
                  <div className="content-doc-title">{L('CONTRACT TERMS', 'เงื่อนไขสัญญา')}</div>
                  <div className="content-doc-no">{contractNo}</div>
                </div>
              </div>

              <div className="section-title">{L('Terms and Conditions', 'ข้อกำหนดและเงื่อนไข')} (1/2)</div>
              <div className="contract-terms" style={{ fontSize: '9pt', lineHeight: 1.5 }}>
                {firstHalf}
              </div>

              <div className="content-footer">
                <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
                <div>{L('Page', 'หน้า')} 2</div>
              </div>
            </div>

            {/* Contract Terms Page 2 */}
            <div className="content-page page-break">
              <div className="content-header">
                <div className="content-header-left">
                  <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
                  <div>
                    <div className="content-company-name">K Energy Save Co., Ltd.</div>
                    <div className="content-company-sub">
                      {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                      +66 2 080 8916 | info@kenergy-save.com
                    </div>
                  </div>
                </div>
                <div className="content-doc-info">
                  <div className="content-doc-title">{L('CONTRACT TERMS', 'เงื่อนไขสัญญา')}</div>
                  <div className="content-doc-no">{contractNo}</div>
                </div>
              </div>

              <div className="section-title">{L('Terms and Conditions', 'ข้อกำหนดและเงื่อนไข')} (2/2)</div>
              <div className="contract-terms" style={{ fontSize: '9pt', lineHeight: 1.5 }}>
                {secondHalf}
              </div>

              {/* Signature Section on Terms Page 2 */}
              <div className="signature-section" style={{ marginTop: 8 }}>
                <div className="sig-box">
                  <div className="sig-line"></div>
                  <div className="sig-label">{L('Seller', 'ผู้ขาย')}</div>
                  <div className="sig-date">{L('Date', 'วันที่')}: _______________</div>
                </div>
                <div className="sig-box">
                  <div className="sig-line"></div>
                  <div className="sig-label">{L('Buyer', 'ผู้ซื้อ')}</div>
                  <div className="sig-date">{L('Date', 'วันที่')}: _______________</div>
                </div>
                <div className="sig-box">
                  <div className="sig-line"></div>
                  <div className="sig-label">{L('Witness', 'พยาน')}</div>
                  <div className="sig-date">{L('Date', 'วันที่')}: _______________</div>
                </div>
              </div>

              <div className="content-footer">
                <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
                <div>{L('Page', 'หน้า')} 3</div>
              </div>
            </div>
          </>
        )
      })()}

      {/* Products/Items Page - รายการสินค้า */}
      {Array.isArray(devices) && devices.length > 0 && (
        <div className="content-page page-break">
          <div className="content-header">
            <div className="content-header-left">
              <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
              <div>
                <div className="content-company-name">K Energy Save Co., Ltd.</div>
                <div className="content-company-sub">
                  {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                  +66 2 080 8916 | info@kenergy-save.com
                </div>
              </div>
            </div>
            <div className="content-doc-info">
              <div className="content-doc-title">{L('PRODUCT LIST', 'รายการสินค้า')}</div>
              <div className="content-doc-no">
                {contract.quotationNo || L('No document number', 'ไม่มีเลขที่บิล')}
              </div>
            </div>
          </div>

          <div className="section-title">{L('Products / Equipment', 'สินค้า / อุปกรณ์')}</div>

          <table className="payment-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '15%' }}>{L('SKU', 'รหัสสินค้า')}</th>
                <th style={{ width: '40%' }}>{L('Product Name', 'ชื่อสินค้า')}</th>
                <th style={{ width: '10%', textAlign: 'center' }}>{L('Qty', 'จำนวน')}</th>
                <th style={{ width: '15%', textAlign: 'right' }}>{L('Unit Price', 'ราคา/หน่วย')}</th>
                <th style={{ width: '15%', textAlign: 'right' }}>{L('Total', 'รวม')}</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((item: any, idx: number) => {
                const name = item.product_name || item.productName || item.name || item.model || item.title || '-'
                const sku = item.sku || item.SKU || '-'
                const qty = Number(item.quantity || item.qty || 1)
                const unitPrice = Number(item.unit_price || item.unitPrice || item.price || 0)
                const lineTotal = Number(item.total_price || item.totalPrice || item.total || (qty * unitPrice))
                return (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td>{sku}</td>
                    <td>
                      <strong>{name}</strong>
                      {item.description && <div style={{ fontSize: 9, color: '#666' }}>{item.description}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>{qty}</td>
                    <td className="amount-cell">{unitPrice > 0 ? `฿ ${fmtCurrency(unitPrice)}` : '-'}</td>
                    <td className="amount-cell">{lineTotal > 0 ? `฿ ${fmtCurrency(lineTotal)}` : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f0f9ff', fontWeight: 700 }}>
                <td colSpan={3}></td>
                <td style={{ textAlign: 'center' }}>
                  {devices.reduce((sum: number, item: any) => sum + Number(item.quantity || item.qty || 1), 0)}
                </td>
                <td style={{ textAlign: 'right' }}>{L('Total', 'รวม')}</td>
                <td className="amount-cell">฿ {fmtCurrency(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="content-footer">
            <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
            <div>{L('Page', 'หน้า')} 4</div>
          </div>
        </div>
      )}

      {/* User Manual Page - คู่มือการใช้งาน */}
      <div className="content-page page-break">
        <div className="content-header">
          <div className="content-header-left">
            <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
            <div>
              <div className="content-company-name">K Energy Save Co., Ltd.</div>
              <div className="content-company-sub">
                {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                +66 2 080 8916 | info@kenergy-save.com
              </div>
            </div>
          </div>
          <div className="content-doc-info">
            <div className="content-doc-title">{L('USER MANUAL', 'คู่มือการใช้งาน')}</div>
            <div className="content-doc-no">{contractNo}</div>
          </div>
        </div>

        <div className="section-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            {L('K-SAVER Power Saving Device Guide', 'คู่มือการใช้งานเครื่อง K-SAVER ประหยัดพลังงาน')}
          </span>
        </div>

        {/* Show selected products from contract if any */}
        {Array.isArray(devices) && devices.length > 0 && (
          <div style={{ marginBottom: 8, padding: 8, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
            <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{L('Your Products', 'สินค้าของคุณ')}:</div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 10 }}>
              {devices.slice(0, 5).map((d: any, i: number) => (
                <li key={i}>
                  {d.product_name || d.productName || d.name || d.model || 'K-SAVER'}
                  {(d.quantity || d.qty) > 1 ? ` x ${d.quantity || d.qty}` : ''}
                </li>
              ))}
              {devices.length > 5 && <li>... {L('and', 'และ')} {devices.length - 5} {L('more items', 'รายการเพิ่มเติม')}</li>}
            </ul>
          </div>
        )}

        {/* Product Images Section */}
        <div style={{ marginBottom: 8 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 6 }}>
            1. {L('Our Products', 'ผลิตภัณฑ์ของเรา')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* K-SAVER 30 (Commercial Solution) - left, styled like right card */}
            <div style={{ background: 'linear-gradient(180deg,#fffaf8,#f7faff)', padding: 12, borderRadius: 14, border: '1px solid #eaeaea', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160, boxShadow: '0 10px 30px rgba(16,24,40,0.06)' }}>
              <img src="/k-saver-30.png" alt="K-SAVER 30" style={{ width: '100%', maxWidth: 140, height: 'auto', marginBottom: 8 }} />

              <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>K-SAVER 30</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#2563eb', marginBottom: 6 }}>{L('Commercial Solution', 'Commercial Solution')}</div>

              <div style={{ fontSize: 11, lineHeight: 1.3, color: '#374151', textAlign: 'center' }}>
                <div>{L('Ideal for commercial spaces', 'Ideal for commercial spaces')}</div>
                <div>{L('Up to 30kW capacity', 'Up to 30kW capacity')}</div>
              </div>
            </div>
            {/* K-SAVER Max (Industrial Solution) - right, centered friendly card */}
            <div style={{ background: 'linear-gradient(180deg,#fffaf0,#f7fff7)', padding: 12, borderRadius: 14, border: '1px solid #eaeaea', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160, boxShadow: '0 10px 30px rgba(16,24,40,0.06)' }}>
              <img src="/k-saver-max.png" alt="K-SAVER Max" style={{ width: '100%', maxWidth: 140, height: 'auto', marginBottom: 8 }} />

              <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>K-SAVER Max</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#2563eb', marginBottom: 6 }}>{L('Industrial Solution', 'Industrial Solution')}</div>

              <div style={{ fontSize: 11, lineHeight: 1.3, color: '#374151', textAlign: 'center' }}>
                <div>{L('High-capacity industrial applications', 'High-capacity industrial applications')}</div>
                <div>{L('Customizable capacity', 'Customizable capacity')}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            2. {L('Product Features', 'คุณสมบัติผลิตภัณฑ์')}
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 10, lineHeight: 1.8 }}>
            <li>{L('K-SAVER is an innovative power saving device with patented technology', 'K-SAVER เป็นอุปกรณ์ประหยัดพลังงานนวัตกรรมใหม่ด้วยเทคโนโลยีจดสิทธิบัตร')}</li>
            <li>{L('Reduces power consumption by 7-15% by blocking excess power', 'ลดการใช้พลังงานได้ 7-15% โดยการกรองกระแสไฟฟ้าส่วนเกิน')}</li>
            <li>{L('Stabilizes voltage fluctuations to protect your equipment', 'ปรับแรงดันไฟฟ้าให้คงที่เพื่อปกป้องอุปกรณ์ของคุณ')}</li>
            <li>{L('Reduces harmonics and improves power quality', 'ลดฮาร์โมนิคและปรับปรุงคุณภาพไฟฟ้า')}</li>
          </ul>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            3. {L('Daily Operation', 'การใช้งานประจำวัน')}
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 10, lineHeight: 1.8 }}>
            <li>{L('K-SAVER operates automatically 24/7 - no manual intervention required', 'K-SAVER ทำงานอัตโนมัติตลอด 24 ชั่วโมง ไม่ต้องดำเนินการใดๆ')}</li>
            <li>{L('Check the LED indicator daily to ensure normal operation', 'ตรวจสอบไฟ LED แสดงสถานะทุกวันเพื่อให้แน่ใจว่าทำงานปกติ')}</li>
            <li>{L('Monitor your electricity bills to track savings', 'ตรวจสอบบิลค่าไฟฟ้าเพื่อติดตามการประหยัด')}</li>
            <li>{L('Keep the device in a well-ventilated area', 'วางเครื่องในพื้นที่ที่มีอากาศถ่ายเทดี')}</li>
          </ul>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            4. {L('Safety Precautions', 'ข้อควรระวังเพื่อความปลอดภัย')}
          </div>
          <div className="highlight-box" style={{ background: '#fee2e2', borderLeftColor: '#dc2626', padding: 4, marginTop: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 10, lineHeight: 1.8 }}>
              <li><strong>{L('DO NOT', 'ห้าม')}</strong> {L('open the device casing or touch internal components', 'เปิดฝาเครื่องหรือสัมผัสชิ้นส่วนภายใน')}</li>
              <li><strong>{L('DO NOT', 'ห้าม')}</strong> {L('install in wet or humid locations', 'ติดตั้งในสถานที่เปียกชื้น')}</li>
              <li><strong>{L('DO NOT', 'ห้าม')}</strong> {L('block ventilation openings', 'ปิดกั้นช่องระบายอากาศ')}</li>
              <li>{L('In case of emergency, turn off the main breaker', 'ในกรณีฉุกเฉิน ให้ปิดเบรกเกอร์หลัก')}</li>
              <li>{L('Contact K Energy Save immediately for any issues', 'ติดต่อ K Energy Save ทันทีหากมีปัญหา')}</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            5. {L('Understanding Your K-SAVER', 'ทำความเข้าใจเครื่อง K-SAVER')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
            <div style={{ background: '#f0fdf4', padding: 4, borderRadius: 4, border: '1px solid #86efac' }}>
              <strong style={{ color: '#166534' }}>{L('LED Status Indicators', 'ไฟแสดงสถานะ LED')}</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, lineHeight: 1.6 }}>
                <li><span style={{ color: '#22c55e' }}>●</span> {L('Green: Normal operation', 'เขียว: ทำงานปกติ')}</li>
                <li><span style={{ color: '#f59e0b' }}>●</span> {L('Yellow: Standby mode', 'เหลือง: โหมดสแตนด์บาย')}</li>
                <li><span style={{ color: '#ef4444' }}>●</span> {L('Red: Error - contact support', 'แดง: ผิดปกติ - ติดต่อช่าง')}</li>
              </ul>
            </div>
            <div style={{ background: '#eff6ff', padding: 4, borderRadius: 4, border: '1px solid #93c5fd' }}>
              <strong style={{ color: '#1e40af' }}>{L('Key Benefits', 'ประโยชน์หลัก')}</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, lineHeight: 1.6 }}>
                <li>{L('Save 7-15% on electricity bills', 'ประหยัดค่าไฟ 7-15%')}</li>
                <li>{L('Protect equipment from surges', 'ปกป้องอุปกรณ์จากไฟกระชาก')}</li>
                <li>{L('Extend equipment lifespan', 'ยืดอายุการใช้งานอุปกรณ์')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            6. {L('Warranty & Support', 'การรับประกันและการสนับสนุน')}
          </div>
          <div className="highlight-box" style={{ padding: 4 }}>
            <div style={{ fontSize: 10, lineHeight: 1.8 }}>
              <strong>{L('Your warranty coverage', 'ความคุ้มครองการรับประกันของคุณ')}:</strong> {warrantyText()}<br/>
              <strong>{L('For support, contact', 'สำหรับการสนับสนุน ติดต่อ')}:</strong><br/>
              📞 +66 2 080 8916<br/>
              📧 info@kenergy-save.com<br/>
              🌐 www.XXXXX.com
            </div>
          </div>
        </div>

        <div className="content-footer">
          <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
          <div>{L('Page', 'หน้า')} 5</div>
        </div>
      </div>

      {/* Application Usage Guide Page - คู่มือใช้แอพพลิเคชั่น */}
      <div className="content-page page-break">
        <div className="content-header">
          <div className="content-header-left">
            <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
            <div>
              <div className="content-company-name">K Energy Save Co., Ltd.</div>
              <div className="content-company-sub">
                {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                +66 2 080 8916 | info@kenergy-save.com
              </div>
            </div>
          </div>
          <div className="content-doc-info">
            <div className="content-doc-title">{L('APP GUIDE', 'คู่มือแอปพลิเคชัน')}</div>
            <div className="content-doc-no">{contractNo}</div>
          </div>
        </div>

        <div className="section-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <path d="M12 18h.01"/>
            </svg>
            {L('K-System Web Application Guide', 'คู่มือการใช้งานเว็บแอปพลิเคชัน K-System')}
          </span>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            1. {L('Getting Started', 'เริ่มต้นใช้งาน')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, fontSize: 10 }}>
            <div style={{ background: '#f8fafc', padding: 4, borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🌐</div>
              <strong>{L('Step 1', 'ขั้นตอนที่ 1')}</strong><br/>
              {L('Open browser on your phone or computer', 'เปิดเบราว์เซอร์บนโทรศัพท์หรือคอมพิวเตอร์')}
            </div>
            <div style={{ background: '#f8fafc', padding: 4, borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🔗</div>
              <strong>{L('Step 2', 'ขั้นตอนที่ 2')}</strong><br/>
              {L('Go to k-system.app website', 'เข้าเว็บไซต์ k-system.app')}
            </div>
            <div style={{ background: '#f8fafc', padding: 4, borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🔐</div>
              <strong>{L('Step 3', 'ขั้นตอนที่ 3')}</strong><br/>
              {L('Login with your registered email and password', 'เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ลงทะเบียน')}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            2. {L('Main Features', 'ฟีเจอร์หลัก')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10 }}>
            <div style={{ background: '#eff6ff', padding: 4, borderRadius: 4 }}>
              <strong style={{ color: '#1e40af' }}>📊 {L('Dashboard', 'แดชบอร์ด')}</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, lineHeight: 1.6 }}>
                <li>{L('Real-time power generation', 'การผลิตไฟฟ้าแบบเรียลไทม์')}</li>
                <li>{L('Today\'s energy production', 'การผลิตพลังงานวันนี้')}</li>
                <li>{L('Current power consumption', 'การใช้ไฟฟ้าปัจจุบัน')}</li>
              </ul>
            </div>
            <div style={{ background: '#f0fdf4', padding: 4, borderRadius: 4 }}>
              <strong style={{ color: '#166534' }}>📈 {L('Statistics', 'สถิติ')}</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, lineHeight: 1.6 }}>
                <li>{L('Daily/Monthly/Yearly reports', 'รายงานรายวัน/รายเดือน/รายปี')}</li>
                <li>{L('Energy savings calculator', 'เครื่องคำนวณการประหยัดพลังงาน')}</li>
                <li>{L('CO2 reduction tracking', 'การติดตามการลด CO2')}</li>
              </ul>
            </div>
            <div style={{ background: '#fef3c7', padding: 4, borderRadius: 4 }}>
              <strong style={{ color: '#92400e' }}>🔔 {L('Notifications', 'การแจ้งเตือน')}</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, lineHeight: 1.6 }}>
                <li>{L('System alerts and errors', 'การแจ้งเตือนและข้อผิดพลาดของระบบ')}</li>
                <li>{L('Maintenance reminders', 'การแจ้งเตือนการบำรุงรักษา')}</li>
                <li>{L('Performance notifications', 'การแจ้งเตือนประสิทธิภาพ')}</li>
              </ul>
            </div>
            <div style={{ background: '#fce7f3', padding: 4, borderRadius: 4 }}>
              <strong style={{ color: '#be185d' }}>⚙️ {L('Settings', 'การตั้งค่า')}</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, lineHeight: 1.6 }}>
                <li>{L('Profile management', 'การจัดการโปรไฟล์')}</li>
                <li>{L('Notification preferences', 'การตั้งค่าการแจ้งเตือน')}</li>
                <li>{L('Language settings', 'การตั้งค่าภาษา')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            3. {L('Viewing Your Energy Data', 'การดูข้อมูลพลังงานของคุณ')}
          </div>
          <div style={{ fontSize: 10, lineHeight: 1.8 }}>
            <p style={{ margin: '0 0 4px 0' }}>
              {L('Access your energy data anytime through the K-System app:', 'เข้าถึงข้อมูลพลังงานของคุณได้ตลอดเวลาผ่านแอป K-System:')}
            </p>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>{L('Open the app and go to Dashboard', 'เปิดแอปและไปที่แดชบอร์ด')}</li>
              <li>{L('View real-time generation on the main screen', 'ดูการผลิตไฟฟ้าแบบเรียลไทม์บนหน้าจอหลัก')}</li>
              <li>{L('Tap "Statistics" for detailed reports', 'แตะ "สถิติ" เพื่อดูรายงานโดยละเอียด')}</li>
              <li>{L('Use date picker to view historical data', 'ใช้ตัวเลือกวันที่เพื่อดูข้อมูลย้อนหลัง')}</li>
              <li>{L('Export reports as PDF or Excel', 'ส่งออกรายงานเป็น PDF หรือ Excel')}</li>
            </ol>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            4. {L('Troubleshooting', 'การแก้ไขปัญหา')}
          </div>
          <table className="payment-table" style={{ fontSize: 9 }}>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>{L('Issue', 'ปัญหา')}</th>
                <th style={{ width: '65%' }}>{L('Solution', 'วิธีแก้ไข')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{L('App not loading data', 'แอปไม่โหลดข้อมูล')}</td>
                <td>{L('Check internet connection, pull down to refresh', 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต ดึงลงเพื่อรีเฟรช')}</td>
              </tr>
              <tr>
                <td>{L('System shows offline', 'ระบบแสดงออฟไลน์')}</td>
                <td>{L('Check WiFi router near inverter, restart router if needed', 'ตรวจสอบเราเตอร์ WiFi ใกล้อินเวอร์เตอร์ รีสตาร์ทเราเตอร์หากจำเป็น')}</td>
              </tr>
              <tr>
                <td>{L('Login issues', 'ปัญหาการเข้าสู่ระบบ')}</td>
                <td>{L('Use "Forgot Password" or contact support', 'ใช้ "ลืมรหัสผ่าน" หรือติดต่อฝ่ายสนับสนุน')}</td>
              </tr>
              <tr>
                <td>{L('Data mismatch', 'ข้อมูลไม่ตรงกัน')}</td>
                <td>{L('Wait 15 minutes for sync, then refresh', 'รอ 15 นาทีเพื่อซิงค์ จากนั้นรีเฟรช')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className="section-title" style={{ fontSize: 11, marginTop: 4, marginBottom: 3 }}>
            5. {L('Contact & Support', 'ติดต่อและสนับสนุน')}
          </div>
          <div className="highlight-box" style={{ padding: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
              <div>
                <strong>{L('Technical Support', 'ฝ่ายเทคนิค')}</strong><br/>
                📞 +66 2 080 8916<br/>
                📧 info@kenergy-save.com<br/>
                🕐 {L('Mon-Fri 9:00-18:00', 'จันทร์-ศุกร์ 9.00-18.00 น.')}
              </div>
              <div>
                <strong>{L('Access Web App', 'เข้าใช้งานเว็บแอป')}</strong><br/>
                🌐 {L('Website', 'เว็บไซต์')}: k-system.app<br/>
                📱 {L('Works on phone & computer', 'ใช้งานได้ทั้งโทรศัพท์และคอมพิวเตอร์')}<br/>
                💡 {L('No download required', 'ไม่ต้องดาวน์โหลด')}
              </div>
            </div>
          </div>
        </div>

        <div className="content-footer">
          <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
          <div>{L('Page', 'หน้า')} 6</div>
        </div>
      </div>

      {/* Pre-installation Page (Page 7) */}
      <div className="content-page page-break">
        <div className="content-header">
          <div className="content-header-left">
            <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
            <div>
              <div className="content-company-name">K Energy Save Co., Ltd.</div>
              <div className="content-company-sub">
                {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                +66 2 080 8916 | info@kenergy-save.com
              </div>
            </div>
          </div>
          <div className="content-doc-info">
            <div className="content-doc-title">{L('PRE-INSTALLATION', 'ก่อนการติดตั้ง')}</div>
            <div className="content-doc-no">
              {contract.preInst_formID
                ? `PRE-${String(contract.preInst_orderID || contract.preInst_formID).padStart(4, '0')}`
                : L('No document number', 'ไม่มีเลขที่บิล')}
            </div>
          </div>
        </div>

        <div className="section-title">1. {L('Site Preparation', 'การเตรียมสถานที่')}</div>

        {/* Pre-installation: populated contract fields */}
        <div style={{ padding: '4mm 0' }}>
          <div className="highlight-box" style={{ padding: '6px', marginBottom: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 6, alignItems: 'start' }}>
              <div style={{ fontWeight: 700 }}>{L('Contract No.', 'เลขที่สัญญา')}</div>
              <div>{contractNo}</div>

              <div style={{ fontWeight: 700 }}>{L('Customer', 'ลูกค้า')}</div>
              <div>{customerName}</div>

              <div style={{ fontWeight: 700 }}>{L('Installation Address', 'ที่อยู่ติดตั้ง')}</div>
              <div>{installationAddress}</div>

              <div style={{ fontWeight: 700 }}>{L('Site Contact', 'ผู้ติดต่อที่ไซต์')}</div>
              <div>{siteContact || '-'}</div>

              <div style={{ fontWeight: 700 }}>{L('Device(s) / Products', 'อุปกรณ์ / สินค้า')}</div>
              <div>
                {Array.isArray(devices) && devices.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {devices.map((d: any, i: number) => {
                      const name = d.product_name || d.productName || d.name || d.model || d.title || d.type || L('Item', 'รายการ')
                      const qty = d.quantity || d.qty || 1
                      const sku = d.sku || d.SKU || ''
                      const serial = d.serial || d.serialNumber || ''
                      return (
                        <li key={i} style={{ fontSize: 10 }}>
                          <strong>{name}</strong>
                          {sku ? ` (${sku})` : ''}
                          {qty > 1 ? ` x ${qty}` : ''}
                          {serial ? ` - S/N: ${serial}` : ''}
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div style={{ fontSize: 10, color: '#444' }}>{L('No device list in contract', 'ไม่มีรายการอุปกรณ์ในสัญญา')}</div>
                )}
              </div>
            </div>
          </div>

          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>{L('Confirm power source, breakers and earthing', 'ยืนยันแหล่งจ่ายไฟ เบรกเกอร์ และการต่อลงดิน')}</li>
            <li>{L('Network: DHCP or static IP, gateway and DNS', 'เครือข่าย: DHCP หรือ IP คงที่ เกตเวย์ และ DNS')}</li>
            <li>{L('Firewall rules: allow outbound to cloud endpoints', 'กฎไฟร์วอลล์: อนุญาตการเชื่อมต่อออกไปยังคลาวด์')}</li>
            <li>{L('Mounting and clearance for CTs and cabling', 'การติดตั้งและระยะห่างสำหรับ CT และสายเคเบิล')}</li>
          </ul>
        </div>

        <div className="content-footer">
          <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
          <div>{L('Page', 'หน้า')} 7</div>
        </div>
      </div>

      {/* Power Calculation Page (replaces Pre-installation — Continued) */}
      <div className="content-page page-break">
        <div className="content-header">
          <div className="content-header-left">
            <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
            <div>
              <div className="content-company-name">K Energy Save Co., Ltd.</div>
              <div className="content-company-sub">
                {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                +66 2 080 8916 | info@kenergy-save.com
              </div>
            </div>
          </div>
          <div className="content-doc-info">
            <div className="content-doc-title">{L('POWER CALCULATION', 'รายงานการคำนวณกำลังไฟ')}</div>
            <div className="content-doc-no">
              {powerCalcObj ? `PWC-${contractNo}` : L('No document number', 'ไม่มีเลขที่บิล')}
            </div>
          </div>
        </div>

        <div style={{ padding: '4mm 0' }}>
          {/* Main power calculation rendering */}
          <div className="section-title">{L('Power Calculation', 'การคำนวณกำลังไฟ')}</div>
          <div style={{ marginTop: 4 }}>
            {powerCalcObj ? (
              <div>{renderPowerCalculation(powerCalcObj)}</div>
            ) : (
              <div style={{ fontSize: 10, color: '#444' }}>{L('No power calculation report found in this contract.', 'ไม่พบรายงานการคำนวณกำลังไฟในสัญญานี้')}</div>
            )}
          </div>

          {/* Optional: keep configuration checklist as follow-up */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{L('Configuration Checklist (if needed)', 'เช็คลิสต์การตั้งค่า (ถ้าจำเป็น)')}</div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>{L('Record device firmware and serial numbers', 'บันทึกเวอร์ชันเฟิร์มแวร์และหมายเลขซีเรียล')}</li>
              <li>{L('Assign hostnames and static IPs if required', 'ตั้งชื่อโฮสต์และ IP คงที่ (ถ้าจำเป็น)')}</li>
              <li>{L('Test connectivity and sample data reporting', 'ทดสอบการเชื่อมต่อและการรายงานข้อมูลตัวอย่าง')}</li>
              <li>{L('Validate sensor wiring and measured values', 'ตรวจสอบการเดินสายเซ็นเซอร์และค่าที่วัดได้')}</li>
            </ol>
          </div>
        </div>

        <div className="content-footer">
          <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
          <div>{L('Page', 'หน้า')} 8</div>
        </div>
      </div>

      {/* Receipt Page (Page 7) - ใบเสร็จรับเงิน */}
      <div className="content-page page-break">
        <div className="content-header">
          <div className="content-header-left">
            <img src="/k-energy-save-logo.jpg" alt="Logo" className="content-header-logo" />
            <div>
              <div className="content-company-name">K Energy Save Co., Ltd.</div>
              <div className="content-company-sub">
                {L('84 Chaloem Phrakiat Rama 9 Soi 34, Bangkok 10250', '84 เฉลิมพระเกียรติ ร.9 ซอย 34 กรุงเทพฯ 10250')}<br/>
                +66 2 080 8916 | info@kenergy-save.com
              </div>
            </div>
          </div>
          <div className="content-doc-info">
            <div className="content-doc-title">{L('RECEIPT', 'ใบเสร็จรับเงิน')}</div>
            <div className="content-doc-no">
              {receipts.length > 0
                ? (receipts[0].receiptNo || receipts[0].receipt_no || L('No document number', 'ไม่มีเลขที่บิล'))
                : L('No document number', 'ไม่มีเลขที่บิล')}
            </div>
          </div>
        </div>

        <div className="section-title">{L('Payment Summary', 'สรุปการชำระเงิน')}</div>

        {/* Payment Summary Box */}
        <div className="highlight-box" style={{ marginBottom: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: '#666' }}>{L('Contract Value', 'มูลค่าสัญญา')}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>฿ {fmtCurrency(totalAmount)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#666' }}>{L('Total Paid', 'ชำระแล้ว')}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>฿ {fmtCurrency(totalPaid)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#666' }}>{L('Remaining Balance', 'คงเหลือ')}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: remainingBalance > 0 ? '#dc2626' : '#16a34a' }}>
                ฿ {fmtCurrency(remainingBalance)}
              </div>
            </div>
          </div>
        </div>

        <div className="section-title">{L('Payment History', 'ประวัติการชำระเงิน')}</div>

        {receipts.length > 0 ? (
          <table className="payment-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '18%' }}>{L('Receipt No.', 'เลขที่ใบเสร็จ')}</th>
                <th style={{ width: '15%' }}>{L('Date', 'วันที่')}</th>
                <th style={{ width: '17%' }}>{L('Invoice', 'ใบแจ้งหนี้')}</th>
                <th style={{ width: '15%' }}>{L('Method', 'วิธีชำระ')}</th>
                <th style={{ width: '15%', textAlign: 'right' }}>{L('Amount', 'จำนวนเงิน')}</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{r.receiptNo || r.receipt_no || '-'}</td>
                  <td>{r.receiptDate || r.receipt_date ? fmtDate(r.receiptDate || r.receipt_date) : '-'}</td>
                  <td>{r.invoice_no || r.invNo || '-'}</td>
                  <td>{r.payment_method || r.paymentMethod || '-'}</td>
                  <td className="amount-cell">฿ {fmtCurrency(Number(r.amount || 0))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f0fdf4', fontWeight: 700 }}>
                <td colSpan={5} style={{ textAlign: 'right' }}>{L('Total Paid', 'รวมชำระแล้ว')}</td>
                <td className="amount-cell">฿ {fmtCurrency(totalPaid)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div style={{ padding: 20, textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #e5e7eb' }}>
            <div style={{ fontSize: 12, color: '#666' }}>{L('No payment records found', 'ไม่พบประวัติการชำระเงิน')}</div>
          </div>
        )}

        {/* Payment Schedule Status */}
        {paymentSchedule.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 8 }}>{L('Payment Schedule Status', 'สถานะตารางชำระเงิน')}</div>
            <table className="payment-table" style={{ fontSize: 9 }}>
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>{L('No.', 'งวดที่')}</th>
                  <th style={{ width: '25%' }}>{L('Due Date', 'กำหนดชำระ')}</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>{L('Amount', 'จำนวนเงิน')}</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>{L('Status', 'สถานะ')}</th>
                </tr>
              </thead>
              <tbody>
                {paymentSchedule.map((p: any, i: number) => {
                  const dueDate = new Date(p.dueDate || p.due_date)
                  const isPastDue = dueDate < new Date() && p.status !== 'paid'
                  const statusText = p.status === 'paid'
                    ? L('Paid', 'ชำระแล้ว')
                    : isPastDue
                      ? L('Overdue', 'เกินกำหนด')
                      : L('Pending', 'รอชำระ')
                  const statusColor = p.status === 'paid' ? '#16a34a' : isPastDue ? '#dc2626' : '#f59e0b'
                  return (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}>{p.installmentNo || i + 1}</td>
                      <td>{fmtDate(p.dueDate || p.due_date)}</td>
                      <td className="amount-cell">฿ {fmtCurrency(Number(p.amount) || 0)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 600,
                          background: p.status === 'paid' ? '#dcfce7' : isPastDue ? '#fee2e2' : '#fef3c7',
                          color: statusColor
                        }}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}

        {/* Receipt Note */}
        <div style={{ marginTop: 10, padding: 8, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{L('Note', 'หมายเหตุ')}:</div>
          <div>{L('This document summarizes all payments received for this contract. For official receipts, please refer to individual receipt documents.', 'เอกสารนี้สรุปการชำระเงินทั้งหมดของสัญญานี้ สำหรับใบเสร็จรับเงินอย่างเป็นทางการ กรุณาดูเอกสารใบเสร็จแต่ละใบ')}</div>
        </div>

        {/* Signature Section for Receipt */}
        <div className="signature-section" style={{ marginTop: 12 }}>
          <div className="sig-box">
            <div className="sig-line"></div>
            <div className="sig-label">{L('Received By', 'ผู้รับเงิน')}</div>
            <div className="sig-date">{L('Date', 'วันที่')}: _______________</div>
          </div>
          <div className="sig-box">
            <div className="sig-line"></div>
            <div className="sig-label">{L('Payer', 'ผู้ชำระเงิน')}</div>
            <div className="sig-date">{L('Date', 'วันที่')}: _______________</div>
          </div>
        </div>

        <div className="content-footer">
          <div>K Energy Save Co., Ltd. | Tel: +66 2 080 8916 | info@kenergy-save.com</div>
          <div>{L('Page', 'หน้า')} 9</div>
        </div>
      </div>
    </>
  )
}
