import { NextRequest } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'

export const ADMIN_COOKIE = 'qr_admin_session'

export function adminToken() {
  const configured = String(process.env.ADMIN_PASSWORD ?? '').trim()
  if (!configured) return ''
  return createHash('sha256').update(`qr-attendance:${configured}`).digest('hex')
}

export function isAdmin(req: NextRequest) {
  const expected = adminToken()
  const supplied = req.cookies.get(ADMIN_COOKIE)?.value || ''
  if (!expected || supplied.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
}
