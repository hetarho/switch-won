# Architecture Design: Switch Won

> **Note**: 이 문서는 개발 지식만 포함합니다. 비즈니스 도메인 지식은 Requirements 문서를 참고하세요.

## 📋 목차

- [기술 스택](#기술-스택)
- [아키텍처 개요](#아키텍처-개요)
- [FSD 레이어 규칙](#fsd-레이어-규칙)
- [디렉토리 구조](#디렉토리-구조)
- [데이터 흐름](#데이터-흐름)
- [네이밍 컨벤션](#네이밍-컨벤션)

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4

### State & Data
- **Server State**: React Query (TanStack Query)
- **Client State**: React Context (인증 상태만)
- **Data Fetching**: Next.js Server Actions (BFF 패턴)

### Testing
- **E2E**: Cypress 15 + Cucumber
- **Architecture**: Feature Sliced Design (FSD) with custom rules

### Authentication
- **Token Storage**: HTTP-only Cookie
- **Token Management**: Next.js middleware

---

## 🏗️ 아키텍처 개요

### 전체 디렉토리 구조

```
project/
├── app/                    # Next.js App Router (라우팅만)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── src/
│   ├── client/             # 클라이언트 코드 (FSD 구조)
│   │   ├── entities/       # 도메인 엔티티
│   │   ├── features/       # 비즈니스 기능
│   │   ├── pages/          # 페이지 컴포넌트 ✅
│   │   ├── shared/         # 공유 컴포넌트/유틸
│   │   └── widgets/        # 복합 위젯
│   │
│   └── server/             # 서버 코드 (Server Actions, BFF)
│       ├── actions/        # Next.js Server Actions
│       ├── services/       # 비즈니스 로직
│       └── utils/          # 서버 유틸리티
│
├── cypress/                # E2E 테스트
└── specs/                  # 스펙 문서
```

> **⚠️ 중요**: `src/client/pages/`는 FSD의 Pages 레이어이며, Next.js Pages Router와 무관합니다!
> - `app/` = Next.js App Router (라우팅)
> - `src/client/pages/` = FSD Pages Layer (컴포넌트)

### BFF (Backend for Frontend) 패턴

```
Client Components (src/client/)
    ↓
React Query
    ↓
Server Actions (src/server/actions/)
    ↓
External API (백엔드 서버)
```

### 핵심 원칙

1. **타입 안전성**
   - Server Actions로 클라이언트-서버 타입 공유
   - TypeScript로 전체 데이터 흐름 타입 정의

2. **관심사의 분리**
   - Entity: 도메인 UI + CRUD
   - Feature: Mutation (생성/수정/삭제)
   - Widget/Pages: 컨테이너 (조합 및 데이터 흐름 관리)

3. **단방향 의존성**
   - 하위 레이어는 상위 레이어를 알지 못함
   - 상위 레이어만 하위 레이어를 import

---

## 📂 FSD 레이어 규칙

### 🔑 핵심 규칙: Public API

**모든 모듈은 최상위 레벨에서 Public API를 선언해야 합니다.**

**규칙**:
- ✅ 각 슬라이스(slice)는 `index.ts`를 통해 public API 노출
- ✅ 외부에서는 `index.ts`를 통해서만 import
- ❌ 내부 파일 경로 직접 import 금지

**예시**:
```typescript
// ❌ BAD: 내부 파일 직접 접근
import { WalletCard } from '@/entities/wallet/ui/WalletCard'
import { useWalletQuery } from '@/entities/wallet/hooks/useWalletQuery'

// ✅ GOOD: index.ts를 통한 접근
import { WalletCard, useWalletQuery } from '@/entities/wallet'
```

**구조**:
```
src/client/entities/wallet/
├── ui/
│   └── WalletCard.tsx
├── hooks/
│   └── useWalletQuery.ts
└── index.ts              # Public API 선언
```

**index.ts 예시**:
```typescript
// src/client/entities/wallet/index.ts
export { WalletCard } from './ui/WalletCard'
export { useWalletQuery } from './hooks/useWalletQuery'
export type { Wallet } from './types'
```

---

### 1. Entity Layer (엔티티)

**역할**: 도메인별 순수 UI 컴포넌트 + CRUD hooks

**구성**:
```
src/client/entities/[domain]/
├── ui/
│   └── [Domain]Card.tsx        # 순수 UI 컴포넌트
├── hooks/
│   ├── use[Domain]Query.ts     # Read (GET)
│   ├── use[Domain]ListQuery.ts # List (GET)
│   └── use[Domain]Card.ts      # UI 로직 (필요시)
├── types.ts                     # 타입 정의
└── index.ts                     # Public API (필수!)
```

**규칙**:
- ✅ 순수 UI 컴포넌트 (presentational)
- ✅ React Query로 래핑된 CRUD hooks
- ✅ 도메인별로 폴더 분리
- ❌ 비즈니스 로직 포함 금지
- ❌ Mutation (생성/수정/삭제) 금지 → Feature로

**예시**:
```typescript
// src/client/entities/wallet/ui/WalletCard.tsx
export function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <div>
      <p>{wallet.currency}</p>
      <p>{wallet.balance}</p>
    </div>
  );
}

// src/client/entities/wallet/hooks/useWalletsQuery.ts
export function useWalletsQuery() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => getWalletsAction(),
  });
}
```

---

### 2. Feature Layer (피처)

**역할**: Mutation (생성/수정/삭제) 기능

**구성**:
```
src/client/features/[feature]/
├── hooks/
│   └── use[Feature]Mutation.ts  # Mutation hook
├── ui/                          # 필요시만
│   └── [Feature]Form.tsx        # 특수 UI
└── index.ts                     # Public API (필수!)
```

**규칙**:
- ✅ React Query의 useMutation 사용
- ✅ Server Actions 호출
- ✅ UI는 필요할 때만 (특수한 폼 등)
- ❌ 단순 UI는 Entity나 Shared로

**예시**:
```typescript
// src/client/features/create-exchange-order/hooks/useCreateOrderMutation.ts
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrderInput) => createOrderAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

---

### 3. Widget Layer (위젯)

**역할**: 독립된 컨테이너, 여러 Entity/Feature 조합

**사용 조건** (하나라도 해당되면 Widget으로):
- 복잡해서 별도 테스트 필요
- 독립된 컨테이너 역할
- 여러 Entity/Feature 조합

**구성**:
```
src/client/widgets/[widget-name]/
├── ui/
│   └── [WidgetName].tsx         # 위젯 UI
├── hooks/
│   └── use[WidgetName]Container.ts  # 컨테이너 hook (데이터 호출)
└── index.ts                     # Public API (필수!)
```

**규칙**:
- ✅ 여러 Entity/Feature 조합 가능
- ✅ hooks/use[Name]Container.ts에서 데이터 흐름 관리
- ✅ 독립적으로 테스트 가능
- ❌ 직접 Server Actions 호출 금지 → Entity/Feature hooks 사용

**예시**:
```typescript
// src/client/widgets/exchange-card/hooks/useExchangeCardContainer.ts
export function useExchangeCardContainer() {
  const { data: wallets } = useWalletsQuery();
  const { data: rates } = useExchangeRatesQuery();
  const createOrder = useCreateOrderMutation();
  
  return {
    wallets,
    rates,
    createOrder,
  };
}

// src/client/widgets/exchange-card/ui/ExchangeCard.tsx
export function ExchangeCard() {
  const { wallets, rates, createOrder } = useExchangeCardContainer();
  
  return (
    <Card>
      {/* UI 구성 */}
    </Card>
  );
}
```

---

### 4. Views Layer (페이지)

**역할**: 라우트 페이지, 위젯/Entity/Feature 조합

**구성**:
```
src/client/pages/[page-name]/
├── ui/
│   └── [PageName]Page.tsx       # 페이지 UI
├── hooks/
│   └── use[PageName]Container.ts  # 컨테이너 hook (필요시)
└── index.ts                     # Public API (필수!)
```

**규칙**:
- ✅ 모든 Widget/Entity/Feature 조합 가능
- ✅ hooks/use[Name]Container.ts로 데이터 흐름 관리 (복잡한 경우)
- ✅ 단순한 경우 Container hook 없이 직접 호출 가능
- ❌ 비즈니스 로직 금지 → Feature로 분리

**예시**:
```typescript
// src/client/pages/exchange/hooks/useExchangePageContainer.ts
export function useExchangePageContainer() {
  const { data: wallets } = useWalletsQuery();
  const { data: rates } = useExchangeRatesQuery();
  
  // 1분마다 환율 자동 갱신
  useInterval(() => {
    queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
  }, 60000);
  
  return { wallets, rates };
}

// src/client/pages/exchange/ui/ExchangePage.tsx
export function ExchangePage() {
  const { wallets, rates } = useExchangePageContainer();
  
  return (
    <div>
      <WalletDisplay />
      <ExchangeRateDisplay />
      <ExchangeCard />
    </div>
  );
}
```

---

### 5. Shared Layer (공유)

**역할**: 공통 UI 컴포넌트, 유틸리티

**구성**:
```
src/client/shared/
├── ui/
│   ├── button.tsx         # shadcn/ui 컴포넌트
│   ├── input.tsx          # shadcn/ui 컴포넌트
│   ├── card.tsx           # shadcn/ui 컴포넌트
│   ├── ...                # 기타 shadcn/ui 컴포넌트
│   └── index.ts           # Public API (필수!)
├── utils/
│   ├── cn.ts              # shadcn/ui cn 유틸리티
│   ├── format/
│   │   ├── currency.ts
│   │   └── date.ts
│   ├── validation/
│   │   └── email.ts
│   └── index.ts           # Public API (필수!)
├── types/
│   └── common.ts
└── hooks/
    ├── useDebounce.ts
    ├── useInterval.ts
    └── index.ts           # Public API (필수!)
```

**규칙**:
- ✅ **UI 컴포넌트는 shadcn/ui 사용**
  - `npx shadcn@latest add [component]`로 추가
  - 컴포넌트는 `src/client/shared/ui/`에 자동 생성
  - `cn` 유틸리티는 `src/client/shared/utils/cn.ts`에 위치
- ✅ 재사용 가능한 순수 컴포넌트
- ✅ 도메인 독립적인 유틸리티
- ✅ **Shared 내부에서는 상대경로 사용 (특수 규칙!)**
- ❌ 도메인 특화 로직 금지
- ❌ 직접 UI 컴포넌트 작성 금지 → shadcn/ui 사용

**Import 규칙**:
```typescript
// ❌ BAD: shared 내부에서 절대경로 사용
// src/client/shared/ui/button.tsx
import { cn } from '@/shared/utils'

// ✅ GOOD: shared 내부에서 상대경로 사용
// src/client/shared/ui/button.tsx
import { cn } from '../utils/cn'
```

---

### 6. App Layer (Next.js App Router)

**역할**: 라우트, Server Actions, Providers

**구성**:
```
app/
├── layout.tsx                     # 루트 레이아웃
├── providers.tsx                  # React Query Provider
├── (auth)/
│   └── login/
│       └── page.tsx               # 로그인 라우트
├── (protected)/
│   ├── layout.tsx                 # 인증 필요 레이아웃
│   ├── page.tsx                   # 환전 페이지 (/)
│   └── history/
│       └── page.tsx               # 환전 내역
└── actions/
    ├── auth/
    │   └── login.ts               # 로그인 Server Action
    ├── wallet/
    │   └── getWallets.ts          # 지갑 조회 Server Action
    ├── exchange-rate/
    │   └── getExchangeRates.ts
    └── order/
        ├── createOrder.ts
        └── getOrders.ts
```

---

## 📁 상세 디렉토리 구조

```
switch-won/
├── app/
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx              # RequireAuth wrapper
│   │   ├── page.tsx                # 환전 페이지
│   │   └── history/
│   │       └── page.tsx
│   └── actions/                     # Server Actions (BFF)
│       ├── auth/
│       │   └── login.ts
│       ├── wallet/
│       │   └── getWallets.ts
│       ├── exchange-rate/
│       │   └── getExchangeRates.ts
│       └── order/
│           ├── getOrders.ts
│           ├── getQuote.ts
│           └── createOrder.ts
│
└── src/
    ├── entities/                    # 도메인별 UI + CRUD
    │   ├── user/
    │   │   ├── ui/
    │   │   │   └── UserAvatar.tsx
    │   │   ├── hooks/
    │   │   │   └── useAuth.ts       # 인증 상태 hook
    │   │   └── types.ts
    │   ├── wallet/
    │   │   ├── ui/
    │   │   │   └── WalletCard.tsx
    │   │   ├── hooks/
    │   │   │   ├── useWalletsQuery.ts
    │   │   │   └── useWalletCard.ts # UI 로직
    │   │   └── types.ts
    │   ├── exchange-rate/
    │   │   ├── ui/
    │   │   │   └── ExchangeRateCard.tsx
    │   │   ├── hooks/
    │   │   │   └── useExchangeRatesQuery.ts
    │   │   └── types.ts
    │   └── order/
    │       ├── ui/
    │       │   ├── OrderStatusBadge.tsx
    │       │   └── OrderItem.tsx
    │       ├── hooks/
    │       │   ├── useOrdersQuery.ts
    │       │   └── useOrderItem.ts
    │       └── types.ts
    │
    ├── features/                    # Mutation 기능
    │   ├── login/
    │   │   └── hooks/
    │   │       └── useLoginMutation.ts
    │   ├── logout/
    │   │   └── hooks/
    │   │       └── useLogoutMutation.ts
    │   ├── create-exchange-order/
    │   │   └── hooks/
    │   │       ├── useExchangeQuoteMutation.ts
    │   │       └── useCreateOrderMutation.ts
    │   └── require-auth/
    │       └── ui/
    │           └── RequireAuth.tsx
    │
    ├── widgets/                     # 독립 컨테이너
    │   ├── header/
    │   │   └── ui/
    │   │       └── Header.tsx
    │   ├── wallet-display/
    │   │   ├── ui/
    │   │   │   └── WalletDisplay.tsx
    │   │   └── hooks/
    │   │       └── useWalletDisplayContainer.ts
    │   ├── exchange-rate-display/
    │   │   ├── ui/
    │   │   │   └── ExchangeRateDisplay.tsx
    │   │   └── hooks/
    │   │       └── useExchangeRateDisplayContainer.ts
    │   ├── exchange-form/
    │   │   ├── ui/
    │   │   │   └── ExchangeForm.tsx
    │   │   └── hooks/
    │   │       └── useExchangeFormContainer.ts
    │   └── order-list/
    │       ├── ui/
    │       │   └── OrderList.tsx
    │       └── hooks/
    │           └── useOrderListContainer.ts
    │
    ├── pages/                       # 페이지 컴포넌트
    │   ├── login/
    │   │   └── ui/
    │   │       └── LoginPage.tsx
    │   ├── exchange/
    │   │   ├── ui/
    │   │   │   └── ExchangePage.tsx
    │   │   └── hooks/
    │   │       └── useExchangePageContainer.ts
    │   └── history/
    │       ├── ui/
    │       │   └── HistoryPage.tsx
    │       └── hooks/
    │           └── useHistoryPageContainer.ts
    │
    └── shared/                      # 공통 코드
        ├── ui/
        │   ├── Button.tsx
        │   ├── Input.tsx
        │   ├── Select.tsx
        │   ├── Card.tsx
        │   ├── Spinner.tsx
        │   └── ErrorMessage.tsx
        ├── lib/
        │   ├── format/
        │   │   ├── currency.ts
        │   │   └── date.ts
        │   ├── validation/
        │   │   └── email.ts
        │   └── query-client.ts      # React Query 설정
        ├── types/
        │   └── common.ts
        └── hooks/
            ├── useDebounce.ts
            └── useInterval.ts
```

---

## 🔄 데이터 흐름

### Server Actions 패턴

**1. Server Action 정의** (`app/actions/`)

```typescript
// app/actions/auth/login.ts
'use server'

import { cookies } from 'next/headers';

export async function loginAction(email: string) {
  // 외부 API 호출
  const response = await fetch(process.env.API_BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  
  // HTTP-only cookie에 토큰 저장
  cookies().set('auth-token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
  
  return data.user;
}
```

**2. Feature Hook** (`src/client/features/`)

```typescript
// src/client/features/login/hooks/useLoginMutation.ts
import { useMutation } from '@tanstack/react-query';
import { loginAction } from '@/app/actions/auth/login';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (email: string) => loginAction(email),
    onSuccess: (user) => {
      // 성공 처리
    },
  });
}
```

**3. UI에서 사용**

```typescript
// src/client/pages/login/ui/LoginPage.tsx
import { useLoginMutation } from '@/features/login/hooks/useLoginMutation';

export function LoginPage() {
  const login = useLoginMutation();
  
  const handleSubmit = (email: string) => {
    login.mutate(email);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Query 패턴 (CRUD)

**1. Server Action**

```typescript
// app/actions/wallet/getWallets.ts
'use server'

import { cookies } from 'next/headers';

export async function getWalletsAction() {
  const token = cookies().get('auth-token')?.value;
  
  const response = await fetch(process.env.API_BASE_URL + '/wallets', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

**2. Entity Hook**

```typescript
// src/client/entities/wallet/hooks/useWalletsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getWalletsAction } from '@/app/actions/wallet/getWallets';

export function useWalletsQuery() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => getWalletsAction(),
    staleTime: 30 * 1000, // 30초
  });
}
```

**3. Widget Container**

```typescript
// src/client/widgets/wallet-display/hooks/useWalletDisplayContainer.ts
import { useWalletsQuery } from '@/entities/wallet/hooks/useWalletsQuery';

export function useWalletDisplayContainer() {
  const { data: wallets, isLoading, error, refetch } = useWalletsQuery();
  
  return {
    wallets,
    isLoading,
    error,
    refetch,
  };
}
```

**4. Widget UI**

```typescript
// src/client/widgets/wallet-display/ui/WalletDisplay.tsx
import { useWalletDisplayContainer } from '../hooks/useWalletDisplayContainer';
import { WalletCard } from '@/entities/wallet/ui/WalletCard';

export function WalletDisplay() {
  const { wallets, isLoading, error, refetch } = useWalletDisplayContainer();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage onRetry={refetch} />;
  
  return (
    <div>
      {wallets?.map(wallet => (
        <WalletCard key={wallet.currency} wallet={wallet} />
      ))}
    </div>
  );
}
```

---

## 📐 네이밍 컨벤션

### 파일 및 디렉토리

```
컴포넌트: PascalCase.tsx
  예: LoginPage.tsx, WalletCard.tsx

Hook: camelCase.ts
  예: useLoginMutation.ts, useWalletsQuery.ts
  
Container Hook: use[Name]Container.ts
  예: useExchangePageContainer.ts, useWalletDisplayContainer.ts

Server Action: camelCase.ts
  예: loginAction.ts, getWallets.ts

타입: camelCase.ts
  예: types.ts

디렉토리: kebab-case
  예: exchange-rate/, create-exchange-order/
```

### Hook 네이밍 패턴

```typescript
// Entity - Query hooks
useWalletsQuery()           // List 조회
useWalletQuery(id)          // 단일 조회
useExchangeRatesQuery()     // List 조회

// Feature - Mutation hooks
useLoginMutation()          // 로그인
useCreateOrderMutation()    // 생성
useUpdateOrderMutation()    // 수정

// Container hooks
useExchangePageContainer()  // Page container
useWalletDisplayContainer() // Widget container

// UI logic hooks (Entity/Widget/Pages 내부)
useWalletCard()             // WalletCard 컴포넌트 로직
useExchangeForm()           // ExchangeForm 컴포넌트 로직
```

### Server Action 네이밍

```typescript
// app/actions/[domain]/[action].ts

// Query (GET)
getWalletsAction()
getOrdersAction()
getExchangeRatesAction()

// Mutation (POST/PUT/DELETE)
loginAction()
createOrderAction()
updateOrderAction()
deleteOrderAction()
```

### 컴포넌트 Props 타입

```typescript
// [ComponentName]Props
interface LoginPageProps {}
interface WalletCardProps {}
interface ButtonProps {}
```

---

## 🔗 관련 문서

- **Requirements**: [요구사항 명세](../requirements/) - 비즈니스 도메인 지식
- **BDD Features**: [Feature 파일](../../cypress/features/) - 테스트 시나리오
- **Data Models**: [data-models.md](./data-models.md) - TypeScript 타입 정의
- **Server Actions**: [api-spec.md](./api-spec.md) - Server Actions 가이드
- **Tasks**: [../tasks/](../tasks/) - 구체적인 구현 계획 (UI 요구사항 포함)

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ✅ 승인됨
