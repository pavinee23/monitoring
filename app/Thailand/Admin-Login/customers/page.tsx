"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Customer = { id:number,name:string,phone:string,email?:string,address?:string }

export default function Page(){
  const router = useRouter()
  const [customers,setCustomers] = useState<Customer[]>([])
  const [form,setForm] = useState({name:'',phone:'',email:'',address:''})

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

  // Add customer via API then refresh list
  async function add(){
    if(!form.name||!form.phone) return alert('กรุณากรอกชื่อและโทรศัพท์ / Enter name and phone')
    try {
      const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, address: form.address }) })
      const j = await res.json()
      if (j && j.success) {
        // prepend optimistic entry using returned id if available
        const newCustomer = { id: j.customerId || Date.now(), name: form.name, phone: form.phone, email: form.email, address: form.address }
        setCustomers(prev => [newCustomer, ...prev])
        setForm({name:'',phone:'',email:'',address:''})
      } else {
        alert('Save failed: ' + (j && j.message ? j.message : JSON.stringify(j)))
      }
    } catch (err) {
      console.error('Add customer error', err)
      alert('Save failed')
    }
  }

  const styles={container:{padding:24,fontFamily:'Inter,system-ui,Arial',maxWidth:1000,margin:'auto'},card:{background:'#fff',padding:18,borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'},input:{padding:8,borderRadius:6,border:'1px solid #e2e8f0'}} as const

  return (
    <div style={styles.container}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>ลูกค้า / Customers</h2>
        <button onClick={()=>router.back()} style={{padding:8}}>ย้อนกลับ / Back</button>
      </div>
      {/* ฟอร์มเพิ่มลูกค้า ถูกเอาออกตามคำขอ */}

      <div style={{marginTop:12}}>
        {customers.length===0? <div style={{color:'#6b7280'}}>ยังไม่มีลูกค้า / No customers yet</div> : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{textAlign:'left'}}><th>ชื่อ / Name</th><th>โทรศัพท์ / Phone</th><th>อีเมล / Email</th><th>ที่อยู่ / Address</th></tr>
            </thead>
            <tbody>
              {customers.map(c=> (
                <tr key={c.id} style={{borderTop:'1px solid #e6edf3'}}>
                  <td style={{padding:8}}>{c.name}</td>
                  <td style={{padding:8}}>{c.phone}</td>
                  <td style={{padding:8}}>{c.email}</td>
                  <td style={{padding:8}}>{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
