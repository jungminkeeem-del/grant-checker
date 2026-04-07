import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const correct = process.env.SITE_PASSWORD

  if (!correct) {
    return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 })
  }

  if (password !== correct) {
    return NextResponse.json({ error: '비밀번호가 틀렸습니다' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('site-auth', 'granted', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30일
    path: '/',
  })
  return res
}
