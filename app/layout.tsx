
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'بوابة مبادرات ذكية — تقييم أولي',
  description: 'نموذج أولي لتقديم وتقييم مبادرات المدارس والإدارات',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
