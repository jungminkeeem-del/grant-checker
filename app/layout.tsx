import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: '지원금 집행 도우미 | 김단희민요컴퍼니',
  description: '대구문화예술진흥원 지원금 집행 규정 확인 서비스',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${notoSansKR.className} h-full bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}
