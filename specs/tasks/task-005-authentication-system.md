# Task 005: 인증 시스템 구현

> **Phase**: 기능 구현 (Backend Integration)  
> **관련 US**: US-001, US-002, US-003  
> **Priority**: High (모든 기능의 기반)

## 📋 연관 문서

- **Requirements**: 
  - [US-001](../requirements/02-user-stories.md#us-001-이메일-로그인)
  - [US-002](../requirements/02-user-stories.md#us-002-jwt-토큰-관리)
  - [US-003](../requirements/02-user-stories.md#us-003-로그아웃)
- **Design**: 
  - [api-spec.md](../design/api-spec.md) - Server Actions 패턴
  - [architecture.md](../design/architecture.md) - FSD 아키텍처
  - [data-models.md](../design/data-models.md) - 타입 정의
- **BDD**: 
  - [login.feature](../../cypress/features/auth/login.feature)
  - [logout.feature](../../cypress/features/auth/logout.feature)

---

## 🎯 작업 목표

이메일 기반 로그인/로그아웃 기능을 구현합니다. Server Actions로 백엔드 API를 호출하고, React Query로 상태를 관리합니다.

---

## 📝 구현 항목

### 1. Server Actions 구현

#### 1.1 로그인 Action

```typescript
// app/actions/auth/login.ts
'use server'

import { cookies } from 'next/headers';

interface LoginInput {
  email: string;
}

interface LoginOutput {
  memberId: number;
}

export async function loginAction(input: LoginInput): Promise<LoginOutput> {
  // 쿼리 파라미터로 변환
  const params = new URLSearchParams();
  params.append("request", JSON.stringify({ email: input.email }));

  // 외부 API 호출
  const response = await fetch(`${process.env.API_BASE_URL}/auth/login?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 응답을 한 번만 읽기
  const responseData = await response.json();

  if (!response.ok) {
    // 에러 응답 처리
    throw new Error(responseData.message || '로그인에 실패했습니다.');
  }

  // ApiResponse 포맷: { code, message, data }
  const { memberId, token } = responseData.data;

  // HTTP-only cookie에 토큰 저장
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: '/',
  });

  return { memberId };
}
```

#### 1.2 로그아웃 Action

```typescript
// app/actions/auth/logout.ts
'use server'

import { cookies } from 'next/headers';

export async function logoutAction() {
  cookies().delete('auth-token');
  return { success: true };
}
```

---

### 2. React Query Hooks 구현

#### 2.1 로그인 Mutation Hook

```typescript
// src/client/features/login/hooks/useLoginMutation.ts
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth/login';

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (email: string) => loginAction({ email }),
    onSuccess: (data) => {
      // memberId를 활용하여 필요한 경우 사용자 정보 저장
      console.log('Logged in with memberId:', data.memberId);
      router.push('/');
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });
}
```

#### 2.2 로그아웃 Mutation Hook

```typescript
// src/client/features/logout/hooks/useLogoutMutation.ts
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth/logout';

export function useLogoutMutation() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      router.push('/login');
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error.message);
    },
  });
}
```

---

### 3. 로그인 페이지 연동

```typescript
// src/client/pages/login/ui/LoginPage.tsx (수정)
'use client'

import { useState } from 'react';
import { useLoginMutation } from '@/features/login';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const login = useLoginMutation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(email);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 주소를 입력해주세요"
        disabled={login.isPending}
      />
      <Button type="submit" disabled={login.isPending}>
        {login.isPending ? '로그인 중...' : '로그인 하기'}
      </Button>
      
      {login.error && (
        <p className="text-red-500">{login.error.message}</p>
      )}
    </form>
  );
}
```

---

### 4. 로그아웃 버튼 연동

```typescript
// src/client/widgets/header/ui/Header.tsx (수정)
'use client'

import { useLogoutMutation } from '@/features/logout';
import { Button } from '@/shared/ui/button';

export function Header() {
  const logout = useLogoutMutation();
  
  return (
    <header>
      {/* ... 다른 내용 ... */}
      <Button onClick={() => logout.mutate()} disabled={logout.isPending}>
        {logout.isPending ? '로그아웃 중...' : '로그아웃'}
      </Button>
    </header>
  );
}
```

---

## ✅ 체크리스트

### Server Actions
- [ ] `app/actions/auth/login.ts` 구현
- [ ] `app/actions/auth/logout.ts` 구현
- [ ] HTTP-only Cookie에 토큰 저장
- [ ] 에러 처리 구현

### React Query Hooks
- [ ] `src/client/features/login/hooks/useLoginMutation.ts` 구현
- [ ] `src/client/features/logout/hooks/useLogoutMutation.ts` 구현
- [ ] 성공/실패 시 콜백 처리

### UI 연동
- [ ] 로그인 페이지에서 `useLoginMutation` 사용
- [ ] 헤더에서 `useLogoutMutation` 사용
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 표시

### Public API
- [ ] `src/client/features/login/index.ts` export
- [ ] `src/client/features/logout/index.ts` export

---

## 🧪 테스트

### BDD Scenarios (Cypress)

```gherkin
Feature: 로그인
  Scenario: 유효한 이메일로 로그인 성공
    Given 로그인 페이지에 접속한다
    When "test@example.com"을 입력하고 "로그인 하기" 버튼을 클릭한다
    Then 환전 페이지로 이동한다

  Scenario: 서버 에러로 로그인 실패
    Given 로그인 페이지에 접속한다
    When 존재하지 않는 이메일로 로그인을 시도한다
    Then 에러 메시지가 표시된다

Feature: 로그아웃
  Scenario: 로그아웃 성공
    Given 로그인한 상태이다
    When "로그아웃" 버튼을 클릭한다
    Then 로그인 페이지로 이동한다
```

---

## 🎯 기대 결과

1. 이메일 입력 후 로그인 버튼 클릭 시 백엔드 API 호출
2. 로그인 성공 시 JWT 토큰이 HTTP-only Cookie에 저장
3. 로그인 성공 시 환전 페이지로 자동 리다이렉트
4. 로그아웃 버튼 클릭 시 토큰 삭제 및 로그인 페이지로 이동
5. 에러 발생 시 명확한 에러 메시지 표시

---

## 📝 참고사항

### API Base URL
- 환경 변수: `process.env.API_BASE_URL`
- 개발 환경: `https://exchange-example.switchflow.biz`

### 토큰 관리
- HTTP-only Cookie 사용 (보안 강화)
- 토큰 만료 시간: 7일
- 모든 인증 API 요청에 `Authorization: Bearer ${token}` 헤더 포함

### 에러 처리
- `UNAUTHORIZED` 에러 시 자동 로그아웃
- 네트워크 에러 시 재시도 (최대 3회)
- 사용자 친화적인 에러 메시지 표시

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ⏳ To Do

