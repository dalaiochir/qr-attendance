import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSchema } from '../../../lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await ensureSchema(); const sql=db()
    const rows=await sql`SELECT s.id,s.token,s.course,s.session_date as "sessionDate",s.is_open as "isOpen",s.created_at as "createdAt",COUNT(r.id)::int as count FROM attendance_sessions s LEFT JOIN attendance_records r ON r.session_id=s.id GROUP BY s.id ORDER BY s.created_at DESC LIMIT 100`
    return NextResponse.json(rows)
  } catch { return NextResponse.json({error:'Database тохируулаагүй байна.'},{status:503}) }
}

export async function POST(req:NextRequest) {
  try {
    await ensureSchema(); const {course,sessionDate}=await req.json()
    if(!course?.trim()||!sessionDate?.trim()) return NextResponse.json({error:'Хичээл болон огноо шаардлагатай.'},{status:400})
    const id=crypto.randomUUID(),token=crypto.randomUUID().replaceAll('-','')
    const sql=db(); const rows=await sql`INSERT INTO attendance_sessions(id,token,course,session_date) VALUES(${id},${token},${course.trim()},${sessionDate.trim()}) RETURNING id,token,course,session_date as "sessionDate",is_open as "isOpen",created_at as "createdAt"`
    return NextResponse.json(rows[0],{status:201})
  } catch { return NextResponse.json({error:'Session үүсгэж чадсангүй.'},{status:500}) }
}

export async function PATCH(req:NextRequest) {
  try { await ensureSchema(); const {id,isOpen}=await req.json(); const sql=db(); await sql`UPDATE attendance_sessions SET is_open=${!!isOpen} WHERE id=${id}`; return NextResponse.json({ok:true}) }
  catch { return NextResponse.json({error:'Session шинэчилж чадсангүй.'},{status:500}) }
}
