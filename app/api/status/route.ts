import { NextResponse } from 'next/server'
import net from 'net'
import { execSync } from 'child_process'

async function tcpCheck(host: string, port: number, timeout = 1000) {
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket()
    let done = false
    socket.setTimeout(timeout)
    socket.once('error', () => {
      if (!done) {
        done = true
        socket.destroy()
        resolve(false)
      }
    })
    socket.once('timeout', () => {
      if (!done) {
        done = true
        socket.destroy()
        resolve(false)
      }
    })
    socket.connect(port, host, () => {
      if (!done) {
        done = true
        socket.end()
        resolve(true)
      }
    })
  })
}

export async function GET() {
  const host = '127.0.0.1'
  const influxPort = Number(process.env.INFLUX_PORT || 8086)
  const grafanaPort = Number(process.env.GRAFANA_PORT || 3000)
  const mqttPort = Number(process.env.MQTT_PORT || 1883)

  const results: any = {}

  // InfluxDB health
  try {
    const res = await fetch(`http://${host}:${influxPort}/health`, { method: 'GET', cache: 'no-store' })
    if (res.ok) {
      const body = await res.json().catch(() => ({}))
      results.influx = { ok: true, info: body }
    } else {
      results.influx = { ok: false, status: res.status }
    }
  } catch (e) {
    results.influx = { ok: false, error: String(e) }
  }

  // Grafana health
  try {
    const res = await fetch(`http://${host}:${grafanaPort}/api/health`, { method: 'GET', cache: 'no-store' })
    if (res.ok) {
      const body = await res.json().catch(() => ({}))
      results.grafana = { ok: true, info: body }
    } else {
      results.grafana = { ok: false, status: res.status }
    }
  } catch (e) {
    results.grafana = { ok: false, error: String(e) }
  }

  // MQTT TCP check
  try {
    const ok = await tcpCheck(host, mqttPort, 800)
    results.mqtt = { ok }
  } catch (e) {
    results.mqtt = { ok: false, error: String(e) }
  }

  // Telegraf: check docker container status if docker available
  try {
    let telegrafUp = false
    try {
      const out = execSync("docker ps --filter name=telegraf --format '{{.Status}}'", { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
      if (out && out.toLowerCase().includes('up')) telegrafUp = true
    } catch (e) {
      // docker not available or command failed
      telegrafUp = false
    }
    results.telegraf = { ok: telegrafUp }
  } catch (e) {
    results.telegraf = { ok: false, error: String(e) }
  }

  return NextResponse.json({ services: results })
}
