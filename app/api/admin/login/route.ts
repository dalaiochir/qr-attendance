import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminToken } from '../../../../lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const configured = process.env.ADMIN_PASSWORD || ''
  if (!configured) return NextResponse.json({ error: 'ADMIN_PASSWORD тохируулаагүй байна.' }, { status: 503 })
  if (String(password || '') !== configured) return NextResponse.json({ error: 'Нууц үг буруу байна.' }, { status: 401 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, adminToken(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 8 })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
  return res
}
