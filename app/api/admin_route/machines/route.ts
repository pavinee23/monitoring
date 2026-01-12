import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    // simple validation
    const { name, ksave, location } = body || {}
    if (!name || !ksave) return NextResponse.json({ error: 'name and ksave are required' }, { status: 400 })

    // Save to PostgreSQL database FIRST (primary data store)
    let savedDevice = null
    try {
      const result = await query(`
        INSERT INTO devices ("deviceName", "ksaveID", location, status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING "deviceID", "deviceName", "ksaveID", location, status, "createdAt", "updatedAt"
      `, [name, ksave, location || null, 'active'])

      savedDevice = result[0]
    } catch (dbErr: any) {
      console.error('PostgreSQL insert failed:', dbErr)
      return NextResponse.json({
        ok: false,
        error: `Database error: ${dbErr?.message || String(dbErr)}`
      }, { status: 500 })
    }

    // Try to write to InfluxDB (optional, don't fail if this errors)
    let influxWritten = false
    try {
      const INFLUX_HOST = process.env.INFLUX_HOST || process.env.DOCKER_INFLUXDB_INIT_HOST || process.env.INFLUX_URL || 'http://127.0.0.1:8086'
      const INFLUX_ORG = process.env.INFLUX_ORG || process.env.DOCKER_INFLUXDB_INIT_ORG || 'K-Energy_Save'
      const INFLUX_BUCKET = process.env.INFLUX_BUCKET || process.env.DOCKER_INFLUXDB_INIT_BUCKET || 'k_db'
      const INFLUX_TOKEN = process.env.INFLUX_TOKEN || process.env.DOCKER_INFLUXDB_INIT_TOKEN || ''

      // helpers for line-protocol escaping
      const escTag = (s: any) => String(s).replace(/,/g, '\\,').replace(/ /g, '\\ ').replace(/=/g, '\\=')
      const escMeasurement = (s: any) => String(s).replace(/,/g, '\\,').replace(/ /g, '\\ ')
      const formatFieldValue = (v: any) => {
        if (v === null || v === undefined) return '""'
        if (typeof v === 'boolean') return v ? 'true' : 'false'
        if (typeof v === 'number') return Number.isInteger(v) ? `${v}i` : String(v)
        return `"${String(v).replace(/"/g, '\\"')}"`
      }

      const measurement = 'machines'
      const tags: any = { device: ksave }
      if (location) tags.site = location
      if (name) tags.name = name
      const fields: any = { registered: true, createdAt: new Date().toISOString() }

      const tagPart = Object.keys(tags).map((k) => `${escTag(k)}=${escTag(tags[k])}`).join(',')
      const fieldPart = Object.keys(fields).map((k) => `${k}=${formatFieldValue(fields[k])}`).join(',')
      const head = tagPart ? `${escMeasurement(measurement)},${tagPart}` : `${escMeasurement(measurement)}`
      const line = `${head} ${fieldPart}`

      const writeUrl = `${INFLUX_HOST.replace(/\/$/, '')}/api/v2/write?org=${encodeURIComponent(INFLUX_ORG)}&bucket=${encodeURIComponent(INFLUX_BUCKET)}&precision=s`
      const headers: any = { 'Content-Type': 'text/plain; charset=utf-8' }
      if (INFLUX_TOKEN) headers.Authorization = `Token ${INFLUX_TOKEN}`

      const influxRes = await fetch(writeUrl, {
        method: 'POST',
        headers,
        body: line,
      })

      if (influxRes.ok) {
        influxWritten = true
      } else {
        console.warn('InfluxDB write failed (non-critical):', influxRes.status, await influxRes.text())
      }
    } catch (influxErr: any) {
      console.warn('InfluxDB write error (non-critical):', influxErr.message || influxErr)
    }

    return NextResponse.json({
      ok: true,
      machine: savedDevice || { name, ksave, location },
      written: 1,
      influxWritten,
      postgresWritten: true,
      note: influxWritten ? 'Machine saved to both PostgreSQL and InfluxDB' : 'Machine saved to PostgreSQL (InfluxDB write failed)'
    })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

/**
 * GET /api/admin_route/machines
 * Retrieve all machines from PostgreSQL
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const devices = await query(`
      SELECT "deviceID", "deviceName", "ksaveID", "ipAddress", location, status, "createdAt", "updatedAt"
      FROM devices
      ORDER BY "createdAt" DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    const total = await query(`SELECT COUNT(*) as count FROM devices`)
    const totalCount = total[0]?.count || 0

    return NextResponse.json({
      ok: true,
      machines: devices,
      total: Number(totalCount),
      limit,
      offset
    })
  } catch (err: any) {
    console.error('Failed to fetch machines:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin_route/machines?id=xxx
 * Update a device by deviceID
 */
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const deviceID = url.searchParams.get('id')

    if (!deviceID) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { deviceName, ksaveID, ipAddress, location, status, beforeMeterNo, metricsMeterNo } = body

    if (!deviceName || !ksaveID) {
      return NextResponse.json({
        ok: false,
        error: 'deviceName and ksaveID are required'
      }, { status: 400 })
    }

    const result = await query(`
      UPDATE devices SET
        "deviceName" = $1,
        "ksaveID" = $2,
        "ipAddress" = $3,
        location = $4,
        status = $5,
        "beforeMeterNo" = $6,
        "metricsMeterNo" = $7,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "deviceID" = $8
      RETURNING "deviceID", "deviceName", "ksaveID", "ipAddress", location, status, "beforeMeterNo", "metricsMeterNo", "createdAt", "updatedAt"
    `, [deviceName, ksaveID, ipAddress || null, location || null, status || 'active', beforeMeterNo || null, metricsMeterNo || null, parseInt(deviceID)])

    if (result.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'Device not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      device: result[0],
      message: 'Device updated successfully'
    })

  } catch (err: any) {
    console.error('Failed to update device:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin_route/machines?id=xxx
 * Delete a device by deviceID
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const deviceID = url.searchParams.get('id')

    if (!deviceID) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    const result = await query(`
      DELETE FROM devices
      WHERE "deviceID" = $1
      RETURNING "deviceID", "deviceName", "ksaveID"
    `, [parseInt(deviceID)])

    if (result.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'Device not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      deleted: result[0],
      message: 'Device deleted successfully'
    })

  } catch (err: any) {
    console.error('Failed to delete device:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
