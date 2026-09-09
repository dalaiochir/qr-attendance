'use client'

import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type Attendance = { id: string; name: string; studentId: string; time: string }

export default function Home() {
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [records, setRecords] = useState<Attendance[]>([])
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState<'checkin' | 'admin'>('checkin')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    const saved = localStorage.getItem('qr-attendance-records')
    if (saved) setRecords(JSON.parse(saved))
  }, [])

  const session = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const checkinUrl = origin ? `${origin}/?session=${session}` : ''

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !studentId.trim()) return
    const exists = records.some(r => r.studentId.toLowerCase() === studentId.trim().toLowerCase())
    if (exists) {
      setMessage('Энэ оюутны ирц аль хэдийн бүртгэгдсэн байна.')
      return
    }
    const next = [{ id: crypto.randomUUID(), name: name.trim(), studentId: studentId.trim(), time: new Date().toLocaleString('mn-MN') }, ...records]
    setRecords(next)
    localStorage.setItem('qr-attendance-records', JSON.stringify(next))
    setName('')
    setStudentId('')
    setMessage('Ирц амжилттай бүртгэгдлээ ✓')
  }

  function clearRecords() {
    if (!confirm('Бүх ирцийн бүртгэлийг устгах уу?')) return
    setRecords([])
    localStorage.removeItem('qr-attendance-records')
  }

  return (
    <main>
      <header className="header">
        <div className="brand"><span className="logo">✓</span><div><b>QR Ирц</b><small>Хурдан • Энгийн • Цаасгүй</small></div></div>
        <nav><button className={tab === 'checkin' ? 'active' : ''} onClick={() => setTab('checkin')}>Ирц бүртгэх</button><button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>Багш / Admin</button></nav>
      </header>

      {tab === 'checkin' ? (
        <section className="hero">
          <div className="intro">
            <span className="pill">Өнөөдрийн ирц • {session}</span>
            <h1>QR уншуулаад<br/><em>ирцээ бүртгүүл.</em></h1>
            <p>Нэр болон оюутны кодоо оруулаад хэдхэн секундэд ирцээ бүртгүүлээрэй.</p>
            <form onSubmit={submit} className="card form">
              <label>Овог, нэр<input value={name} onChange={e => setName(e.target.value)} placeholder="Жишээ: Б. Бат" required /></label>
              <label>Оюутны код<input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Жишээ: KCS22001" required /></label>
              <button className="primary">Ирц бүртгүүлэх →</button>
              {message && <div className={message.includes('амжилттай') ? 'success' : 'warning'}>{message}</div>}
            </form>
          </div>
          <div className="qrCard card">
            <div className="qrTitle">QR CODE</div>
            {checkinUrl && <div className="qr"><QRCodeSVG value={checkinUrl} size={220} level="H" /></div>}
            <h2>Утсаараа уншуулна уу</h2>
            <p>Камер эсвэл QR scanner ашиглан кодыг уншуулж ирцийн хуудсыг нээнэ.</p>
            <div className="count"><strong>{records.length}</strong><span>Өнөөдөр бүртгүүлсэн</span></div>
          </div>
        </section>
      ) : (
        <section className="admin">
          <div className="adminHead"><div><span className="pill">ADMIN DASHBOARD</span><h1>Өнөөдрийн ирц</h1><p>{session} • Нийт {records.length} хүн бүртгүүлсэн</p></div><button className="danger" onClick={clearRecords}>Бүртгэл цэвэрлэх</button></div>
          <div className="card tableWrap">
            {records.length === 0 ? <div className="empty">Одоогоор ирц бүртгэгдээгүй байна.</div> : <table><thead><tr><th>#</th><th>Нэр</th><th>Оюутны код</th><th>Бүртгүүлсэн цаг</th><th>Төлөв</th></tr></thead><tbody>{records.map((r,i)=><tr key={r.id}><td>{records.length-i}</td><td><b>{r.name}</b></td><td>{r.studentId}</td><td>{r.time}</td><td><span className="present">Ирсэн</span></td></tr>)}</tbody></table>}
          </div>
          <p className="note">MVP хувилбар: мэдээлэл энэ browser-ийн localStorage-д хадгалагдана. Олон төхөөрөмжийн нэгдсэн ирцэд database холбоно.</p>
        </section>
      )}
    </main>
  )
}
