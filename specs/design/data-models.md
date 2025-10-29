# Data Models: Switch Won

> **Note**: 이 문서는 TypeScript 타입 정의만 포함합니다. 구체적인 응답 구조는 Requirements 문서를 참고하세요.

## 📋 목차

- [타입 파일 위치](#타입-파일-위치)
- [Entity Models](#entity-models)
- [Server Action Types](#server-action-types)
- [React Query Types](#react-query-types)
- [Common Types](#common-types)

---

## 📦 타입 파일 위치

### 디렉토리 구조

```
src/
├── entities/
│   ├── user/
│   │   └── types.ts              # User 도메인 타입
│   ├── wallet/
│   │   └── types.ts              # Wallet 도메인 타입
│   ├── exchange-rate/
│   │   └── types.ts              # ExchangeRate 도메인 타입
│   └── order/
│       └── types.ts              # Order 도메인 타입
└── shared/
    └── types/
        └── common.ts             # 공통 타입
```

### 타입 정의 원칙

- ✅ 각 Entity는 독립적인 types.ts 파일 보유
- ✅ Server Actions 입력/출력 타입도 Entity types.ts에 정의
- ✅ 공통 타입만 shared/types/에 위치
- ❌ API 클라이언트 타입 불필요 (Server Actions 사용)

---

## 👤 Entity Models

### User (사용자)

```typescript
// src/entities/user/model/types.ts

/**
 * 사용자 엔티티
 */
export interface User {
  /** 사용자 고유 ID */
  id: string;
  
  /** 이메일 주소 */
  email: string;
  
  /** 사용자 이름 */
  name: string;
  
  /** 계정 생성 일시 */
  createdAt: string; // ISO 8601
}

/**
 * 인증 컨텍스트 타입
 */
export interface AuthContextType {
  /** 현재 로그인한 사용자 정보 */
  user: User | null;
  
  /** 로그인 여부 */
  isAuthenticated: boolean;
  
  /** 로딩 상태 */
  isLoading: boolean;
  
  /** 로그인 함수 */
  login: (token: string, user: User) => void;
  
  /** 로그아웃 함수 */
  logout: () => void;
}
```

---

### Wallet (지갑)

```typescript
// src/entities/wallet/model/types.ts

/**
 * 지갑 엔티티
 */
export interface Wallet {
  /** 지갑 ID */
  walletId: number;
  
  /** 통화 코드 (ISO 4217) */
  currency: Currency;
  
  /** 잔액 */
  balance: number;
}

/**
 * 지갑 목록 응답
 */
export interface WalletsData {
  /** 총 원화 잔액 */
  totalKrwBalance: number;
  
  /** 지갑 목록 */
  wallets: Wallet[];
}

/**
 * 지갑 잔액 조회 함수 반환 타입
 */
export interface UseWalletsQueryResult {
  /** 지갑 데이터 */
  wallets: Wallet[] | undefined;
  
  /** 로딩 상태 */
  isLoading: boolean;
  
  /** 에러 */
  error: Error | null;
  
  /** 재시도 함수 */
  refetch: () => void;
}
```

---

### Exchange Rate (환율)

```typescript
// src/entities/exchange-rate/model/types.ts

/**
 * 환율 엔티티
 */
export interface ExchangeRate {
  /** 환율 ID */
  exchangeRateId: number;
  
  /** 통화 코드 */
  currency: Currency;
  
  /** 환율 */
  rate: number;
  
  /** 변동률 */
  changePercentage: number;
  
  /** 적용 일시 */
  applyDateTime: string; // ISO 8601
}

/**
 * 환율 목록 응답
 */
export interface ExchangeRatesData {
  /** 환율 목록 */
  rates: ExchangeRate[];
  
  /** 마지막 업데이트 시간 */
  updatedAt: string; // ISO 8601
}

/**
 * 환율 조회 함수 반환 타입
 */
export interface UseExchangeRatesQueryResult {
  /** 환율 데이터 */
  rates: ExchangeRate[] | undefined;
  
  /** 마지막 업데이트 시간 */
  updatedAt: string | undefined;
  
  /** 로딩 상태 */
  isLoading: boolean;
  
  /** 에러 */
  error: Error | null;
  
  /** 재시도 함수 */
  refetch: () => void;
}

/**
 * 특정 통화 쌍의 환율을 찾는 헬퍼 함수 타입
 */
export type FindExchangeRateFn = (
  rates: ExchangeRate[],
  from: Currency,
  to: Currency
) => ExchangeRate | undefined;
```

---

### Order (주문/환전 내역)

```typescript
// src/entities/order/model/types.ts

/**
 * 주문 상태
 */
export type OrderStatus = 
  | 'pending'      // 대기 중
  | 'processing'   // 처리 중
  | 'completed'    // 완료
  | 'failed'       // 실패
  | 'cancelled';   // 취소됨

/**
 * 주문 엔티티
 */
export interface Order {
  /** 주문 ID */
  orderId: number;
  
  /** 출발 통화 */
  fromCurrency: Currency;
  
  /** 출발 금액 */
  fromAmount: number;
  
  /** 도착 통화 */
  toCurrency: Currency;
  
  /** 도착 금액 */
  toAmount: number;
  
  /** 적용된 환율 */
  appliedRate: number;
  
  /** 주문 생성 시간 */
  orderedAt: string; // ISO 8601
}

/**
 * 환전 견적
 */
export interface Quote {
  /** 원화 금액 */
  krwAmount: number;
  
  /** 적용된 환율 */
  appliedRate: number;
}

/**
 * 주문 목록 응답
 */
export interface OrdersData {
  /** 주문 목록 */
  orders: Order[];
}
```

---

## 🔌 Server Action Types

### Server Action 입력/출력 타입

각 Entity의 types.ts에 Server Action 관련 타입 정의

```typescript
// src/entities/user/types.ts

/**
 * 로그인 Action 입력
 */
export interface LoginInput {
  email: string;
}

/**
 * 로그인 Action 출력
 */
export interface LoginOutput {
  user: User;
}
```

```typescript
// src/entities/order/types.ts

/**
 * 환전 견적 Action 입력
 */
export interface GetQuoteInput {
  fromCurrency: Currency;
  toCurrency: Currency;
  forexAmount: number;
}

/**
 * 환전 견적 Action 출력
 */
export interface GetQuoteOutput {
  quote: Quote;
}

/**
 * 환전 주문 생성 Action 입력
 */
export interface CreateOrderInput {
  exchangeRateId: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  forexAmount: number;
}

/**
 * 환전 주문 생성 Action 출력
 */
export interface CreateOrderOutput {
  order: Order;
}
```

### Server Action 함수 타입

```typescript
// Server Action 함수는 Promise를 반환
type ServerAction<Input, Output> = (input: Input) => Promise<Output>;

// 예시:
// app/actions/auth/login.ts
export async function loginAction(input: LoginInput): Promise<LoginOutput>

// app/actions/order/createOrder.ts
export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderOutput>
```

---

## 🔄 React Query Types

### Query Hook 반환 타입

```typescript
// React Query의 useQuery 반환 타입 활용
import type { UseQueryResult } from '@tanstack/react-query';

// Entity Query Hook
export function useWalletsQuery(): UseQueryResult<WalletsData> {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => getWalletsAction(),
  });
}

// 사용
const { data, isLoading, error, refetch } = useWalletsQuery();
```

### Mutation Hook 반환 타입

```typescript
// React Query의 useMutation 반환 타입 활용
import type { UseMutationResult } from '@tanstack/react-query';

// Feature Mutation Hook
export function useCreateOrderMutation(): UseMutationResult<
  CreateOrderOutput,  // 성공 시 반환 타입
  Error,              // 에러 타입
  CreateOrderInput    // 입력 타입
> {
  return useMutation({
    mutationFn: (input) => createOrderAction(input),
  });
}

// 사용
const { mutate, isPending, error } = useCreateOrderMutation();
```

---

## 📝 Form Types

### Login Form

```typescript
// src/features/auth/login/ui/types.ts

/**
 * 로그인 폼 데이터
 */
export interface LoginFormData {
  /** 이메일 주소 */
  email: string;
}

/**
 * 로그인 폼 Props
 */
export interface LoginFormProps {
  /** 로그인 성공 콜백 */
  onSuccess?: () => void;
  
  /** 로그인 실패 콜백 */
  onError?: (error: Error) => void;
}
```

### Exchange Order Form

```typescript
// src/features/exchange/create-order/ui/types.ts

/**
 * 환전 폼 데이터
 */
export interface ExchangeFormData {
  /** 출발 통화 */
  fromCurrency: Currency;
  
  /** 도착 통화 */
  toCurrency: Currency;
  
  /** 환전 금액 */
  amount: string;
}

/**
 * 환전 폼 Props
 */
export interface CreateOrderFormProps {
  /** 환전 성공 콜백 */
  onSuccess?: (order: Order) => void;
  
  /** 환전 실패 콜백 */
  onError?: (error: Error) => void;
}

/**
 * 환전 폼 유효성 검증 에러
 */
export interface ExchangeFormErrors {
  /** 금액 에러 메시지 */
  amount?: string;
  
  /** 통화 선택 에러 메시지 */
  currency?: string;
}
```

---

## 🔧 Common Types

### Currency (통화)

```typescript
// src/shared/types/common.ts

/**
 * 지원하는 통화 코드 (ISO 4217)
 */
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY';

/**
 * 통화 정보
 */
export interface CurrencyInfo {
  /** 통화 코드 */
  code: Currency;
  
  /** 통화 이름 */
  name: string;
  
  /** 통화 심볼 */
  symbol: string;
  
  /** 소수점 자릿수 */
  decimals: number;
}

/**
 * 통화 목록
 */
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  KRW: {
    code: 'KRW',
    name: '대한민국 원',
    symbol: '₩',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    name: '미국 달러',
    symbol: '$',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    name: '유로',
    symbol: '€',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    name: '일본 엔',
    symbol: '¥',
    decimals: 0,
  },
  CNY: {
    code: 'CNY',
    name: '중국 위안',
    symbol: '¥',
    decimals: 2,
  },
};
```

### UI Component Types

```typescript
// src/shared/types/common.ts

/**
 * 공통 컴포넌트 크기
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * 공통 컴포넌트 변형
 */
export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * 로딩 상태
 */
export interface LoadingState {
  /** 로딩 중 여부 */
  isLoading: boolean;
  
  /** 로딩 메시지 (선택사항) */
  message?: string;
}

/**
 * 에러 상태
 */
export interface ErrorState {
  /** 에러 여부 */
  hasError: boolean;
  
  /** 에러 메시지 */
  message: string;
  
  /** 에러 코드 (선택사항) */
  code?: string;
}
```

### Date/Time Types

```typescript
// src/shared/types/common.ts

/**
 * ISO 8601 날짜/시간 문자열
 * 예: "2025-10-27T10:00:00Z"
 */
export type ISODateTime = string;

/**
 * 날짜 포맷 옵션
 */
export type DateFormat = 
  | 'short'      // 10/27
  | 'medium'     // Oct 27, 2025
  | 'long'       // October 27, 2025
  | 'full'       // Sunday, October 27, 2025
  | 'relative';  // 2 hours ago

/**
 * 시간 포맷 옵션
 */
export type TimeFormat =
  | '12h'        // 2:30 PM
  | '24h';       // 14:30
```

---

## 🎯 Type Guards & Utilities

### Type Guards

```typescript
// src/shared/lib/type-guards.ts

/**
 * Order 상태 타입 가드
 */
export function isOrderStatus(value: string): value is OrderStatus {
  return ['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(value);
}

/**
 * Currency 타입 가드
 */
export function isCurrency(value: string): value is Currency {
  return ['KRW', 'USD', 'EUR', 'JPY', 'CNY'].includes(value);
}

/**
 * User 타입 가드
 */
export function isUser(value: any): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string'
  );
}
```

### Utility Types

```typescript
// src/shared/types/common.ts

/**
 * API 응답을 Unwrap하는 유틸리티 타입
 */
export type Unwrap<T> = T extends ApiSuccessResponse<infer U> ? U : T;

/**
 * Nullable 타입
 */
export type Nullable<T> = T | null;

/**
 * Optional fields 타입
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required fields 타입
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Deep Partial 타입
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

---

## 📊 Zod Schemas (선택사항)

런타임 유효성 검증을 위한 Zod 스키마

```typescript
// src/shared/lib/validation/schemas.ts
import { z } from 'zod';

/**
 * 이메일 스키마
 */
export const emailSchema = z
  .string()
  .email('유효한 이메일 주소를 입력해주세요');

/**
 * 금액 스키마
 */
export const amountSchema = z
  .string()
  .refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    '유효한 금액을 입력해주세요'
  );

/**
 * 로그인 폼 스키마
 */
export const loginFormSchema = z.object({
  email: emailSchema,
});

/**
 * 환전 폼 스키마
 */
export const exchangeFormSchema = z.object({
  fromCurrency: z.enum(['KRW', 'USD', 'EUR', 'JPY', 'CNY']),
  toCurrency: z.enum(['KRW', 'USD', 'EUR', 'JPY', 'CNY']),
  amount: amountSchema,
});
```

---

## 🔗 관련 문서

- [아키텍처 설계](./architecture.md) - FSD 레이어 규칙
- [Server Actions 가이드](./api-spec.md) - Server Actions 패턴
- [Requirements](../requirements/) - 비즈니스 도메인 지식
- [Tasks](../tasks/) - 구체적인 구현 계획 (UI 요구사항 포함)

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ✅ 승인됨

