import './globals.css'

export const metadata = {
  title: 'QR Ирц бүртгэл',
  description: 'QR код ашиглан ирц бүртгэх систем',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  )
}
