import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    // Query with built-in retry mechanism
    const devices = await query(
      'SELECT "deviceID", "deviceName", "ksaveID", "ipAddress", location, status, "beforeMeterNo", "metricsMeterNo" FROM devices ORDER BY "deviceID"'
    )

    return NextResponse.json({
      success: true,
      count: devices.length,
      devices: devices || []
    })

  } catch (error) {
    console.error('Get devices error:', error)

    // Return empty array on error to prevent UI from breaking
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch devices: ' + (error instanceof Error ? error.message : String(error)),
        devices: [],
        count: 0
      },
      { status: 500 }
    )
  }
}
