# Task 008: 환전 기능 구현

> **Phase**: 기능 구현 (Backend Integration)  
> **관련 US**: US-004, US-005, US-006, US-007  
> **Priority**: High (핵심 기능)

## 📋 연관 문서

- **Requirements**: 
  - [US-004](../requirements/02-user-stories.md#us-004-지갑-잔액-조회)
  - [US-005](../requirements/02-user-stories.md#us-005-실시간-환율-조회)
  - [US-006](../requirements/02-user-stories.md#us-006-환전-견적-조회)
  - [US-007](../requirements/02-user-stories.md#us-007-환전-실행)
- **Design**: 
  - [api-spec.md](../design/api-spec.md) - Server Actions 패턴
  - [data-models.md](../design/data-models.md) - 타입 정의
- **BDD**: 
  - [exchange-rates.feature](../../cypress/features/exchange/exchange-rates/latest.feature)
  - [exchange-order.feature](../../cypress/features/exchange/exchange-order.feature)
  - [wallet.feature](../../cypress/features/exchange/wallet.feature)

---

## 🎯 작업 목표

환전 기능을 구현합니다. 지갑 조회, 환율 조회, 견적 조회, 환전 실행을 위한 Server Actions와 React Query hooks를 구현합니다.

---

## 📝 구현 항목

### 1. Server Actions 구현

#### 1.1 지갑 조회 Action

```typescript
// app/actions/wallet/getWallets.ts
'use server'

import { cookies } from 'next/headers';

export interface Wallet {
  walletId: number;
  currency: string;
  balance: number;
}

export interface WalletsData {
  totalKrwBalance: number;
  wallets: Wallet[];
}

export async function getWalletsAction(): Promise<WalletsData> {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${process.env.API_BASE_URL}/wallets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '지갑 조회에 실패했습니다.');
  }
  
  const data = await response.json();
  return data.data;
}
```

#### 1.2 환율 조회 Action

```typescript
// app/actions/exchange-rate/getExchangeRates.ts
'use server'

import { cookies } from 'next/headers';

export interface ExchangeRate {
  exchangeRateId: number;
  currency: string;
  rate: number;
  changePercentage: number;
  applyDateTime: string;
}

export interface ExchangeRatesData {
  rates: ExchangeRate[];
  updatedAt: string;
}

export async function getExchangeRatesAction(): Promise<ExchangeRatesData> {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${process.env.API_BASE_URL}/exchange-rates/latest`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '환율 조회에 실패했습니다.');
  }
  
  const data = await response.json();
  return data.data;
}
```

#### 1.3 환전 견적 조회 Action

```typescript
// app/actions/order/getQuote.ts
'use server'

import { cookies } from 'next/headers';

export interface GetQuoteInput {
  fromCurrency: string;
  toCurrency: string;
  forexAmount: number;
}

export interface Quote {
  krwAmount: number;
  appliedRate: number;
}

export interface GetQuoteOutput {
  quote: Quote;
}

export async function getQuoteAction(input: GetQuoteInput): Promise<GetQuoteOutput> {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // GET 요청으로 변경
  const params = new URLSearchParams({
    fromCurrency: input.fromCurrency,
    toCurrency: input.toCurrency,
    forexAmount: input.forexAmount.toString(),
  });
  
  const response = await fetch(`${process.env.API_BASE_URL}/orders/quote?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '견적 조회에 실패했습니다.');
  }
  
  const data = await response.json();
  return { quote: data.data };
}
```

#### 1.4 환전 실행 Action

```typescript
// app/actions/order/createOrder.ts
'use server'

import { cookies } from 'next/headers';

export interface CreateOrderInput {
  exchangeRateId: number;
  fromCurrency: string;
  toCurrency: string;
  forexAmount: number;
}

export interface Order {
  orderId: number;
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
  appliedRate: number;
  orderedAt: string;
}

export interface CreateOrderOutput {
  order: Order;
}

export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderOutput> {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${process.env.API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '환전 실행에 실패했습니다.');
  }
  
  const data = await response.json();
  return { order: data.data };
}
```

---

### 2. React Query Hooks 구현

#### 2.1 지갑 조회 Hook

```typescript
// src/client/entities/wallet/hooks/useWalletsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getWalletsAction } from '@/app/actions/wallet/getWallets';

export function useWalletsQuery() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => getWalletsAction(),
    staleTime: 30 * 1000, // 30초
    retry: 3,
  });
}
```

#### 2.2 환율 조회 Hook (1분마다 자동 갱신)

```typescript
// src/client/entities/exchange-rate/hooks/useExchangeRatesQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getExchangeRatesAction } from '@/app/actions/exchange-rate/getExchangeRates';

export function useExchangeRatesQuery() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => getExchangeRatesAction(),
    staleTime: 60 * 1000, // 1분
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
    refetchOnWindowFocus: true,
    retry: 3,
  });
}
```

#### 2.3 환전 견적 조회 Hook

```typescript
// src/client/features/exchange-quote/hooks/useExchangeQuoteMutation.ts
import { useMutation } from '@tanstack/react-query';
import { getQuoteAction, GetQuoteInput } from '@/app/actions/order/getQuote';

export function useExchangeQuoteMutation() {
  return useMutation({
    mutationFn: (input: GetQuoteInput) => getQuoteAction(input),
  });
}

// Note: getQuoteAction은 GET 요청이지만 React Query에서는 
// mutationFn으로 사용 가능 (조건부 쿼리 대신)
```

#### 2.4 환전 실행 Hook

```typescript
// src/client/features/create-order/hooks/useCreateOrderMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrderAction, CreateOrderInput } from '@/app/actions/order/createOrder';

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrderAction(input),
    onSuccess: () => {
      // 환전 성공 후 지갑 잔액 자동 갱신
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Note: 주문 생성 시 exchangeRateId가 필요하므로
// UI에서 현재 환율 정보의 exchangeRateId를 전달해야 함
```

---

### 3. Public API Export

```typescript
// src/client/entities/wallet/index.ts
export { useWalletsQuery } from './hooks/useWalletsQuery';
export type { Wallet, WalletsData } from '@/app/actions/wallet/getWallets';

// src/client/entities/exchange-rate/index.ts
export { useExchangeRatesQuery } from './hooks/useExchangeRatesQuery';
export type { ExchangeRate, ExchangeRatesData } from '@/app/actions/exchange-rate/getExchangeRates';

// src/client/features/exchange-quote/index.ts
export { useExchangeQuoteMutation } from './hooks/useExchangeQuoteMutation';
export type { GetQuoteInput, Quote } from '@/app/actions/order/getQuote';

// src/client/features/create-order/index.ts
export { useCreateOrderMutation } from './hooks/useCreateOrderMutation';
export type { CreateOrderInput, Order } from '@/app/actions/order/createOrder';
```

---

## ✅ 체크리스트

### Server Actions
- [ ] `app/actions/wallet/getWallets.ts` 구현
- [ ] `app/actions/exchange-rate/getExchangeRates.ts` 구현
- [ ] `app/actions/order/getQuote.ts` 구현
- [ ] `app/actions/order/createOrder.ts` 구현
- [ ] 에러 처리 구현

### React Query Hooks
- [ ] `src/client/entities/wallet/hooks/useWalletsQuery.ts` 구현
- [ ] `src/client/entities/exchange-rate/hooks/useExchangeRatesQuery.ts` 구현
- [ ] `src/client/features/exchange-quote/hooks/useExchangeQuoteMutation.ts` 구현
- [ ] `src/client/features/create-order/hooks/useCreateOrderMutation.ts` 구현
- [ ] 환율 1분마다 자동 갱신 설정
- [ ] 환전 성공 후 지갑 잔액 자동 갱신

### Public API
- [ ] 각 모듈의 `index.ts` export

---

## 🧪 테스트

### BDD Scenarios (Cypress)

```gherkin
Feature: 지갑 잔액 조회
  Scenario: 로그인 후 지갑 잔액 표시
    Given 로그인한 상태이다
    When 환전 페이지에 접속한다
    Then 지갑 잔액이 표시된다

Feature: 환율 조회
  Scenario: 환율 정보 정상표시
    Given 로그인한 상태이다
    When 환전 페이지에 접속한다
    Then 환율 정보가 표시된다

  Scenario: 1분 후 환율 자동 갱신
    Given 환율 정보가 표시된 상태이다
    When 1분이 지난다
    Then 환율 정보가 자동으로 갱신된다

Feature: 환전 견적 조회
  Scenario: 유효한 금액 입력 시 견적 표시
    Given 환전 페이지에 있다
    When 통화와 금액을 입력한다
    Then 환전 견적이 표시된다

Feature: 환전 실행
  Scenario: 환전 성공
    Given 환전 페이지에 있고 환전 견적이 표시되어 있다
    When "환전하기" 버튼을 클릭한다
    Then 환전이 완료된다
    And 지갑 잔액이 자동으로 갱신된다
```

---

## 🎯 기대 결과

1. 환전 페이지 로드 시 지갑 잔액 자동 조회 및 표시
2. 환율 정보 실시간 표시 (1분마다 자동 갱신)
3. 통화와 금액 입력 시 환전 견적 실시간 조회
4. 환전 실행 시 성공/실패 메시지 표시
5. 환전 성공 후 지갑 잔액 자동 갱신

---

## 📝 참고사항

### 환율 자동 갱신
- `refetchInterval: 60000` (1분)
- 백그라운드에서 자동 갱신
- 사용자가 탭을 전환해도 갱신 유지

### 환전 후 갱신
- `invalidateQueries`로 관련 쿼리 무효화
- 자동으로 최신 데이터 재조회

### 에러 처리
- 잔액 부족: 명확한 에러 메시지 표시
- 네트워크 에러: 자동 재시도 (최대 3회)
- UNAUTHORIZED: 자동 로그아웃

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ⏳ To Do

