import { NextRequest } from 'next/server'

export function isAdmin(req: NextRequest) {
  const configured = process.env.ADMIN_PASSWORD
  if (!configured) return false
  const supplied = req.headers.get('x-admin-password') || ''
  return supplied.length > 0 && supplied === configured
}
