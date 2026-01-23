"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Customer = {
  cusID: number,
  fullname: string,
  email?: string | null,
  phone?: string | null,
  company?: string | null,
  address?: string | null,
  subject?: string | null,
  message?: string | null,
  created_by?: string | null,
  created_at?: string | null
}

export default function Page(){
  const router = useRouter()
  const [customers,setCustomers] = useState<Customer[]>([])

  // Fetch customers from API on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/customers')
        const j = await res.json()
        if (mounted && j && Array.isArray(j.customers)) setCustomers(j.customers)
      } catch (err) {
        console.error('Failed to load customers', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  const styles={container:{padding:24,fontFamily:'Inter,system-ui,Arial',maxWidth:1200,margin:'auto'},table:{width:'100%',borderCollapse:'collapse'}} as const

  return (
    <div style={styles.container}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>รายละเอียดลูกค้า</h2>
        <button onClick={()=>router.back()} style={{padding:8}}>ย้อนกลับ / Back</button>
      </div>

      <div style={{marginTop:12}}>
        {customers.length===0? <div style={{color:'#6b7280'}}>ยังไม่มีลูกค้า / No customers yet</div> : (
          <table style={styles.table}>
            <thead>
              <tr style={{textAlign:'left'}}>
                <th>cusID</th>
                <th>fullname</th>
                <th>email</th>
                <th>phone</th>
                <th>company</th>
                <th>address</th>
                <th>subject</th>
                <th>message</th>
                <th>created_by</th>
                <th>created_at</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c=> (
                <tr key={c.cusID} style={{borderTop:'1px solid #e6edf3'}}>
                  <td style={{padding:8}}>{c.cusID}</td>
                  <td style={{padding:8}}>{c.fullname}</td>
                  <td style={{padding:8}}>{c.email}</td>
                  <td style={{padding:8}}>{c.phone}</td>
                  <td style={{padding:8}}>{c.company}</td>
                  <td style={{padding:8}}>{c.address}</td>
                  <td style={{padding:8}}>{c.subject}</td>
                  <td style={{padding:8,whiteSpace:'pre-wrap'}}>{c.message}</td>
                  <td style={{padding:8}}>{c.created_by}</td>
                  <td style={{padding:8}}>{c.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
