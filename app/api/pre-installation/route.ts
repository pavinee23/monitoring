import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const maxDuration = 10

/**
 * Generate a unique Pre-installation number
 * Format: PI-YYYYMMDD-XXX
 */
async function generatePreInstallNo(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '') // YYYYMMDD

  // Get count of forms created today
  const result = await query(`
    SELECT COUNT(*) as count
    FROM pre_installation_forms
    WHERE DATE(created_at) = CURDATE()
  `) as any[]

  const count = (result[0]?.count || 0) + 1
  const seqNum = String(count).padStart(3, '0')

  return `PI-${dateStr}-${seqNum}`
}

/**
 * POST /api/pre-installation
 * Create a new pre-installation form
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      customer_name,
      site_address,
      contact_phone,
      inspection_date,
      checklist
    } = body

    // Validate required fields
    if (!customer_name || !site_address) {
      return NextResponse.json({
        success: false,
        error: 'Customer name and site address are required'
      }, { status: 400 })
    }

    // Generate unique Pre-installation number
    const preInstallNo = await generatePreInstallNo()

    // Get user info from token if available (for created_by)
    let createdBy = 'System'
    try {
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        // Extract user info if needed
        // For now, we'll use 'System' or extract from body if provided
      }
    } catch {}

    // Enhance checklist with customer info
    const enhancedChecklist = {
      ...checklist,
      customerInfo: {
        customer_name,
        contact_phone,
        inspection_date
      }
    }

    // Insert into database
    const result = await query(`
      INSERT INTO pre_installation_forms
      (\`Pre-installNo\`, site_address, checklist, status, created_by, created_at)
      VALUES (?, ?, ?, 'pending', ?, NOW())
    `, [
      preInstallNo,
      site_address,
      JSON.stringify(enhancedChecklist),
      createdBy
    ])

    return NextResponse.json({
      success: true,
      formID: (result as any).insertId,
      preInstallNo: preInstallNo,
      message: 'Pre-installation form created successfully'
    })

  } catch (err: any) {
    console.error('Failed to create pre-installation form:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * GET /api/pre-installation
 * Retrieve pre-installation forms
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const formID = url.searchParams.get('id')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    if (formID) {
      // Get specific form
      const forms = await query(`
        SELECT formID, \`Pre-installNo\` as preInstallNo, site_address, checklist,
               photos, notes, status, created_by, created_at
        FROM pre_installation_forms
        WHERE formID = ?
      `, [parseInt(formID)])

      if ((forms as any[]).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Form not found'
        }, { status: 404 })
      }

      // Parse JSON fields
      const form = (forms as any[])[0]
      if (form.checklist && typeof form.checklist === 'string') {
        form.checklist = JSON.parse(form.checklist)
      }
      if (form.photos && typeof form.photos === 'string') {
        form.photos = JSON.parse(form.photos)
      }

      return NextResponse.json({
        success: true,
        form
      })
    } else {
      // Get all forms with pagination
      const forms = await query(`
        SELECT formID, \`Pre-installNo\` as preInstallNo, site_address,
               status, created_by, created_at
        FROM pre_installation_forms
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset])

      const total = await query(`SELECT COUNT(*) as count FROM pre_installation_forms`)
      const totalCount = (total as any[])[0]?.count || 0

      return NextResponse.json({
        success: true,
        forms,
        total: Number(totalCount),
        limit,
        offset
      })
    }

  } catch (err: any) {
    console.error('Failed to fetch pre-installation forms:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * PUT /api/pre-installation?id=xxx
 * Update a pre-installation form
 */
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const formID = url.searchParams.get('id')

    if (!formID) {
      return NextResponse.json({
        success: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    const body = await req.json()
    const { site_address, checklist, photos, notes, status } = body

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []

    if (site_address !== undefined) {
      updates.push('site_address = ?')
      values.push(site_address)
    }
    if (checklist !== undefined) {
      updates.push('checklist = ?')
      values.push(JSON.stringify(checklist))
    }
    if (photos !== undefined) {
      updates.push('photos = ?')
      values.push(JSON.stringify(photos))
    }
    if (notes !== undefined) {
      updates.push('notes = ?')
      values.push(notes)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 })
    }

    values.push(parseInt(formID))

    await query(`
      UPDATE pre_installation_forms
      SET ${updates.join(', ')}
      WHERE formID = ?
    `, values)

    // Fetch updated form
    const result = await query(`
      SELECT formID, \`Pre-installNo\` as preInstallNo, site_address, checklist,
             photos, notes, status, created_by, created_at
      FROM pre_installation_forms
      WHERE formID = ?
    `, [parseInt(formID)]) as any[]

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Form not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      form: result[0],
      message: 'Form updated successfully'
    })

  } catch (err: any) {
    console.error('Failed to update pre-installation form:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * DELETE /api/pre-installation?id=xxx
 * Delete a pre-installation form
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const formID = url.searchParams.get('id')

    if (!formID) {
      return NextResponse.json({
        success: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    // Get form before delete
    const formBefore = await query(`
      SELECT formID, \`Pre-installNo\` FROM pre_installation_forms WHERE formID = ?
    `, [parseInt(formID)]) as any[]

    if (formBefore.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Form not found'
      }, { status: 404 })
    }

    await query(`DELETE FROM pre_installation_forms WHERE formID = ?`, [parseInt(formID)])

    return NextResponse.json({
      success: true,
      deleted: formBefore[0],
      message: 'Form deleted successfully'
    })

  } catch (err: any) {
    console.error('Failed to delete pre-installation form:', err)
    return NextResponse.json({
      success: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
