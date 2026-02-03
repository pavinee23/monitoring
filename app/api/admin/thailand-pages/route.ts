import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  try {
    const appDir = path.join(process.cwd(), 'app', 'Thailand')
    const routes: string[] = []

    function addRoute(relPath: string) {
      // normalize to POSIX style and ensure leading /Thailand
      const cleaned = relPath.split(path.sep).filter(Boolean).join('/')
      routes.push(`/Thailand${cleaned ? '/' + cleaned : ''}`)
    }

    function walk(dir: string, rel: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const ent of entries) {
        if (ent.isDirectory()) {
          const subdir = path.join(dir, ent.name)
          const relSub = rel ? path.posix.join(rel, ent.name) : ent.name
          // if this directory contains a page file, add route for it
          const pageTsx = path.join(subdir, 'page.tsx')
          const pageJsx = path.join(subdir, 'page.js')
          if (fs.existsSync(pageTsx) || fs.existsSync(pageJsx)) {
            addRoute(relSub)
          }
          // recurse into subdirectory
          walk(subdir, relSub)
        }
      }
    }

    if (fs.existsSync(appDir)) {
      // root page
      const rootTsx = path.join(appDir, 'page.tsx')
      const rootJs = path.join(appDir, 'page.js')
      if (fs.existsSync(rootTsx) || fs.existsSync(rootJs)) addRoute('')
      walk(appDir, '')
    }

    return NextResponse.json({ ok: true, routes })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
