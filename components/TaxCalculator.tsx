'use client'

import { useState } from 'react'

export default function TaxCalculator() {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'business' | 'other'>('business')

  const numAmount = parseInt(amount.replace(/,/g, ''), 10) || 0
  const rate = type === 'business' ? 0.033 : 0.088
  const tax = Math.floor(numAmount * rate)
  const net = numAmount - tax

  const fmt = (n: number) => n.toLocaleString('ko-KR')

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = parseInt(raw, 10)
    setAmount(isNaN(num) ? '' : num.toLocaleString('ko-KR'))
  }

  return (
    <div className="py-2">
      <p className="text-xs font-semibold mb-3" style={{ color: '#8B95A1' }}>소득 유형</p>

      {/* 타입 선택 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { key: 'business', label: '사업소득', rate: '3.3%' },
          { key: 'other', label: '기타소득', rate: '8.8%' },
        ].map(({ key, label, rate: r }) => (
          <button
            key={key}
            onClick={() => setType(key as 'business' | 'other')}
            className="rounded-xl p-3 text-left transition-all"
            style={
              type === key
                ? { background: '#3182F6', border: '1.5px solid #3182F6' }
                : { background: '#F9FAFB', border: '1.5px solid #F2F4F6' }
            }
          >
            <p className="text-xs font-semibold" style={{ color: type === key ? '#FFFFFF' : '#8B95A1' }}>{label}</p>
            <p className="text-base font-bold mt-0.5" style={{ color: type === key ? '#FFFFFF' : '#191F28' }}>{r}</p>
          </button>
        ))}
      </div>

      {/* 금액 입력 */}
      <div className="mb-4">
        <label className="text-xs font-semibold block mb-2" style={{ color: '#8B95A1' }}>지급액</label>
        <div className="flex items-center rounded-xl px-4" style={{ background: '#F9FAFB', border: '1.5px solid #F2F4F6' }}>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="flex-1 py-3 text-right text-base font-bold focus:outline-none"
            style={{ background: 'transparent', color: '#191F28' }}
          />
          <span className="ml-2 text-sm font-medium" style={{ color: '#8B95A1' }}>원</span>
        </div>
      </div>

      {/* 결과 */}
      {numAmount > 0 && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: '#F9FAFB', border: '1px solid #F2F4F6' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: '#8B95A1' }}>지급액</span>
            <span className="text-sm font-semibold" style={{ color: '#191F28' }}>{fmt(numAmount)}원</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: '#8B95A1' }}>원천징수 ({(rate * 100).toFixed(1)}%)</span>
            <span className="text-sm font-semibold" style={{ color: '#E53E3E' }}>−{fmt(tax)}원</span>
          </div>
          <div className="pt-2" style={{ borderTop: '1px solid #F2F4F6' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold" style={{ color: '#191F28' }}>실수령액</span>
              <span className="text-base font-bold" style={{ color: '#3182F6' }}>{fmt(net)}원</span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs mt-3" style={{ color: '#B0B8C1', lineHeight: '1.5' }}>
        원천징수세액은 정산 시 납부영수증으로 증빙해야 합니다
      </p>
    </div>
  )
}
