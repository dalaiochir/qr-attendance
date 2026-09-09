import { neon } from '@neondatabase/serverless'

export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured')
  return neon(process.env.DATABASE_URL)
}

let ready: Promise<void> | null = null
export function ensureSchema() {
  if (ready) return ready
  ready = (async () => {
    const sql = db()
    await sql`CREATE TABLE IF NOT EXISTS attendance_sessions (
      id UUID PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      course TEXT NOT NULL,
      session_date TEXT NOT NULL,
      is_open BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
    await sql`CREATE TABLE IF NOT EXISTS attendance_records (
      id UUID PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique_student_session ON attendance_records(session_id, LOWER(student_id))`
    await sql`CREATE INDEX IF NOT EXISTS attendance_records_session_idx ON attendance_records(session_id, created_at DESC)`
  })()
  return ready
}
