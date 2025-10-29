# Server Actions Guide: Switch Won

> **Note**: 이 문서는 개발 방법만 포함합니다. 구체적인 API 엔드포인트나 응답 구조는 Requirements 문서를 참고하세요.

## 📋 목차

- [Server Actions 개요](#server-actions-개요)
- [파일 구조](#파일-구조)
- [작성 패턴](#작성-패턴)
- [에러 처리](#에러-처리)
- [인증 처리](#인증-처리)
- [React Query 통합](#react-query-통합)

---

## 🌐 Server Actions 개요

### BFF (Backend for Frontend) 패턴

Next.js Server Actions를 사용하여 클라이언트와 백엔드 API 사이의 BFF 레이어를 구성합니다.

**장점**:
- ✅ 타입 안전성 (클라이언트-서버 타입 공유)
- ✅ 서버 측에서 인증 토큰 관리
- ✅ HTTP-only Cookie로 보안 강화
- ✅ API URL 및 인증 로직 캡슐화

**흐름**:
```
Client Component
    ↓ (call)
Server Action (app/actions/)
    ↓ (fetch)
External Backend API
    ↓ (response)
Server Action
    ↓ (return)
Client Component
```

---

## 📁 파일 구조

### 디렉토리 구조

```
app/actions/
├── auth/
│   ├── login.ts              # 로그인
│   └── logout.ts             # 로그아웃
├── wallet/
│   └── getWallets.ts         # 지갑 조회
├── exchange-rate/
│   └── getExchangeRates.ts   # 환율 조회
└── order/
    ├── getOrders.ts          # 주문 목록
    ├── getQuote.ts           # 견적 조회
    └── createOrder.ts        # 주문 생성
```

### 파일 네이밍 규칙

```
Query (GET):  get[Resource].ts  또는 get[Resource]s.ts
Mutation:     [action][Resource].ts

예시:
- getWallets.ts (GET /wallets)
- getOrders.ts (GET /orders)
- createOrder.ts (POST /orders)
- updateOrder.ts (PUT /orders/:id)
- deleteOrder.ts (DELETE /orders/:id)
```

---

## 📝 작성 패턴

### 기본 패턴

```typescript
// app/actions/[domain]/[action].ts
'use server'

import { cookies } from 'next/headers';

export async function [actionName]Action([params]) {
  // 1. 인증 토큰 가져오기 (필요시)
  const token = cookies().get('auth-token')?.value;
  
  // 2. 외부 API 호출
  const response = await fetch(`${process.env.API_BASE_URL}/endpoint`, {
    method: 'GET', // or 'POST', 'PUT', 'DELETE'
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: params ? JSON.stringify(params) : undefined,
  });
  
  // 3. 에러 처리
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  
  // 4. 응답 반환
  return response.json();
}
```

---

### Query Action (GET) 예시

```typescript
// app/actions/wallet/getWallets.ts
'use server'

import { cookies } from 'next/headers';

export async function getWalletsAction() {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(`${process.env.API_BASE_URL}/wallets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store', // 항상 최신 데이터
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch wallets');
  }
  
  return response.json();
}
```

---

### Mutation Action (POST) 예시

```typescript
// app/actions/order/createOrder.ts
'use server'

import { cookies } from 'next/headers';

interface CreateOrderInput {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
}

export async function createOrderAction(input: CreateOrderInput) {
  const token = cookies().get('auth-token')?.value;
  
  if (!token) {
    throw new Error('Unauthorized');
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
    throw new Error(error.message || 'Failed to create order');
  }
  
  return response.json();
}
```

---

### 인증 Action 예시 (Cookie 설정)

```typescript
// app/actions/auth/login.ts
'use server'

import { cookies } from 'next/headers';

export async function loginAction(email: string) {
  const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  const data = await response.json();
  
  // HTTP-only cookie에 토큰 저장
  cookies().set('auth-token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: '/',
  });
  
  return data.user;
}
```

```typescript
// app/actions/auth/logout.ts
'use server'

import { cookies } from 'next/headers';

export async function logoutAction() {
  // Cookie 삭제
  cookies().delete('auth-token');
  
  return { success: true };
}
```

---

## ⚠️ 에러 처리

### 공통 응답 포맷

모든 API 응답은 `ApiResponse` 포맷을 따릅니다.

#### 성공 응답 (HTTP 2xx)

```typescript
interface ApiSuccessResponse<T> {
  code: 'OK';
  message: string;
  data: T;
}

// 예시
{
  "code": "OK",
  "message": "정상적으로 처리되었습니다.",
  "data": {
    "memberId": 1,
    "token": "eyJhbGciOiJIUzM4NCJ9..."
  }
}
```

#### 실패/에러 응답 (HTTP 4xx, 5xx)

```typescript
interface ApiErrorResponse {
  code: string;
  message: string;
  data: Record<string, string> | null;
}

// 예시
{
  "code": "VALIDATION_ERROR",
  "message": "요청 데이터가 이상해요.",
  "data": {
    "amount": "환전 금액은 0보다 커야 합니다."
  }
}
```

### 주요 에러 코드

#### API 관련 에러

| Code | 기본 메시지 | 설명 |
|------|-----------|------|
| `BAD_REQUEST` | 잘못된 요청입니다. | 일반적인 요청 오류 시 발생합니다. |
| `NOT_FOUND` | 요청한 URL을 찾을 수 없어요. | 존재하지 않는 API 경로를 요청한 경우 발생합니다. |
| `UNAUTHORIZED` | 로그인이 필요한 서비스입니다. | 인증 토큰이 없거나 유효하지 않을 때 발생합니다. |
| `VALIDATION_ERROR` | 요청 데이터가 이상해요. | API 요청 파라미터의 유효성 검사에 실패한 경우 발생합니다. |
| `MISSING_PARAMETER` | 필수 요청 파라미터가 누락되었어요. | 필수 파라미터가 요청에 포함되지 않은 경우 발생합니다. |

#### 도메인 관련 에러

| Code | 메시지 (예시) | 설명 |
|------|--------------|------|
| `WALLET_INSUFFICIENT_BALANCE` | 지갑의 잔액이 부족합니다. | 출금 또는 환전 시 지갑의 잔액이 요청 금액보다 적을 때 발생합니다. |
| `INVALID_DEPOSIT_AMOUNT` | 입금 금액이 유효하지 않습니다. | 입금 금액이 0 이하일 경우 발생합니다. |
| `INVALID_WITHDRAW_AMOUNT` | 출금 금액이 유효하지 않습니다. | 출금 금액이 0 이하일 경우 발생합니다. |
| `CURRENCY_MISMATCH` | 통화 타입이 일치하지 않습니다. | 연산 또는 비교하는 두 금액의 통화가 다를 경우 발생합니다. |
| `INVALID_AMOUNT_SCALE` | USD 통화는 소수점 2자리까지만 허용됩니다... | 각 통화 정책에 맞지 않는 소수점 자릿수로 금액을 요청한 경우 발생합니다. |
| `EXCHANGE_RATE_CURRENCY_MISMATCH` | 환율의 대상 통화(USD)와 변환하려는 금액의 통화(EUR)가... | 조회된 환율 정보와 사용자가 환전하려는 통화가 일치하지 않을 때 발생합니다. |
| `UNSUPPORTED_FOREX_CONVERSION_CURRENCY` | 외화 변환은 원화(KRW)를 지원하지 않습니다. | 외화(USD)를 다른 외화(JPY)로 직접 변환하려고 시도할 때 발생합니다. |
| `INVALID_EXCHANGE_RATE_CURRENCY` | 환율 정보의 통화는 KRW가 될 수 없습니다. | 환율 정보 자체에 KRW를 사용하려고 할 때 발생합니다. |
| `UNSUPPORTED_CURRENCY_FOR_KRW_CONVERSION` | 원화(KRW) 변환은 KRW 통화만 지원합니다... | 원화를 다른 통화로 변환하는 로직에 KRW가 아닌 다른 통화가 사용되었을 때 발생합니다. |

### Server Action에서 에러 처리

```typescript
'use server'

interface ApiErrorResponse {
  code: string;
  message: string;
  data: Record<string, string> | null;
}

export async function exampleAction() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ... }),
    });
    
    // HTTP 에러 상태 확인
    if (!response.ok) {
      const error: ApiErrorResponse = await response.json();
      
      // 에러 코드에 따른 처리
      switch (error.code) {
        case 'UNAUTHORIZED':
          // 인증 에러 - 로그아웃 처리
          cookies().delete('auth-token');
          throw new Error('로그인이 필요합니다.');
        
        case 'VALIDATION_ERROR':
          // 유효성 검사 에러 - 첫 번째 에러 메시지 반환
          const firstError = error.data ? Object.values(error.data)[0] : error.message;
          throw new Error(firstError);
        
        case 'WALLET_INSUFFICIENT_BALANCE':
          throw new Error('지갑의 잔액이 부족합니다.');
        
        default:
          throw new Error(error.message || `HTTP ${response.status}`);
      }
    }
    
    const data = await response.json();
    return data.data; // ApiResponse의 data 필드 반환
    
  } catch (error) {
    // 네트워크 에러 등
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
}
```

### Client에서 에러 처리

#### React Query Mutation에서 에러 처리

```typescript
// src/features/create-order/hooks/useCreateOrderMutation.ts
import { useMutation } from '@tanstack/react-query';
import { createOrderAction } from '@/app/actions/order/createOrder';
import { useRouter } from 'next/navigation';

