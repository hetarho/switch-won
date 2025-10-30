# Task 003: 환전하기 페이지 UI 구현

> **Phase**: UI 구현 (정적 UI)  
> **관련 US**: US-002 (환전 견적), US-003 (환전 실행)  
> **Priority**: High

## 📋 연관 문서

- **Requirements**: [US-002, US-003](../requirements/02-user-stories.md)
- **Design**: [architecture.md](../design/architecture.md) - FSD Pages 레이어
- **BDD**: [exchange.feature](../../cypress/features/exchange/)

---

## 🎯 작업 목표

환전하기 페이지의 **정적 UI**를 구현합니다. 실시간 환율 조회, 지갑 잔액 표시, 환전 견적 계산 UI를 완성합니다.

---

## 🎨 UI 요구사항 (와이어프레임 기반)

### 전체 레이아웃

```
┌────────────────────────────────────────────────────────────┐
│  Header (Task 001)                                         │
└────────────────────────────────────────────────────────────┘
┌─────────────────────┬──────────────────────────────────────┐
│                     │                                      │
│   환율 정보         │        환전 폼                       │
│   ─────────         │        ────────                      │
│   USD 1,320.50 KRW  │   USD 환전하기 [▼]                  │
│   ▲ +13.5%          │   [매도] [매입]                      │
│                     │                                      │
│   JPY 9.85 KRW      │   매도 금액                          │
│   ▼ -1.1%           │   [30] 달러 입력                     │
│                     │   ⇅                                  │
│   내 지갑           │   원화 환율                          │
│   ─────             │   42,530 원 받으실거예요             │
│   KRW ₩1,200,000    │                                      │
│   USD $50,000       │   적용 환율                          │
│   JPY ₩150,000      │   1 USD = 1,320.50 원               │
│                     │                                      │
│   총 보유 자산      │   [    환전하기    ]                 │
│   ₩ 3,000,000       │                                      │
│                     │                                      │
└─────────────────────┴──────────────────────────────────────┘
```

### 디자인 컨셉

**"투명한 금융 거래의 시각화"**

- **2단 레이아웃**: 정보(좌) + 액션(우)
- **실시간 환율**: 변동률을 색상으로 표현
- **명확한 계산**: 입력 → 결과가 즉시 보임
- **안전한 거래**: 지갑 잔액 확인 → 환전 실행

---

## 📐 상세 UI 스펙

### 1. 페이지 컨테이너

```tsx
배경: bg-surface-secondary
패딩: p-6 lg:p-8
최소 높이: min-h-screen
```

---

### 2. 메인 레이아웃 (2단)

```tsx
컨테이너: max-w-7xl mx-auto
그리드: grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6
```

---

## 📐 좌측: 환율 정보 영역

### 1. 섹션 제목

```tsx
텍스트: "환율 정보"
크기: text-2xl font-bold
색상: text-text-primary
여백: mb-6
```

### 2. 환율 카드 (USD)

```tsx
배경: bg-surface-primary
테두리: border border-border-primary
둥근 모서리: rounded-xl
패딩: p-6
그림자: shadow-md
여백: mb-4
```

#### 카드 구조

```tsx
<Card>
  <div className="flex items-start justify-between">
    {/* 좌측 */}
    <div>
      <p className="text-sm text-secondary-600 dark:text-secondary-400">미국 달러</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-bold text-secondary-900 dark:text-secondary-50">
          1,320.50
        </span>
        <span className="text-lg text-secondary-600 dark:text-secondary-400">
          KRW
        </span>
      </div>
    </div>
    
    {/* 우측 */}
    <div className="flex flex-col items-end">
      <span className="text-xs text-secondary-500">미국 달러</span>
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp className="w-4 h-4 text-success" />
        <span className="text-sm font-semibold text-success">+13.5%</span>
      </div>
    </div>
  </div>
</Card>
```

#### 상승/하락 표시

**상승**:
```tsx
아이콘: TrendingUp (lucide-react)
색상: text-success (green-600)
배경: bg-green-50 dark:bg-green-900/20
```

**하락**:
```tsx
아이콘: TrendingDown (lucide-react)
색상: text-error (red-600)
배경: bg-red-50 dark:bg-red-900/20
```

---

### 3. 내 지갑 섹션

```tsx
제목: "내 지갑"
크기: text-xl font-semibold
색상: text-text-primary
여백: mt-8 mb-4
```

#### 지갑 카드

```tsx
배경: bg-surface-primary
테두리: border border-border-primary
둥근 모서리: rounded-xl
패딩: p-6
```

#### 지갑 아이템

```tsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-sm text-secondary-600 dark:text-secondary-400">KRW</span>
    <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">
      ₩ 1,200,000
    </span>
  </div>
  
  <div className="flex items-center justify-between">
    <span className="text-sm text-secondary-600 dark:text-secondary-400">USD</span>
    <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">
      $ 50,000
    </span>
  </div>
  
  <div className="flex items-center justify-between">
    <span className="text-sm text-secondary-600 dark:text-secondary-400">JPY</span>
    <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-50">
      ¥ 150,000
    </span>
  </div>
</div>
```

