import { NextResponse } from 'next/server'
import { db, ensureSchema } from '../../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await ensureSchema()
    const sql = db()
    const rows = await sql`SELECT NOW() as now`
    return NextResponse.json({ ok: true, database: 'connected', time: rows[0]?.now })
  } catch (error) {
    return NextResponse.json({ ok: false, database: 'error' }, { status: 503 })
  }
}