export function useCreateOrderMutation() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: createOrderAction,
    onError: (error: Error) => {
      console.error('Order creation failed:', error.message);
      
      // 에러 메시지 기반 처리
      if (error.message.includes('로그인이 필요합니다')) {
        router.push('/login');
      } else if (error.message.includes('잔액이 부족')) {
        // 잔액 부족 알림 표시
        toast.error('지갑의 잔액이 부족합니다.');
      } else {
        // 일반 에러 메시지
        toast.error(error.message || '환전 요청에 실패했습니다.');
      }
    },
    onSuccess: () => {
      toast.success('환전이 완료되었습니다.');
    },
  });
}
```

#### React Query Query에서 에러 처리

```typescript
// src/entities/wallet/hooks/useWalletsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getWalletsAction } from '@/app/actions/wallet/getWallets';

export function useWalletsQuery() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => getWalletsAction(),
    staleTime: 30 * 1000,
    retry: (failureCount, error) => {
      // UNAUTHORIZED 에러는 재시도하지 않음
      if (error.message.includes('로그인이 필요합니다')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error: Error) => {
      console.error('Failed to fetch wallets:', error.message);
    },
  });
}
```

### Next.js 에러 바운더리

Next.js의 공식 에러 바운더리 방식을 사용합니다. 자동으로 에러를 캐치하고 처리합니다.

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react';
import { Button } from '@/shared/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">알 수 없는 오류가 발생했습니다</h2>
      <p className="text-muted-foreground mb-4 text-center">
        {error.message || '페이지를 새로고침해주세요.'}
      </p>
      {error.digest && (
        <p className="text-sm text-muted-foreground mb-4">
          에러 ID: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={reset}>다시 시도</Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          새로고침
        </Button>
      </div>
    </div>
  );
}
```

