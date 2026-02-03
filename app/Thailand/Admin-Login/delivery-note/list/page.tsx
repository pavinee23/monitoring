"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Installation & Delivery — List"
      apiPath="/api/delivery-notes"
      createPath="/Thailand/Admin-Login/delivery-note"
      columns={[
        { key: 'noteNo', label: 'Delivery No' },
        { key: 'date', label: 'Date' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'status', label: 'Status' }
      ]}
      link={{ columnKey: 'noteNo', path: '/Thailand/Admin-Login/delivery-note', paramName: 'noteNo' }}
      print={{ path: '/Thailand/Admin-Login/delivery-note', paramName: 'noteNo', idKey: 'noteNo', newTab: true }}
    />
  )
}
