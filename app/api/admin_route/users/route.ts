import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const maxDuration = 10

/**
 * GET /api/admin_route/users
 * Retrieve all users from user_list table
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const users = await query(`
      SELECT userId, userName, password, name, email, site, typeID, create_datetime, create_by
      FROM user_list
      ORDER BY userId ASC
      LIMIT ? OFFSET ?
    `, [limit, offset])

    const total = await query(`SELECT COUNT(*) as count FROM user_list`)
    const totalCount = (total as any[])[0]?.count || 0

    return NextResponse.json({
      ok: true,
      users: users,
      total: Number(totalCount),
      limit,
      offset
    })
  } catch (err: any) {
    console.error('Failed to fetch users:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin_route/users?id=xxx
 * Update a user by userId
 */
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('id')

    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { userName, password, name, email, site, typeID } = body

    if (!userName) {
      return NextResponse.json({
        ok: false,
        error: 'userName is required'
      }, { status: 400 })
    }

    await query(`
      UPDATE user_list SET
        userName = ?,
        password = ?,
        name = ?,
        email = ?,
        site = ?,
        typeID = ?
      WHERE userId = ?
    `, [userName, password || null, name || null, email || null, site || null, typeID || null, parseInt(userId)])

    // Fetch updated user
    const result = await query(`
      SELECT userId, userName, name, email, site, typeID
      FROM user_list WHERE userId = ?
    `, [parseInt(userId)]) as any[]

    if (result.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      user: result[0],
      message: 'User updated successfully'
    })

  } catch (err: any) {
    console.error('Failed to update user:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin_route/users?id=xxx
 * Delete a user by userId
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('id')

    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    // Get user before delete
    const userBefore = await query(`
      SELECT userId, userName FROM user_list WHERE userId = ?
    `, [parseInt(userId)]) as any[]

    if (userBefore.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'User not found'
      }, { status: 404 })
    }

    await query(`DELETE FROM user_list WHERE userId = ?`, [parseInt(userId)])

    return NextResponse.json({
      ok: true,
      deleted: userBefore[0],
      message: 'User deleted successfully'
    })

  } catch (err: any) {
    console.error('Failed to delete user:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
