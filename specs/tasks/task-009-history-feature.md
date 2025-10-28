# Task 009: 환전 내역 기능 구현

> **Phase**: 기능 구현 (Backend Integration)  
> **관련 US**: US-008, US-009  
> **Priority**: Medium

## 📋 연관 문서

- **Requirements**: 
  - [US-008](../requirements/02-user-stories.md#us-008-환전-내역-목록-조회)
  - [US-009](../requirements/02-user-stories.md#us-009-환전-내역-페이지-네비게이션)
- **Design**: 
  - [api-spec.md](../design/api-spec.md) - Server Actions 패턴
  - [data-models.md](../design/data-models.md) - 타입 정의
- **BDD**: [exchange-history.feature](../../cypress/features/history/exchange-history.feature)

---

## 🎯 작업 목표

환전 내역 조회 기능을 구현합니다. Server Actions와 React Query hooks를 구현합니다.

---

## 📝 구현 항목

### 1. Server Actions 구현

#### 1.1 환전 내역 조회 Action

```typescript
// app/actions/order/getOrders.ts
'use server'

import { cookies } from 'next/headers';

export interface Order {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  fee: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface OrdersData {
  orders: Order[];
  pagination: Pagination;
}

export async function getOrdersAction(): Promise<OrdersData> {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${process.env.API_BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '환전 내역 조회에 실패했습니다.');
  }
  
  const data = await response.json();
  return data.data;
}
```

---

### 2. React Query Hooks 구현

#### 2.1 환전 내역 조회 Hook

```typescript
// src/client/entities/order/hooks/useOrdersQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getOrdersAction } from '@/app/actions/order/getOrders';

export function useOrdersQuery() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrdersAction(),
    staleTime: 30 * 1000, // 30초
    retry: 3,
  });
}
```

---

### 3. Public API Export

```typescript
// src/client/entities/order/index.ts
export { useOrdersQuery } from './hooks/useOrdersQuery';
export type { Order, OrdersData, Pagination } from '@/app/actions/order/getOrders';
```

---

## ✅ 체크리스트

### Server Actions
- [ ] `app/actions/order/getOrders.ts` 구현
- [ ] 에러 처리 구현

### React Query Hooks
- [ ] `src/client/entities/order/hooks/useOrdersQuery.ts` 구현

### Public API
- [ ] `src/client/entities/order/index.ts` export

---

## 🧪 테스트

### BDD Scenarios (Cypress)

```gherkin
Feature: 환전 내역 조회
  Scenario: 환전 내역 목록 정상 표시
    Given 로그인한 상태이다
    When 환전 내역 페이지에 접속한다
    Then 환전 내역 목록이 표시된다

  Scenario: 내역이 없을 때 안내 메시지 표시
    Given 로그인한 상태이고 환전 내역이 없다
    When 환전 내역 페이지에 접속한다
    Then "아직 환전 내역이 없습니다" 메시지가 표시된다

  Scenario: 내역 조회 실패 시 에러 처리
    Given 서버 오류가 발생한다
    When 환전 내역 페이지에 접속한다
    Then 에러 메시지가 표시된다
```

---

## 🎯 기대 결과

1. 환전 내역 페이지 로드 시 자동으로 내역 조회
2. 환전 내역 목록을 최신 순으로 표시
3. 내역이 없을 경우 안내 메시지 표시
4. 에러 발생 시 에러 메시지 및 재시도 버튼 표시

---

## 📝 참고사항

### 내역 표시 순서
- 최신순 정렬 (생성 일시 기준 내림차순)

### 내역 정보 표시 항목
- 환전 일시 (createdAt)
- 출발 통화 및 금액 (fromCurrency, fromAmount)
- 도착 통화 및 금액 (toCurrency, toAmount)
- 적용된 환율 (rate)
- 환전 상태 (status)

### 에러 처리
- UNAUTHORIZED: 자동 로그아웃
- 네트워크 에러: 자동 재시도 (최대 3회)

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ⏳ To Do