---

### 4. 총 보유 자산

```tsx
배경: bg-surface-invert
테두리: border border-border-primary
둥근 모서리: rounded-xl
패딩: p-6
여백: mt-4
그림자: shadow-lg
```

```tsx
<div className="bg-surface-invert rounded-xl p-6 shadow-lg border border-border-primary">
  <p className="text-sm text-text-invert opacity-80">총 보유 자산</p>
  <p className="text-3xl font-bold text-text-invert mt-2">₩ 3,000,000</p>
</div>
```

---

## 📐 우측: 환전 폼 영역

### 1. 폼 카드 컨테이너

```tsx
배경: bg-surface-primary
테두리: border border-border-primary
둥근 모서리: rounded-2xl
패딩: p-8
그림자: shadow-xl
```

---

### 2. 통화 선택 드롭다운

```tsx
컴포넌트: Select (shadcn/ui)
라벨: "USD 환전하기"
옵션:
  - 🇺🇸 미국 USD
  - 🇯🇵 일본 JPY
```

#### 드롭다운 버튼

```tsx
<Button variant="outline" className="w-full justify-between">
  <div className="flex items-center gap-2">
    <span className="text-2xl">🇺🇸</span>
    <span className="font-semibold">USD 환전하기</span>
  </div>
  <ChevronDown className="w-5 h-5" />
</Button>
```

---

### 3. 매도/매입 토글

```tsx
컴포넌트: Tabs (shadcn/ui) 또는 ToggleGroup
옵션: [매도] [매입]
```

#### 토글 버튼

```tsx
<div className="flex gap-2 mt-6">
  <Button 
    variant={activeTab === 'sell' ? 'default' : 'outline'}
    className="flex-1"
  >
    매도
  </Button>
  <Button 
    variant={activeTab === 'buy' ? 'default' : 'outline'}
    className="flex-1"
  >
    매입
  </Button>
</div>
```

**활성 상태**:
```tsx
배경: bg-primary-500 text-white
비활성: border-border-primary text-text-secondary
```

---

### 4. 금액 입력 섹션

#### 라벨

```tsx
텍스트: "매도 금액" (또는 "매입 금액")
크기: text-sm font-medium
색상: text-text-secondary
여백: mt-6 mb-2
```

#### 입력 필드

```tsx
<div className="relative">
  <Input
    type="number"
    placeholder="30"
    className="h-14 text-right pr-20 text-2xl font-semibold"
  />
  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-500">
    달러 입력
  </div>
</div>
```

---

### 5. 환전 방향 아이콘

```tsx
위치: 중앙
아이콘: ArrowDownUp (lucide-react)
크기: w-8 h-8
색상: text-secondary-400
배경: bg-secondary-100 dark:bg-secondary-800
둥근: rounded-full p-2
여백: my-4 mx-auto
```

```tsx
<div className="flex justify-center my-4">
  <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
    <ArrowDownUp className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
  </div>
</div>
```

---

### 6. 결과 표시 섹션

#### 라벨

```tsx
텍스트: "원화 환율"
크기: text-sm font-medium
색상: text-secondary-700 dark:text-secondary-300
여백: mb-2
```

#### 결과 카드

```tsx
배경: bg-surface-secondary
테두리: border border-border-primary
둥근: rounded-xl
패딩: p-4
```

**매도 시**:
```tsx
<div className="text-right">
  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
    42,530
  </span>
  <span className="text-lg text-secondary-600 dark:text-secondary-400 ml-2">
    원 받으실거예요
  </span>
</div>
```

**매입 시**:
```tsx
<div className="text-right">
  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
    42,530
  </span>
  <span className="text-lg text-secondary-600 dark:text-secondary-400 ml-2">
    원 보내 수 있어요
  </span>
</div>
```

---

### 7. 적용 환율 표시

```tsx
여백: mt-6 mb-8
정렬: text-center
```

```tsx
<div className="flex items-center justify-center gap-2 text-text-secondary">
  <span className="text-sm">적용 환율</span>
  <span className="font-semibold text-text-primary">
    1 USD = 1,320.50 원
  </span>
</div>
```

---

### 8. 환전하기 버튼

```tsx
<Button
  type="submit"
  className="w-full h-14 bg-surface-invert hover:opacity-90 text-text-invert font-semibold text-lg shadow-xl"
  data-testid="exchange-button"
>
  환전하기
</Button>
```

---

## 📁 구현할 파일

### 1. Pages - Exchange

#### `src/client/pages/exchange/ui/ExchangePage.tsx`

