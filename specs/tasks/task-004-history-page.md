# Task 004: 환전 내역 페이지 UI 구현

> **Phase**: UI 구현 (정적 UI)  
> **관련 US**: US-004 (환전 내역 조회)  
> **Priority**: High

## 📋 연관 문서

- **Requirements**: [US-004](../requirements/02-user-stories.md)
- **Design**: [architecture.md](../design/architecture.md) - FSD Pages 레이어
- **Design System**: [design-system.md](../design/design-system.md)
- **BDD**: [exchange-history.feature](../../cypress/features/history/exchange-history.feature)

---

## 🎯 작업 목표

환전 내역 페이지의 **정적 UI**를 구현합니다. 과거 환전 거래 내역을 테이블 형태로 표시하는 페이지를 완성합니다.

---

## 🎨 UI 요구사항 (와이어프레임 기반)

### 전체 레이아웃

```
┌────────────────────────────────────────────────────────────┐
│  Header (Task 001) - "환전 내역" 활성화                     │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  환전 내역                                                 │
│  환전 내역을 확인하실 수 있어요.                           │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 거래ID | 거래일시 | 매수금액 | 체결환율 | 매도금액  │  │
│  ├────────────────────────────────────────────────────┤  │
│  │  10   | 2025-... |  32.50  | 1,383.07 | 51,976   │  │
│  │   9   | 2025-... |   500   | 1,383.07 | 699,690  │  │
│  │   8   | 2025-... | 325.50  | 1,609.70 | 454,734  │  │
│  │  ...  |   ...    |   ...   |   ...    |   ...    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 디자인 컨셉

**"투명한 거래 이력 관리"**

- **깔끔한 테이블**: 정보를 한눈에 파악
- **명확한 구분**: 행 구분선과 호버 효과
- **데이터 정렬**: 최신 거래가 상단
- **반응형**: 모바일에서는 카드 형태로 전환

---

## 📐 상세 UI 스펙

### 1. 페이지 컨테이너

```tsx
배경: bg-surface-secondary
패딩: p-6 lg:p-8
최소 높이: min-h-screen
```

---

### 2. 헤더 섹션

```tsx
컨테이너: max-w-7xl mx-auto
여백: mb-8
```

#### 제목

```tsx
텍스트: "환전 내역"
크기: text-3xl font-bold
색상: text-text-primary
여백: mb-3
```

#### 부제목

```tsx
텍스트: "환전 내역을 확인하실 수 있어요."
크기: text-lg
색상: text-text-secondary
```

---

### 3. 테이블 컨테이너

```tsx
배경: bg-surface-primary
테두리: border border-border-primary
둥근 모서리: rounded-2xl
그림자: shadow-xl
오버플로: overflow-hidden
```

---

### 4. 테이블 구조

#### Table 헤더

```tsx
<thead className="bg-secondary-50 dark:bg-secondary-800">
  <tr>
    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
      거래 ID
    </th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
      거래 일시
    </th>
    <th className="px-6 py-4 text-right text-sm font-semibold text-secondary-900 dark:text-secondary-50">
      매수 금액
    </th>
    <th className="px-6 py-4 text-right text-sm font-semibold text-secondary-900 dark:text-secondary-50">
      체결 환율
    </th>
    <th className="px-6 py-4 text-right text-sm font-semibold text-secondary-900 dark:text-secondary-50">
      매도 금액
    </th>
  </tr>
</thead>
```

#### Table Body

```tsx
<tbody className="divide-y divide-secondary-200 dark:divide-secondary-800">
  <tr className="hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
    <td className="px-6 py-4 text-sm text-secondary-900 dark:text-secondary-50 font-medium">
      10
    </td>
    <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-400">
      2025-10-05 00:00:00
    </td>
    <td className="px-6 py-4 text-sm text-secondary-900 dark:text-secondary-50 text-right font-semibold">
      32.50
    </td>
    <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-400 text-right">
      1,383.07
    </td>
    <td className="px-6 py-4 text-sm text-secondary-900 dark:text-secondary-50 text-right font-semibold">
      51,976
    </td>
  </tr>
  <!-- More rows... -->
</tbody>
```

---

### 5. 셀 스타일링

#### 거래 ID

```tsx
정렬: text-left
굵기: font-medium
색상: text-secondary-900 dark:text-secondary-50
```

#### 거래 일시

```tsx
정렬: text-left
색상: text-secondary-600 dark:text-secondary-400
포맷: YYYY-MM-DD HH:MM:SS
```

#### 매수 금액

```tsx
정렬: text-right
굵기: font-semibold
색상: text-secondary-900 dark:text-secondary-50
```

#### 체결 환율

```tsx
정렬: text-right
색상: text-secondary-600 dark:text-secondary-400
포맷: 1,234.56 (3자리 콤마)
```

#### 매도 금액

```tsx
정렬: text-right
굵기: font-semibold
색상: text-secondary-900 dark:text-secondary-50
포맷: 123,456 (3자리 콤마)
```

---

### 6. 호버 효과

```tsx
행 호버: hover:bg-surface-secondary
트랜지션: transition-colors duration-200
커서: cursor-pointer (클릭 가능한 경우)
```

---

### 7. Empty State (내역이 없을 때)

```tsx
<div className="py-20 text-center">
  <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center">
    <History className="w-8 h-8 text-secondary-400" />
  </div>
  <p className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-2">
    환전 내역이 없습니다
  </p>
  <p className="text-sm text-secondary-600 dark:text-secondary-400">
    첫 환전을 시작해보세요
  </p>
