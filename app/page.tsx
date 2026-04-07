'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import TaxCalculator from '@/components/TaxCalculator'
import SpendingTracker from '@/components/SpendingTracker'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const EXAMPLE_QUESTIONS = [
  '포스터 인쇄비 사용 가능해?',
  '출연료 지급할 때 원천징수는?',
  '식대 써도 돼?',
  '장비 대여 결제 어떻게 해?',
  '대표자 사례비 최대 얼마야?',
  '현수막 제작비 괜찮아?',
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'spending' | 'tax'>('spending')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error()

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let text = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: text }
          return next
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '## ❌ 오류\n\n서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="flex h-full min-h-screen" style={{ background: '#F9FAFB', fontFamily: "'Noto Sans KR', sans-serif" }}>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── 사이드바 ─── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-72 transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#FFFFFF', borderRight: '1px solid #F2F4F6' }}
      >
        {/* 로고 영역 */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid #F2F4F6' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#8B95A1' }}>김단희민요컴퍼니</p>
          <h1 className="text-base font-bold" style={{ color: '#191F28' }}>지원금 도우미</h1>
          <p className="text-xs mt-0.5" style={{ color: '#B0B8C1' }}>대구문화예술진흥원 · 2026년</p>
        </div>

        {/* 탭 */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex rounded-lg p-0.5" style={{ background: '#F2F4F6' }}>
            {(['spending', 'tax'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all"
                style={
                  sidebarTab === tab
                    ? { background: '#FFFFFF', color: '#191F28', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : { color: '#8B95A1' }
                }
              >
                {tab === 'spending' ? '지출 현황' : '원천징수'}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {sidebarTab === 'spending' ? <SpendingTracker /> : <TaxCalculator />}
        </div>

        {/* 금지 항목 */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid #F2F4F6', background: '#FAFAFA' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#8B95A1' }}>사용 불가 항목</p>
          <div className="flex flex-wrap gap-1.5">
            {['식대/회의비', '배송료', '자산취득', '예비비', '수수료', '단체운영비'].map((item) => (
              <span
                key={item}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: '#FFF0F0', color: '#E53E3E' }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* ─── 메인 ─── */}
      <main className="flex flex-col flex-1 min-w-0 max-h-screen">

        {/* 헤더 */}
        <header
          className="shrink-0 flex items-center gap-3 px-5 py-4"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #F2F4F6' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg"
            style={{ color: '#8B95A1' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: '#191F28' }}>지원금 집행규정 확인</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: '#EFF6FF', color: '#3182F6' }}
              >
                김단희민요컴퍼니
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#B0B8C1' }}>
              규정서 전문 기반 · ✅ 가능 / ❌ 불가 / ⚠️ 주의
            </p>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ color: '#8B95A1', background: '#F9FAFB', border: '1px solid #F2F4F6' }}
            >
              대화 초기화
            </button>
          )}
        </header>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">

          {/* 빈 상태 */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: '#3182F6', boxShadow: '0 8px 24px rgba(49,130,246,0.25)' }}
                >
                  🏛️
                </div>
                <h2 className="text-lg font-bold mb-1.5" style={{ color: '#191F28' }}>
                  뭐든 물어보세요
                </h2>
                <p className="text-sm" style={{ color: '#8B95A1', lineHeight: '1.7' }}>
                  지원금 사용 전에 규정 위반 여부를 확인하세요.<br />
                  증빙 서류 목록도 함께 알려드립니다.
                </p>
              </div>

              <div className="w-full max-w-md">
                <p className="text-xs font-semibold text-center mb-3" style={{ color: '#B0B8C1' }}>
                  자주 묻는 질문
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EXAMPLE_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-sm px-3.5 py-3 rounded-xl font-medium transition-all"
                      style={{
                        background: '#FFFFFF',
                        color: '#333D4B',
                        border: '1px solid #F2F4F6',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3182F6'
                        e.currentTarget.style.color = '#3182F6'
                        e.currentTarget.style.background = '#F0F6FF'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#F2F4F6'
                        e.currentTarget.style.color = '#333D4B'
                        e.currentTarget.style.background = '#FFFFFF'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 메시지 */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 message-appear ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: '#3182F6', boxShadow: '0 4px 12px rgba(49,130,246,0.3)' }}
                >
                  AI
                </div>
              )}

              <div
                className="max-w-[80%] rounded-2xl px-4 py-3.5"
                style={
                  msg.role === 'user'
                    ? {
                        background: '#3182F6',
                        color: '#FFFFFF',
                        borderRadius: '18px 18px 4px 18px',
                        boxShadow: '0 4px 12px rgba(49,130,246,0.25)',
                      }
                    : {
                        background: '#FFFFFF',
                        border: '1px solid #F2F4F6',
                        borderRadius: '4px 18px 18px 18px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }
                }
              >
                {msg.role === 'assistant' ? (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || ' '}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: '#F2F4F6', color: '#8B95A1' }}
                >
                  나
                </div>
              )}
            </div>
          ))}

          {/* 로딩 */}
          {loading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
            <div className="flex gap-3 justify-start message-appear">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: '#3182F6', boxShadow: '0 4px 12px rgba(49,130,246,0.3)' }}
              >
                AI
              </div>
              <div
                className="rounded-2xl px-4 py-3.5"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #F2F4F6',
                  borderRadius: '4px 18px 18px 18px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: '#3182F6', animationDelay: `${delay}ms`, opacity: 0.6 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 */}
        <div
          className="shrink-0 px-5 py-4"
          style={{ background: '#FFFFFF', borderTop: '1px solid #F2F4F6' }}
        >
          <div className="flex gap-2 items-end max-w-2xl mx-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="예: 공연장 대관료를 현금으로 내도 돼?"
              rows={1}
              className="flex-1 text-sm resize-none focus:outline-none"
              style={{
                background: '#F9FAFB',
                border: '1.5px solid #F2F4F6',
                borderRadius: '12px',
                padding: '12px 16px',
                maxHeight: '120px',
                color: '#191F28',
                transition: 'border-color 0.15s',
                lineHeight: '1.6',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3182F6')}
              onBlur={(e) => (e.target.style.borderColor = '#F2F4F6')}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: '#3182F6',
                boxShadow: '0 4px 12px rgba(49,130,246,0.3)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-2 text-xs" style={{ color: '#B0B8C1' }}>
            Enter 전송 · Shift+Enter 줄바꿈 · AI 판단이므로 최종 확인은 담당자에게
          </p>
        </div>
      </main>
    </div>
  )
}
