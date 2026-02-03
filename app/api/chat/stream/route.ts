import { NextResponse } from 'next/server'
import bus from '../bus'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const onMessage = (msg: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`))
        } catch (e) {
          // ignore
        }
      }

      bus.on('message', onMessage)

      const ping = setInterval(() => {
        try { controller.enqueue(encoder.encode(`:\n\n`)) } catch (_) {}
      }, 20000)

      req.signal.addEventListener('abort', () => {
        try { bus.off('message', onMessage) } catch (_) {}
        try { clearInterval(ping) } catch (_) {}
        try { controller.close() } catch (_) {}
      })
    },
    cancel() {
      // handled by abort listener
    }
  })

  const headers = new Headers({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
  return new NextResponse(stream, { headers })
}
