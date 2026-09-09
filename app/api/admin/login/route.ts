import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminToken, isAdmin } from '../../../../lib/auth'

function clean(value: unknown) {
  return String(value ?? '').trim()
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isAdmin(req) })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supplied = clean(body.password)
    const configured = clean(process.env.ADMIN_PASSWORD)
    if (!configured) return NextResponse.json({ error: 'ADMIN_PASSWORD production deployment дээр олдсонгүй. Vercel Environment Variables тохиргоог шалгаад Redeploy хийнэ үү.' }, { status: 503 })
    if (!supplied || supplied !== configured) return NextResponse.json({ error: 'Нууц үг таарахгүй байна.' }, { status: 401 })
    const res = NextResponse.json({ ok: true })
    res.cookies.set(ADMIN_COOKIE, adminToken(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Нэвтрэх хүсэлтийг боловсруулж чадсангүй.' }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
