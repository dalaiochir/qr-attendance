import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSchema } from '../../../lib/db'

export const dynamic='force-dynamic'

export async function GET(req:NextRequest){
 try{await ensureSchema();const token=req.nextUrl.searchParams.get('token');if(!token)return NextResponse.json({error:'Token шаардлагатай.'},{status:400});const sql=db();const sessions=await sql`SELECT id,course,session_date as "sessionDate",is_open as "isOpen" FROM attendance_sessions WHERE token=${token} LIMIT 1`;if(!sessions[0])return NextResponse.json({error:'Session олдсонгүй.'},{status:404});const s=sessions[0];const records=await sql`SELECT id,student_id as "studentId",student_name as name,created_at as "createdAt" FROM attendance_records WHERE session_id=${s.id} ORDER BY created_at DESC`;return NextResponse.json({session:s,records})}catch{return NextResponse.json({error:'Database холболтын алдаа.'},{status:503})}
}

export async function POST(req:NextRequest){
 try{await ensureSchema();const {token,name,studentId}=await req.json();if(!token||!name?.trim()||!studentId?.trim())return NextResponse.json({error:'Мэдээллээ бүрэн оруулна уу.'},{status:400});const sql=db();const sessions=await sql`SELECT id,is_open as "isOpen" FROM attendance_sessions WHERE token=${token} LIMIT 1`;const s=sessions[0];if(!s)return NextResponse.json({error:'QR session хүчингүй байна.'},{status:404});if(!s.isOpen)return NextResponse.json({error:'Энэ ирцийн бүртгэл хаагдсан байна.'},{status:403});try{const id=crypto.randomUUID();await sql`INSERT INTO attendance_records(id,session_id,student_id,student_name) VALUES(${id},${s.id},${studentId.trim()},${name.trim()})`;return NextResponse.json({ok:true},{status:201})}catch(e:any){if(e?.code==='23505'||String(e?.message).includes('attendance_unique_student_session'))return NextResponse.json({error:'Таны ирц аль хэдийн бүртгэгдсэн байна.'},{status:409});throw e}}
 catch{return NextResponse.json({error:'Ирц бүртгэхэд алдаа гарлаа.'},{status:500})}
}

export async function DELETE(req:NextRequest){
 try{await ensureSchema();const token=req.nextUrl.searchParams.get('token');if(!token)return NextResponse.json({error:'Token шаардлагатай.'},{status:400});const sql=db();await sql`DELETE FROM attendance_records WHERE session_id=(SELECT id FROM attendance_sessions WHERE token=${token})`;return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'Цэвэрлэж чадсангүй.'},{status:500})}
}