```tsx
'use client'

import { TrendingUp, TrendingDown, ArrowDownUp, ChevronDown } from 'lucide-react'
import { Button, Input, Card } from '@/shared/ui'

export function ExchangePage() {
  return (
    <div className="min-h-screen bg-surface-secondary p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* 좌측: 환율 정보 */}
          <aside>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              환율 정보
            </h2>
            
            {/* USD 환율 카드 */}
            <Card className="p-6 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">미국 달러</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-text-primary">
                      1,320.50
                    </span>
                    <span className="text-lg text-text-secondary">
                      KRW
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-xs text-text-tertiary">미국 달러</span>
                  <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">+13.5%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* JPY 환율 카드 */}
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">일본 엔</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-text-primary">
                      9.85
                    </span>
                    <span className="text-lg text-text-secondary">
                      KRW
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-xs text-text-tertiary">일본 엔</span>
                  <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">-1.1%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 내 지갑 */}
            <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">
              내 지갑
            </h3>
            
            <Card className="p-6 mb-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">KRW</span>
                  <span className="text-lg font-semibold text-text-primary">
                    ₩ 1,200,000
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">USD</span>
                  <span className="text-lg font-semibold text-text-primary">
                    $ 50,000
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">JPY</span>
                  <span className="text-lg font-semibold text-text-primary">
                    ¥ 150,000
                  </span>
                </div>
              </div>
            </Card>

            {/* 총 보유 자산 */}
            <div className="bg-surface-invert rounded-xl p-6 shadow-lg border border-border-primary">
              <p className="text-sm text-text-invert opacity-80">총 보유 자산</p>
              <p className="text-3xl font-bold text-text-invert mt-2">₩ 3,000,000</p>
            </div>
          </aside>

          {/* 우측: 환전 폼 */}
          <main>
            <Card className="p-8">
              {/* 통화 선택 */}
              <Button variant="outline" className="w-full justify-between h-14">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="font-semibold text-lg">USD 환전하기</span>
                </div>
                <ChevronDown className="w-5 h-5" />
              </Button>

              {/* 매도/매입 토글 */}
              <div className="flex gap-2 mt-6">
                <Button className="flex-1 h-12 bg-primary-500 hover:bg-primary-600">
                  매도
                </Button>
                <Button variant="outline" className="flex-1 h-12">
                  매입
                </Button>
              </div>

              {/* 매도 금액 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  매도 금액
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="30"
                    className="h-14 text-right pr-24 text-2xl font-semibold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                    달러 입력
                  </div>
                </div>
              </div>

              {/* 환전 방향 */}
              <div className="flex justify-center my-6">
                <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                  <ArrowDownUp className="w-5 h-5 text-text-tertiary" />
                </div>
              </div>

              {/* 원화 환율 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  원화 환율
                </label>
                <div className="bg-surface-secondary border border-border-primary rounded-xl p-4">
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary-600">
                      42,530
                    </span>
                    <span className="text-lg text-text-secondary ml-2">
                      원 받으실거예요
                    </span>
                  </div>
                </div>
              </div>

              {/* 적용 환율 */}
              <div className="flex items-center justify-center gap-2 text-text-secondary my-6">
                <span className="text-sm">적용 환율</span>
                <span className="font-semibold text-text-primary">
                  1 USD = 1,320.50 원
                </span>
              </div>

              {/* 환전하기 버튼 */}
              <Button
                type="submit"
                className="w-full h-14 bg-surface-invert hover:opacity-90 text-text-invert font-semibold text-lg shadow-xl"
                data-testid="exchange-button"
              >
                환전하기
              </Button>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
```

#### `src/client/pages/exchange/index.ts`

```tsx
export { ExchangePage } from './ui/ExchangePage'
```

---

### 2. App Router Page

#### `app/(authenticated)/exchange/page.tsx`

```tsx
import { ExchangePage } from '@/pages/exchange'

export const metadata = {
  title: '환전하기 - Switch Won',
  description: '실시간 환율로 안전하게 환전하세요',
}

export default function Page() {
  return <ExchangePage />
}
```

---

## ✅ 완료 조건

- [ ] ExchangePage 컴포넌트 구현
- [ ] 2단 레이아웃 (반응형)
- [ ] 환율 카드 (상승/하락 표시)
- [ ] 지갑 잔액 표시
- [ ] 총 보유 자산 카드
- [ ] 통화 선택 드롭다운
- [ ] 매도/매입 토글
- [ ] 금액 입력 필드
- [ ] 환율 계산 결과 표시
- [ ] 환전하기 버튼
- [ ] 다크모드 지원
- [ ] data-testid 추가

---

## 🚀 AI 프롬프트

```
task-003-exchange-page 구현해줘
와이어프레임 기반으로 2단 레이아웃 환전 페이지 만들기
```

---

## 🎯 기대 결과

실시간 환율 정보를 확인하고, 간편하게 환전할 수 있는 직관적인 UI가 완성됩니다! 💱

