"use client"

import React from 'react'
import ListPage from '../../shared/ListPage'

type PendingListProps = { locale?: 'en' | 'th' }

export default function PendingList({ locale = 'en' }: PendingListProps) {
  const title = locale === 'th' ? 'รายการบิลรออนุมัติ' : 'Pending Bills'
  return (
    <ListPage
      title={title}
      apiPath="/api/receipts?status=pending"
      createPath="/Thailand/Admin-Login/receipt"
      columns={[
        { key: 'receiptID', label: locale === 'th' ? 'รหัส' : 'Bill ID' },
        { key: 'receiptNo', label: locale === 'th' ? 'เลขที่ใบรับเงิน' : 'Receipt No' },
        { key: 'receiptDate', label: locale === 'th' ? 'วันที่' : 'Date' },
        { key: 'customer', label: locale === 'th' ? 'ลูกค้า' : 'Customer' },
        { key: 'amount', label: locale === 'th' ? 'จำนวนเงิน' : 'Amount' },
        { key: 'status', label: locale === 'th' ? 'สถานะ' : 'Status' },
      ]}
      link={{ columnKey: 'receiptNo', path: '/Thailand/Admin-Login/receipt', paramName: 'receiptNo' }}
      print={{ path: '/Thailand/Admin-Login/receipt/print', paramName: 'receiptID', idKey: 'receiptID', newTab: true }}
    />
  )
}
