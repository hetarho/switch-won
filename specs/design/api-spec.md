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

### Server Action에서 에러 처리

```typescript
'use server'

export async function exampleAction() {
  try {
    const response = await fetch(...);
    
    if (!response.ok) {
      // HTTP 에러 처리
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    // 네트워크 에러 등
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Unknown error occurred');
  }
}
```

### Client에서 에러 처리

```typescript
// src/features/create-order/hooks/useCreateOrderMutation.ts
import { useMutation } from '@tanstack/react-query';
import { createOrderAction } from '@/app/actions/order/createOrder';

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: createOrderAction,
    onError: (error: Error) => {
      // 에러 처리
      console.error('Order creation failed:', error.message);
      
      // 사용자에게 표시할 에러 메시지
      if (error.message.includes('Unauthorized')) {
        // 로그아웃 처리
      } else if (error.message.includes('Insufficient balance')) {
        // 잔액 부족 메시지
      } else {
        // 일반 에러 메시지
      }
    },
  });
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
