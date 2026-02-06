"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Power Calculator — List"
      apiPath="/api/power-calculations"
      createPath="/Thailand/Admin-Login/power-calculator"
      columns={[
        { key: 'calcID', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'result', label: 'Result' },
        { key: 'created_at', label: 'Created' }
      ]}
      link={{ columnKey: 'calcID', path: '/Thailand/Admin-Login/power-calculator', paramName: 'calcID' }}
    />
  )
}