</div>
```

---

### 8. 반응형 디자인 (모바일)

#### 카드 형태로 전환

```tsx
<div className="lg:hidden space-y-4">
  <Card className="p-4">
    <div className="flex justify-between items-start mb-3">
      <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
        거래 ID
      </span>
      <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-50">
        10
      </span>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-xs text-secondary-600 dark:text-secondary-400">
          거래 일시
        </span>
        <span className="text-xs text-secondary-900 dark:text-secondary-50">
          2025-10-05 00:00:00
        </span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-xs text-secondary-600 dark:text-secondary-400">
          매수 금액
        </span>
        <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-50">
          32.50
        </span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-xs text-secondary-600 dark:text-secondary-400">
          체결 환율
        </span>
        <span className="text-xs text-secondary-900 dark:text-secondary-50">
          1,383.07
        </span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-xs text-secondary-600 dark:text-secondary-400">
          매도 금액
        </span>
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
          51,976
        </span>
      </div>
    </div>
  </Card>
</div>
```

---

## 📁 구현할 파일

### 1. Pages - History

#### `src/client/pages/history/ui/HistoryPage.tsx`

```tsx
'use client'

import { History as HistoryIcon } from 'lucide-react'
import { Card } from '@/shared/ui'

// Mock data
const mockHistory = [
  { id: 10, date: '2025-10-05 00:00:00', buyAmount: 32.50, rate: 1383.07, sellAmount: 51976 },
  { id: 9, date: '2025-10-05 00:00:00', buyAmount: 500, rate: 1383.07, sellAmount: 699690 },
  { id: 8, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 1609.70, sellAmount: 454734 },
  { id: 7, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 1609.70, sellAmount: 454734 },
  { id: 6, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 1383.07, sellAmount: 454734 },
  { id: 5, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 942.58, sellAmount: 454734 },
  { id: 4, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 942.58, sellAmount: 454734 },
  { id: 3, date: '2025-10-05 00:00:00', buyAmount: 41698, rate: 942.58, sellAmount: 30.00 },
  { id: 2, date: '2025-10-05 00:00:00', buyAmount: 41698, rate: 1383.07, sellAmount: 30.00 },
  { id: 1, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 1383.07, sellAmount: 454734 },
]

export function HistoryPage() {
  const hasHistory = mockHistory.length > 0

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50 mb-3">
            환전 내역
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            환전 내역을 확인하실 수 있어요.
          </p>
        </div>

        {/* 테이블 컨테이너 */}
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-xl overflow-hidden">
          {hasHistory ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 dark:bg-secondary-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        거래 ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        거래 일시
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        매수 금액
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        체결 환율
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        매도 금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800">
                    {mockHistory.map((item) => (
                      <tr 
                        key={item.id}
                        className="hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-secondary-900 dark:text-secondary-50 font-medium">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-400">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-900 dark:text-secondary-50 text-right font-semibold">
                          {item.buyAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-400 text-right">
                          {item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary-900 dark:text-secondary-50 text-right font-semibold">
                          {item.sellAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {mockHistory.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
                        거래 ID
                      </span>
                      <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                        {item.id}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-secondary-600 dark:text-secondary-400">
                          거래 일시
                        </span>
                        <span className="text-xs text-secondary-900 dark:text-secondary-50">
                          {item.date}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-secondary-600 dark:text-secondary-400">
                          매수 금액
                        </span>
                        <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-50">
                          {item.buyAmount.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-secondary-600 dark:text-secondary-400">
                          체결 환율
                        </span>
                        <span className="text-xs text-secondary-900 dark:text-secondary-50">
                          {item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-secondary-600 dark:text-secondary-400">
                          매도 금액
                        </span>
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                          {item.sellAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Empty State
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center">
                <HistoryIcon className="w-8 h-8 text-secondary-400" />
              </div>
              <p className="text-lg font-semibold text-secondary-900 dark:text-secondary-50 mb-2">
                환전 내역이 없습니다
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                첫 환전을 시작해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### `src/client/pages/history/index.ts`

```tsx
export { HistoryPage } from './ui/HistoryPage'
```

---

### 2. App Router Page

#### `app/(authenticated)/history/page.tsx`

```tsx
import { HistoryPage } from '@/pages/history'

export const metadata = {
  title: '환전 내역 - Switch Won',
  description: '과거 환전 거래 내역을 확인하세요',
}

export default function Page() {
  return <HistoryPage />
}
```

---

## ✅ 완료 조건

- [ ] HistoryPage 컴포넌트 구현
- [ ] 테이블 레이아웃 (Desktop)
- [ ] 카드 레이아웃 (Mobile)
- [ ] Empty State 구현
- [ ] 호버 효과
- [ ] 숫자 포맷팅 (3자리 콤마)
- [ ] 날짜 포맷팅
- [ ] 다크모드 지원
- [ ] 반응형 디자인

---

## 🚀 AI 프롬프트

```
task-004-history-page 구현해줘
와이어프레임 기반으로 환전 내역 테이블 페이지 만들기
```

---

## 🎯 기대 결과

깔끔하고 읽기 쉬운 환전 내역 페이지가 완성됩니다! 📊