### 에러 타입 정의

```typescript
// src/shared/types/error.ts

/**
 * API 에러 응답
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  data: Record<string, string> | null;
}

/**
 * 커스텀 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public data: Record<string, string> | null = null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## 🔐 인증 처리

### Middleware를 통한 인증 확인

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  // 보호된 라우트
  const protectedPaths = ['/', '/history'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );
  
  // 토큰 없이 보호된 페이지 접근 시
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 토큰 있는데 로그인 페이지 접근 시
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/history', '/login'],
};
```

### Server Action에서 인증 확인

```typescript
'use server'

import { cookies } from 'next/headers';

function getAuthToken() {
  const token = cookies().get('auth-token')?.value;
  if (!token) {
    throw new Error('Unauthorized');
  }
  return token;
}

export async function protectedAction() {
  const token = getAuthToken(); // 인증 확인
  
  // API 호출
  const response = await fetch(..., {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

---

## 🔄 React Query 통합

### Entity Layer - Query Hook

```typescript
// src/entities/wallet/hooks/useWalletsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getWalletsAction } from '@/app/actions/wallet/getWallets';

export function useWalletsQuery() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => getWalletsAction(),
    staleTime: 30 * 1000, // 30초
    retry: 3, // 실패 시 3회 재시도
  });
}
```

### Feature Layer - Mutation Hook

```typescript
// src/features/create-order/hooks/useCreateOrderMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrderAction } from '@/app/actions/order/createOrder';

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrderAction,
    onSuccess: () => {
      // 관련 쿼리 무효화 (자동 리페치)
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

### 자동 갱신 (Polling)

```typescript
// 환율 1분마다 자동 갱신
export function useExchangeRatesQuery() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => getExchangeRatesAction(),
    staleTime: 60 * 1000, // 1분
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
    refetchOnWindowFocus: true, // 포커스 시 갱신
  });
}
```

---

## 🛠️ 환경 변수 설정

### .env.local

```bash
# API Base URL
API_BASE_URL=

```

### Server Action에서 사용

```typescript
'use server'

const API_BASE_URL = process.env.API_BASE_URL;

export async function exampleAction() {
  const response = await fetch(`${API_BASE_URL}/endpoint`, {
    ...
  });
}
```

---

## 📊 타입 안전성

### 타입 정의 공유

```typescript
// src/entities/order/types.ts
export interface CreateOrderInput {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
}

export interface Order {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  // ...
}
```

### Server Action에서 타입 사용

```typescript
// app/actions/order/createOrder.ts
'use server'

import type { CreateOrderInput, Order } from '@/entities/order/types';

export async function createOrderAction(
  input: CreateOrderInput
): Promise<Order> {
  const response = await fetch(...);
  return response.json();
}
```

### Client Hook에서 타입 사용

```typescript
// src/features/create-order/hooks/useCreateOrderMutation.ts
import type { CreateOrderInput, Order } from '@/entities/order/types';

export function useCreateOrderMutation() {
  return useMutation<Order, Error, CreateOrderInput>({
    mutationFn: createOrderAction,
  });
}
```

---

## 🔗 관련 문서

- **Architecture**: [architecture.md](./architecture.md) - FSD 레이어 규칙
- **Data Models**: [data-models.md](./data-models.md) - TypeScript 타입
- **Requirements**: [../requirements/](../requirements/) - API 응답 구조 참고
- **Tasks**: [../tasks/](../tasks/) - 구체적인 구현 계획 (UI 요구사항 포함)

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ✅ 승인됨
