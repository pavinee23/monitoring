"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Product Lists — List"
      apiPath="/api/products"
      createPath="/Thailand/Admin-Login/product-add"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price' }
      ]}
      link={{ columnKey: 'id', path: '/Thailand/Admin-Login/product-add', paramName: 'id' }}
    />
  )
}
