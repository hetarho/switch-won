# Switch Won

실시간 환율 정보를 기반으로 간편하게 환전할 수 있는 웹 애플리케이션입니다.

## 🎯 프로젝트 철학

### 지속 가능한 아키텍처

이 프로젝트는 **Feature-Sliced Design (FSD)** 아키텍처를 채택하여, 기능 중심의 모듈화된 구조를 통해 장기적인 유지보수성과 확장성을 확보합니다.

#### 핵심 원칙

**1. 타입 안전성 (Type Safety)**
- Server Actions를 통해 클라이언트-서버 간 타입을 자동으로 공유
- TypeScript를 활용한 전체 데이터 흐름의 엔드-투-엔드 타입 정의
- 런타임 에러를 컴파일 타임에 방지

**2. 관심사의 분리 (Separation of Concerns)**
- **Entity**: 도메인 UI와 CRUD 작업
- **Feature**: 비즈니스 로직과 Mutation 작업
- **Widget/Pages**: 조합과 데이터 흐름 관리
- 각 레이어는 명확한 책임을 가지며, 역할이 섞이지 않음

**3. 단방향 의존성 (Unidirectional Dependency)**
- 하위 레이어는 상위 레이어를 알지 못함
- 상위 레이어만 하위 레이어를 import
- 순환 참조 방지로 코드베이스의 복잡도 관리

**4. Public API 패턴 (Public API Pattern)**
- 모든 모듈은 `index.ts`를 통해 명시적인 인터페이스 제공
- 내부 구현 세부사항 은닉
- 모듈 간 결합도 최소화

**5. BFF 패턴 (Backend for Frontend)**
- Next.js Server Actions를 활용한 중간 계층
- 클라이언트와 외부 API 사이의 타입 안전한 브릿지
- 인증 토큰 관리와 보안 로직을 서버에서 처리

## 🏗️ 아키텍처 구조

```
src/client/               # 클라이언트 코드 (FSD)
├── entities/            # 도메인 엔티티 UI + Query
│   ├── exchange-rate/   # 환율 도메인
│   ├── wallet/          # 지갑 도메인
│   └── exchange-history/# 환전 내역 도메인
├── features/            # 비즈니스 기능 (Mutations)
│   ├── create-order/    # 환전 주문 생성
│   ├── exchange-quote/  # 환전 견적 조회
│   ├── login/           # 로그인
│   └── logout/          # 로그아웃
├── widgets/             # 복합 컴포넌트
│   └── header/          # 헤더
├── pages/               # 페이지 컴포넌트 (라우트와 무관)
│   ├── exchange/        # 환전 페이지
│   ├── history/         # 환전 내역 페이지
│   └── login/           # 로그인 페이지
└── shared/              # 공용 컴포넌트 & 유틸리티
    ├── ui/              # shadcn/ui 기반 공통 UI
    ├── utils/           # 유틸리티 함수
    └── types/           # 공통 타입

app/                     # Next.js App Router (라우팅만)
├── (authenticated)/     # 인증 필요 라우트
│   ├── page.tsx        # 환전 페이지 라우트
│   └── history/        # 환전 내역 라우트
├── (public)/           # 공개 라우트
│   └── login/          # 로그인 라우트
└── actions/            # Server Actions (BFF)
    ├── auth/           # 인증 관련
    ├── exchange-rate/  # 환율 관련
    ├── order/          # 주문 관련
    └── wallet/         # 지갑 관련
```

### 데이터 흐름

```
[Client Component]
      ↓
[React Query Hook]
      ↓
[Server Action] ← HTTP-only Cookie (인증)
      ↓
[External API]
```

- **React Query**: 서버 상태 관리 및 캐싱
- **Server Actions**: 타입 안전한 API 호출 및 인증 처리
- **HTTP-only Cookie**: 안전한 토큰 저장

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui

### State Management
- **Server State**: TanStack Query (React Query)
- **Data Fetching**: Next.js Server Actions

### Testing
- **E2E**: Cypress 15 + Cucumber (BDD)
- **Unit**: Vitest

### Architecture
- **Pattern**: Feature-Sliced Design (FSD)
- **BFF**: Next.js Server Actions

## 🚀 시작하기

### 개발 서버 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### E2E 테스트 실행

```bash
# Cypress UI 모드
pnpm cypress:open

# Headless 모드
pnpm cypress:run
```

### 유닛 테스트 실행

```bash
pnpm test
```

## 📁 주요 디렉토리

- `app/` - Next.js App Router (라우팅 및 Server Actions)
- `src/client/` - 클라이언트 코드 (FSD 구조)
- `cypress/` - E2E 테스트 (Cucumber Feature 파일)
- `specs/` - 프로젝트 스펙 문서
  - `requirements/` - 요구사항 명세
  - `design/` - 아키텍처 및 API 설계
  - `tasks/` - 구현 태스크

## 📚 문서

- [프로젝트 개요](./specs/requirements/01-project-overview.md)
- [아키텍처 설계](./specs/design/architecture.md)
- [데이터 모델](./specs/design/data-models.md)
- [API 명세](./specs/design/api-spec.md)

## 🧪 테스트 전략

### BDD (Behavior-Driven Development)

Cucumber를 통한 행위 주도 개발로 비즈니스 요구사항과 테스트를 일치시킵니다.

```gherkin
Feature: 환전 주문 생성
  Scenario: 유효한 환전 주문 생성
    Given 사용자가 로그인되어 있고
    And 환전 페이지에 있을 때
    When 출발 통화를 "KRW"로 선택하고
    And 도착 통화를 "USD"로 선택하고
    And 금액 "100000"을 입력하고
    And "환전하기" 버튼을 클릭하면
    Then 환전 주문이 성공적으로 생성되어야 함
```

### 레이어별 테스트

- **E2E**: Cypress + Cucumber (사용자 시나리오)
- **Integration**: React Query hooks 테스트
- **Unit**: 유틸리티 함수 및 검증 로직

## 🎨 코드 컨벤션

### Import 규칙

```typescript
// ✅ GOOD: Public API를 통한 import
import { WalletCard, useWalletsQuery } from '@/entities/wallet'
import { Button, Input } from '@/shared/ui'

// ❌ BAD: 내부 구현 직접 import
import { WalletCard } from '@/entities/wallet/ui/WalletCard'
```

### 네이밍 컨벤션

- **컴포넌트**: `PascalCase.tsx` (예: `LoginPage.tsx`)
- **Hook**: `use*.ts` (예: `useLoginMutation.ts`)
- **Container Hook**: `use*Container.ts` (예: `useExchangePageContainer.ts`)
- **Server Action**: `*Action.ts` (예: `loginAction.ts`)
- **디렉토리**: `kebab-case` (예: `exchange-rate/`)

## 🔒 보안

- JWT 토큰을 HTTP-only Cookie에 저장
- Next.js Middleware를 통한 라우트 보호
- Server Actions에서 인증 검증 수행
- HTTPS 사용 (프로덕션 환경)

## 🤝 기여 가이드

1. FSD 아키텍처 원칙을 준수해주세요
2. 모든 모듈은 `index.ts`를 통해 Public API를 제공해야 합니다
3. 새로운 기능은 Feature 파일로 먼저 작성해주세요 (BDD)
4. 타입 안전성을 최우선으로 고려해주세요

## 📄 라이선스

MIT

---

**Built with ❤️ using Feature-Sliced Design**
