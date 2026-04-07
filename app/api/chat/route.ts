import Anthropic from '@anthropic-ai/sdk'
import { getRegulationText } from '@/lib/pdf-loader'

const client = new Anthropic()

function buildSystemPrompt(regulationText: string): string {
  return `당신은 대구문화예술진흥원 지원금 집행 전문 도우미입니다. 김단희민요컴퍼니의 음악 콘서트 지원금 사용을 돕습니다.

아래는 2026년 대구문화예술진흥원 지원금 신청·집행·정산 설명서 전문입니다:

===== 규정 전문 시작 =====
${regulationText}
===== 규정 전문 끝 =====

## 응답 형식 (반드시 이 형식으로 답변)

## [✅ 가능 / ❌ 불가 / ⚠️ 주의 필요]

**판단 근거:**
> (해당 규정 조항을 직접 인용하거나 참조)

**증빙 체크리스트:**
- [ ] 항목 1
- [ ] 항목 2
- [ ] 항목 3

**추가 주의사항:**
(있는 경우에만 작성)

---

## 판단 원칙

1. **실질 우선**: 거래의 "명목(라벨)"이 아닌 "실질(실제 내용)"로 판단합니다.
   - 예: 의류 "대여" 명목이지만 실제로 반납하지 않고 계속 보유한다면 → ⚠️ 자산취득에 해당할 수 있음
   - 단기 임차 + 반납 예정 = ✅ 임차료로 허용 / 영구 소유 목적 = ❌ 자산취득으로 불가

2. **모호할 때**: 반드시 "⚠️ **진흥원 담당자 확인 권장**" 표시

3. **원천징수 관련 질문**: 구체적 계산 포함
   - 사업소득: 지급액 × 3.3% = 원천징수액 (지급액 × 96.7% = 실수령액)
   - 기타소득: 지급액 × 8.8% = 원천징수액 (지급액 × 91.2% = 실수령액)

4. **결제수단 주의사항**:
   - 체크카드 원칙 (법인/단체 체크카드)
   - 30만원 이상은 계좌이체 가능
   - 현금 원칙적 금지
   - 유흥업종, 위생업종(미용실 등), 레저업종(골프/노래방), 사행업종 사용 금지

5. **대표자 사례비**: 지원금의 10% 이내, 최대 2,500,000원, 원천징수 필수

6. **친인척/공직자**: 용역 계약 금지

질문이 애매하거나 추가 정보가 필요하면 되물어보세요.`
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const regulationText = await getRegulationText()

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: buildSystemPrompt(regulationText),
      messages,
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('서버 오류가 발생했습니다.', { status: 500 })
  }
}
