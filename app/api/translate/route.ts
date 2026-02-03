import { NextResponse } from 'next/server'

const LIBRE_URL = 'https://libretranslate.de'

async function translate(text: string, source: string, target: string) {
  const res = await fetch(`${LIBRE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source, target, format: 'text' }),
  })
  return res.json()
}

async function detect(text: string) {
  const res = await fetch(`${LIBRE_URL}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text }),
  })
  return res.json()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'toKorean') {
      const { text } = body
      // detect source language
      const det = await detect(text)
      const detected = Array.isArray(det) && det[0] && det[0].language ? det[0].language : 'auto'
      const t = await translate(text, detected === 'auto' ? 'auto' : detected, 'ko')
      return NextResponse.json({ translated: t.translatedText || t.translated || t.result || '', detected })
    }

    if (action === 'fromKorean') {
      const { text, targetLang } = body
      const targ = targetLang === 'auto' ? 'en' : targetLang || 'en'
      const t = await translate(text, 'ko', targ)
      return NextResponse.json({ translated: t.translatedText || t.translated || t.result || '', targetLang: targ })
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
