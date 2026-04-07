'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || '비밀번호가 틀렸습니다')
        setPassword('')
      }
    } catch {
      setError('서버 연결에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F9FAFB', fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: '#FFFFFF', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        {/* 로고 */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: '#3182F6', boxShadow: '0 8px 24px rgba(49,130,246,0.25)' }}
          >
            🎵
          </div>
          <p className="text-xs font-semibold mb-1" style={{ color: '#8B95A1' }}>김단희민요컴퍼니</p>
          <h1 className="text-lg font-bold" style={{ color: '#191F28' }}>지원금 도우미</h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: '#8B95A1' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoFocus
              className="w-full text-sm focus:outline-none"
              style={{
                background: '#F9FAFB',
                border: error ? '1.5px solid #E53E3E' : '1.5px solid #F2F4F6',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#191F28',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = '#3182F6'
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = '#F2F4F6'
              }}
            />
            {error && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: '#E53E3E' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password.trim() || loading}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: '#3182F6',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(49,130,246,0.3)',
            }}
          >
            {loading ? '확인 중...' : '입장하기'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: '#B0B8C1' }}>
          권한이 있는 사용자만 접근할 수 있습니다
        </p>
      </div>
    </div>
  )
}
