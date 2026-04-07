'use client'

import { useState, useEffect } from 'react'

interface SpendingEntry {
  id: string
  date: string
  category: string
  description: string
  amount: number
  status: '✅' | '❌' | '⚠️'
  notes: string
}

const CATEGORIES = [
  '출연료', '대관료', '장비임차료', '홍보물', 'SNS 광고비',
  '의상임차료', '의상수선비', '제작비', '발간비', '대표자사례비', '기타',
]

const STORAGE_KEY = 'grant-spending-2026'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  '✅': { bg: '#F0FFF4', color: '#38A169' },
  '⚠️': { bg: '#FFFBEB', color: '#D97706' },
  '❌': { bg: '#FFF5F5', color: '#E53E3E' },
}

export default function SpendingTracker({ totalGrant }: { totalGrant?: number }) {
  const [entries, setEntries] = useState<SpendingEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: CATEGORIES[0],
    description: '',
    amount: '',
    status: '✅' as '✅' | '❌' | '⚠️',
    notes: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setEntries(JSON.parse(saved))
  }, [])

  const save = (next: SpendingEntry[]) => {
    setEntries(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addEntry = () => {
    if (!form.description || !form.amount) return
    const entry: SpendingEntry = {
      id: Date.now().toString(),
      date: form.date,
      category: form.category,
      description: form.description,
      amount: parseInt(form.amount.replace(/,/g, ''), 10),
      status: form.status,
      notes: form.notes,
    }
    save([...entries, entry])
    setForm({ date: new Date().toISOString().split('T')[0], category: CATEGORIES[0], description: '', amount: '', status: '✅', notes: '' })
    setShowForm(false)
  }

  const deleteEntry = (id: string) => save(entries.filter((e) => e.id !== id))

  const total = entries.reduce((s, e) => s + e.amount, 0)
  const remaining = totalGrant ? totalGrant - total : null
  const fmt = (n: number) => n.toLocaleString('ko-KR')

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = parseInt(raw, 10)
    setForm({ ...form, amount: isNaN(num) ? '' : num.toLocaleString('ko-KR') })
  }

  const inputStyle = {
    background: '#F9FAFB',
    border: '1.5px solid #F2F4F6',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.8125rem',
    color: '#191F28',
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="py-2">
      {/* 합계 카드 */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#3182F6' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>총 사용액</p>
        <p className="text-xl font-bold" style={{ color: '#FFFFFF' }}>{fmt(total)}원</p>
        {remaining !== null && (
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
            잔액 {fmt(remaining)}원
          </p>
        )}
      </div>

      {/* 추가 버튼 */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-2.5 rounded-xl text-sm font-semibold mb-3 transition-all"
        style={
          showForm
            ? { background: '#F2F4F6', color: '#8B95A1', border: '1.5px solid #F2F4F6' }
            : { background: '#EFF6FF', color: '#3182F6', border: '1.5px solid #DBEAFE' }
        }
      >
        {showForm ? '취소' : '+ 지출 추가'}
      </button>

      {/* 입력 폼 */}
      {showForm && (
        <div className="rounded-xl p-3 mb-3 space-y-2.5" style={{ background: '#F9FAFB', border: '1px solid #F2F4F6' }}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#8B95A1' }}>날짜</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#8B95A1' }}>판정</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as '✅' | '❌' | '⚠️' })}
                style={inputStyle}
              >
                <option value="✅">✅ 가능</option>
                <option value="⚠️">⚠️ 주의</option>
                <option value="❌">❌ 불가</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#8B95A1' }}>항목</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#8B95A1' }}>내용</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="예: 조명 장비 임차 (3일)"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#8B95A1' }}>금액</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={handleAmountInput}
              placeholder="0"
              style={{ ...inputStyle, textAlign: 'right' }}
            />
          </div>

          <button
            onClick={addEntry}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: '#3182F6', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(49,130,246,0.25)' }}
          >
            저장하기
          </button>
        </div>
      )}

      {/* 목록 */}
      {entries.length === 0 ? (
        <p className="text-center text-sm py-6" style={{ color: '#B0B8C1' }}>아직 기록이 없어요</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {[...entries].reverse().map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2.5 rounded-xl p-3 group"
              style={{ background: '#FFFFFF', border: '1px solid #F2F4F6' }}
            >
              <span
                className="text-xs font-bold w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={STATUS_STYLE[entry.status]}
              >
                {entry.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: '#191F28' }}>{entry.description}</p>
                <p className="text-xs mt-0.5" style={{ color: '#B0B8C1' }}>{entry.date} · {entry.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold" style={{ color: '#191F28' }}>{fmt(entry.amount)}</p>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#E53E3E' }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
