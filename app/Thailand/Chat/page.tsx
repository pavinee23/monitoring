"use client"
import React, { useEffect, useState } from "react"
import AdminLayout from '../Admin-Login/components/AdminLayout'
import styles from '../Admin-Login/admin-theme.module.css'

type Message = {
  id: string
  from: "user" | "recipient"
  text?: string
  lang?: string
  senderName?: string
  attachments?: Array<{ url: string; name?: string; type?: string }>
  created_at?: string
}

export default function ChatPage() {
  const [recipient, setRecipient] = useState<string | string[]>("user1")
  const [text, setText] = useState<string>("")
  const [recipients, setRecipients] = useState<Array<{ id: string; name: string }>>([])
  const [recipientName, setRecipientName] = useState<string | null>(null)
  const [me, setMe] = useState<{ id?: string; name?: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [uiLang, setUiLang] = useState<'en' | 'th'>('en')
  const [productId, setProductId] = useState<string | null>(null)
  const [productName, setProductName] = useState<string | null>(null)
  const [typingName, setTypingName] = useState<string | null>(null)

  useEffect(() => {
    // fetch recipients from server
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/users')
        const data = await res.json()
        if (!mounted) return
        if (data?.ok && Array.isArray(data.users)) {
          const list = data.users.map((u: any) => ({ id: String(u.userId || u.id || u.userId), name: u.name || u.userName || u.email || 'Unnamed' }))
          setRecipients(list)
          if (list.length > 0) {
            setRecipient(list[0].id)
            setRecipientName(list[0].name)
          }
        }
      } catch (e) {
        console.error('Failed to load recipients', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Ensure recipients list does not include current user
  useEffect(() => {
    if (!me) return
    const filtered = recipients.filter(r => String(r.id) !== String(me.id))
    if (filtered.length !== recipients.length) {
      setRecipients(filtered)
      // if current recipient was self, pick first available
      if (String(recipient) === String(me.id)) {
        if (filtered.length > 0) {
          setRecipient(filtered[0].id)
          setRecipientName(filtered[0].name)
        } else {
          setRecipient('')
          setRecipientName(null)
        }
      }
    }
  }, [me, recipients, recipient])

  const L: Record<string, Record<string, string>> = {
    en: {
      title: 'Chat Room',
      selectRecipient: 'Select recipient:',
      sendButton: 'Send',
      sending: 'Sending...',
      history: 'Message history',
      you: 'You',
      recipient: 'Recipient',
      toggle: 'ไทย',
    },
    th: {
      title: 'ห้องแชท',
      selectRecipient: 'เลือกผู้รับ:',
      sendButton: 'ส่งข้อความ',
      sending: 'กำลังส่ง...',
      history: 'ประวัติข้อความ',
      you: 'คุณ',
      recipient: 'ผู้รับ',
      toggle: 'EN',
    },
  }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const pid = params.get('productId')
      const rid = params.get('recipientId')
      const rname = params.get('recipientName')
      const pname = params.get('productName')
      if (pid) setProductId(decodeURIComponent(pid))
      if (rid) setRecipient(decodeURIComponent(rid))
      if (rname) setRecipientName(decodeURIComponent(rname))
      if (pname) setProductName(decodeURIComponent(pname))
      // optionally prefill message with product name
      if (pname && !text) setText(`Product: ${decodeURIComponent(pname)}`)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setMe({ id: String(u.userId || u.id || u.userId || u.username || ''), name: u.name || u.fullname || u.username || u.userName })
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Subscribe to server-sent events for live messages
  useEffect(() => {
    if (!me) return
    const es = new EventSource('/api/chat/stream')
    es.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        if (!msg) return
        // reply notification events
        if (msg.type === 'replied') {
          const myId = String(me.id || '')
          if (String(msg.target) === myId) {
            setReplyNotifs((n) => [...n, `${msg.replierName || msg.replierId} replied`])
            // auto-clear after 6s
            setTimeout(() => setReplyNotifs((n) => n.slice(1)), 6000)
          }
          return
        }
        // only show messages relevant to this chat (one-to-one)
        const myId = String(me.id || '')
        const targets = Array.isArray(recipient) ? recipient.map(String) : [String(recipient || '')]
        // show when i'm sender or recipient and partner matches any selected recipient
        const isForThisChat = (String(msg.recipientId) === myId && targets.includes(String(msg.senderId))) || (String(msg.senderId) === myId && targets.includes(String(msg.recipientId)))
        if (!isForThisChat) return
        const from = (String(msg.senderId) === myId ? 'user' : 'recipient') as Message['from']
        const textToShow = from === 'user' ? (msg.text || '') : (msg.translated || msg.text || '')
        const parsedAttachments = (() => {
          try {
            if (!msg.attachments) return undefined
            if (typeof msg.attachments === 'string') return JSON.parse(msg.attachments)
            return msg.attachments
          } catch (_) { return undefined }
        })()
        const incoming: Message = {
          id: String(msg.id || Date.now()),
          from,
          text: textToShow,
          lang: from === 'recipient' ? 'ko' : undefined,
          senderName: msg.senderName,
          attachments: parsedAttachments || undefined,
          created_at: msg.created_at || msg.createdAt || undefined
        }
        setMessages(m => [...m, incoming])
      } catch (err) {
        // ignore
      }
    }
    // typing events via SSE: listen for typing messages
    const onTyping = (evt: MessageEvent) => {
      try {
        const ev = JSON.parse(evt.data)
        if (ev?.type === 'typing') {
          const otherId = String(ev.senderId)
          const targets = Array.isArray(recipient) ? recipient.map(String) : [String(recipient || '')]
          if (targets.includes(otherId)) {
            const status = ev.status === 'start'
            setIsTyping(status)
            if (status) setTypingName(ev.senderName || String(ev.senderId))
            else setTypingName(null)
          }
        }
      } catch (_) {}
    }
    es.addEventListener('message', onTyping)
    es.onerror = () => {
      try { es.close() } catch (_) {}
    }
    return () => { try { es.close() } catch (_) {} }
  }, [me, recipient])

  // Load message history when selecting a recipient
  useEffect(() => {
    if (!me || !recipient) return
    let mounted = true
    ;(async () => {
      try {
        const targets = Array.isArray(recipient) ? recipient : [recipient]
        const results: any[] = []
        for (const other of targets) {
          const res = await fetch(`/api/chat/history?userId=${encodeURIComponent(String(me.id))}&otherId=${encodeURIComponent(String(other))}&limit=200`)
          const j = await res.json()
          if (j?.ok && Array.isArray(j.messages)) results.push(...j.messages)
        }
        if (!mounted) return
        const byId = new Map<string, any>()
        for (const m of results) byId.set(String(m.id), m)
        const merged = Array.from(byId.values()).sort((a: any, b: any) => new Date(a.created_at || a.createdAt || 0).getTime() - new Date(b.created_at || b.createdAt || 0).getTime())
        const list = merged.map((m: any) => {
          let atts = undefined
          try {
            if (m.attachments) {
              if (typeof m.attachments === 'string') atts = JSON.parse(m.attachments)
              else atts = m.attachments
            }
          } catch (_) { atts = undefined }
          return {
            id: String(m.id),
            from: (String(m.senderId) === String(me.id) ? 'user' : 'recipient') as Message['from'],
            text: m.translated || m.text || '',
            lang: String(m.senderId) === String(me.id) ? undefined : 'ko',
            senderName: m.senderName || undefined,
            attachments: atts || undefined,
            created_at: m.created_at || m.createdAt || undefined
          }
        })
        setMessages(list)
        // If no history and recipient is M_marketing, show a sample conversation
        if ((list.length === 0 || !list) && recipientName === 'M_marketing') {
          const now = Date.now()
          const sample: Message[] = [
            {
              id: 'sample-1',
              from: 'recipient',
              text: '안녕하세요! รายงานการตลาดพร้อมแล้วครับ',
              lang: 'ko',
              senderName: 'M_marketing',
              created_at: new Date(now - 1000 * 60 * 10).toISOString()
            },
            {
              id: 'sample-2',
              from: 'user',
              text: 'ขอบคุณครับ จะรีบตรวจสอบและตอบกลับ',
              senderName: me?.name || 'You',
              created_at: new Date(now - 1000 * 60 * 8).toISOString()
            },
            {
              id: 'sample-3',
              from: 'recipient',
              text: 'ส่งไฟล์แนบไว้ด้านล่างครับ',
              lang: 'ko',
              senderName: 'M_marketing',
              created_at: new Date(now - 1000 * 60 * 6).toISOString(),
              attachments: [{ url: '/static/sample-report.pdf', name: 'marketing-report.pdf', type: 'application/pdf' }]
            }
          ]
          setMessages(sample)
        }
      } catch (err) {
        console.error('load history failed', err)
      }
    })()
    return () => { mounted = false }
  }, [me, recipient])

  async function handleSend() {
    if (!text.trim() && !selectedFile) return
    const id = String(Date.now())
    let attachments: Array<{ url: string; name?: string; type?: string }> | undefined = undefined
    if (selectedFile) {
      // upload file first
      try {
        const fd = new FormData()
        fd.append('file', selectedFile)
        const up = await fetch('/api/chat/upload', { method: 'POST', body: fd })
        const j = await up.json()
        if (j?.ok && Array.isArray(j.files) && j.files.length > 0) {
          attachments = [{ url: j.files[0].url, name: j.files[0].name, type: j.files[0].type }]
        }
      } catch (err) {
        console.error('upload error', err)
      }
    }

    const outgoing: Message = { id, from: "user", text, lang: undefined, senderName: me?.name, attachments }
    setMessages((m) => [...m, outgoing])
    setLoading(true)

    try {
      // send message to server; if multiple recipients selected, send one request per recipient
      const targets = Array.isArray(recipient) ? recipient : [recipient]
      for (const r of targets) {
        const body = { senderId: me?.id, senderName: me?.name, recipientId: r, text, attachments }
        await fetch('/api/chat/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
    } catch (err) {
      console.error('send failed', err)
    } finally {
      setLoading(false)
      setText("")
      // clear staged file and preview
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl) } catch (_) {}
      }
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  // typing indicator: notify server when user types
  useEffect(() => {
    if (!me || !recipient) return
    const delay = 1000
    let timer: any = null
    if (text.length > 0) {
      // notify start
      fetch('/api/chat/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: me.id, recipientId: recipient, status: 'start' }) })
      timer = setTimeout(() => {
        fetch('/api/chat/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: me.id, recipientId: recipient, status: 'stop' }) })
      }, delay)
    } else {
      fetch('/api/chat/typing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: me.id, recipientId: recipient, status: 'stop' }) })
    }
    return () => { if (timer) clearTimeout(timer) }
  }, [text, me, recipient])

  const [isTyping, setIsTyping] = useState(false)
  const [replyNotifs, setReplyNotifs] = useState<string[]>([])

  return (
    <AdminLayout title={L[uiLang].title} titleTh={L[uiLang].title}>
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{L[uiLang].title}</h2>
        </div>
        <div className={styles.cardBody}>
          {productName && (
            <div style={{ marginBottom: 12 }}>
              <strong>Product:</strong> {productName} {productId ? `(#${productId})` : ''}
            </div>
          )}

          {/* Display selected recipient name (Thai label: ส่งถึง) */}
          <div style={{ marginBottom: 12 }}>
            <strong>ส่งถึง :</strong> {recipientName || (recipient ? String(recipient) : '(ไม่ระบุ)')}
          </div>

          {isTyping && (
            <div style={{ marginBottom: 12, color: '#0b5fff', fontWeight: 600 }}>
              {typingName || recipientName || String(recipient)} {uiLang === 'th' ? 'กำลังตอบ...' : 'is replying...'}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ minWidth: 260 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L[uiLang].selectRecipient}</label>
                <select value={recipient} onChange={(e) => {
                  const val = e.target.value
                  setRecipient(val)
                  const found = recipients.find(r => String(r.id) === String(val))
                  setRecipientName(found ? found.name : null)
                }} className={styles.formSelect}>
                  {recipients.length === 0 && <option value="">(No recipients)</option>}
                  {recipients.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={styles.formTextarea} />
                {previewUrl && (
                  <div style={{ marginTop: 8, border: '1px solid #ddd', padding: 8, borderRadius: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                    {selectedFile?.type?.startsWith('image') ? (
                      <img src={previewUrl} alt={selectedFile?.name} style={{ width: 120, height: 'auto', borderRadius: 6 }} />
                    ) : (
                      <div style={{ padding: 8 }}>{selectedFile?.name}</div>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                      <button className={styles.btnOutline} onClick={() => {
                        if (previewUrl) { try { URL.revokeObjectURL(previewUrl) } catch(_){} }
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}>Remove</button>
                    </div>
                  </div>
                )}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="file" id="chat-file" style={{ display: 'none' }} onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  // stage file and show preview; actual upload happens on Send
                  setSelectedFile(f)
                  try {
                    const url = URL.createObjectURL(f)
                    setPreviewUrl(url)
                  } catch (err) {
                    console.error('preview error', err)
                  }
                }} />
                <label htmlFor="chat-file" className={`${styles.btn} ${styles.btnOutline}`} style={{ cursor: 'pointer', padding: '6px 10px' }}>Attach</label>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSend} disabled={loading}>
                  {loading ? L[uiLang].sending : L[uiLang].sendButton}
                </button>
                <button style={{ marginLeft: 8 }} className={`${styles.btn} ${styles.btnOutline}`} onClick={() => { setText('') }}>Clear</button>
              </div>
            </div>
          </div>

          <hr />
          <h3 style={{ marginTop: 12 }}>{L[uiLang].history}</h3>
          {replyNotifs.length > 0 && (
            <div style={{ margin: '8px 0', padding: 8, background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 6 }}>
              {replyNotifs.map((r, i) => <div key={`rn-${i}`} style={{ fontSize: 13, color: '#856404' }}>{r}</div>)}
            </div>
          )}
          <div>
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 8, padding: 8, borderRadius: 8, background: m.from==='user' ? '#e6f4ff' : '#f7f7f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 20, background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {(m.senderName || (m.from==='user' ? me?.name : 'R')).split(' ').map(s=>s[0]||'').slice(0,2).join('').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#444' }}>{m.senderName || (m.from === 'user' ? me?.name || L[uiLang].you : L[uiLang].recipient)} <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span></div>
                    <div style={{ marginTop: 4 }}>
                      {m.text}
                      {m.lang ? ` (${m.lang})` : ''}
                      {m.attachments?.map((a, idx) => (
                        <div key={(a && a.url) ? a.url : `att-${m.id}-${idx}`} style={{ marginTop: 6 }}>
                          {a?.type?.startsWith('image') ? (
                            <img src={a.url} alt={a.name} style={{ maxWidth: 220, borderRadius: 6 }} />
                          ) : (
                            <a href={a?.url || '#'} target="_blank" rel="noreferrer" className={styles.link}>{a?.name || a?.url}</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && <div style={{ color: '#666', padding: 12 }}>{L[uiLang].history} - empty</div>}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
