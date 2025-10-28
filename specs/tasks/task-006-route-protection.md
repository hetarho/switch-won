# Task 006: 라우트 보호 미들웨어 구현

> **Phase**: 기능 구현 (Backend Integration)  
> **관련 US**: US-010  
> **Priority**: High (보안 관련 필수 기능)

## 📋 연관 문서

- **Requirements**: [US-010](../requirements/02-user-stories.md#us-010-미인증-사용자-리다이렉트)
- **Design**: 
  - [api-spec.md](../design/api-spec.md) - 인증 처리 섹션
  - [architecture.md](../design/architecture.md) - Middleware 패턴
- **BDD**: [route-protection.feature](../../cypress/features/auth/route-protection.feature)

---

## 🎯 작업 목표

Next.js Middleware를 사용하여 보호된 라우트에 대한 접근을 제어합니다. 로그인하지 않은 사용자가 보호된 페이지에 접근하려고 하면 로그인 페이지로 리다이렉트합니다.

---

## 📝 구현 항목

### 1. Middleware 구현

```typescript
// middleware.ts (프로젝트 루트)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  // 보호된 라우트 정의
  const protectedPaths = ['/', '/history'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );
  
  // 로그인 페이지 경로
  const isLoginPath = request.nextUrl.pathname === '/login';
  
  // 보호된 페이지 접근 시도
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    // 원래 접근하려던 페이지를 쿼리 파라미터로 저장
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 로그인된 상태에서 로그인 페이지 접근 시도
  if (isLoginPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 다음 경로에 매칭:
     * - / (환전 페이지)
     * - /history (환전 내역)
     * - /login (로그인 페이지)
     */
    '/',
    '/history',
    '/login',
  ],
};
```

---

### 2. 로그인 후 원래 페이지로 복귀

```typescript
// src/client/features/login/hooks/useLoginMutation.ts (수정)
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '@/app/actions/auth/login';

export function useLoginMutation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  return useMutation({
    mutationFn: (email: string) => loginAction({ email }),
    onSuccess: () => {
      // 원래 접근하려던 페이지로 리다이렉트
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });
}
```

---

### 3. Layout에서 인증 상태 확인

```typescript
// app/(authenticated)/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('auth-token');
  
  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

---

## ✅ 체크리스트

### Middleware
- [ ] `middleware.ts` 파일 생성
- [ ] 보호된 라우트 정의
- [ ] 토큰 확인 로직 구현
- [ ] 리다이렉트 로직 구현
- [ ] matcher 설정

### 로그인 후 복귀
- [ ] 로그인 성공 시 원래 페이지로 리다이렉트
- [ ] redirect 쿼리 파라미터 처리

### Layout 보호
- [ ] `app/(authenticated)/layout.tsx`에서 토큰 확인
- [ ] 토큰 없을 시 리다이렉트

---

## 🧪 테스트

### BDD Scenarios (Cypress)

```gherkin
Feature: 라우트 보호
  Scenario: 미인증 사용자가 환전 페이지 접근 시도
    Given 로그인하지 않은 상태이다
    When 환전 페이지("/")로 이동한다
    Then 로그인 페이지("/login")로 리다이렉트된다
    And URL에 "redirect=/" 쿼리 파라미터가 포함된다

  Scenario: 미인증 사용자가 내역 페이지 접근 시도
    Given 로그인하지 않은 상태이다
    When 내역 페이지("/history")로 이동한다
    Then 로그인 페이지("/login")로 리다이렉트된다
    And URL에 "redirect=/history" 쿼리 파라미터가 포함된다

  Scenario: 로그인 후 원래 페이지로 복귀
    Given 로그인 페이지에 있고 URL에 "redirect=/history"가 있다
    When 유효한 이메일로 로그인한다
    Then 내역 페이지("/history")로 이동한다

  Scenario: 로그인 상태에서 로그인 페이지 접근 시도
    Given 로그인한 상태이다
    When 로그인 페이지("/login")로 이동한다
    Then 환전 페이지("/")로 리다이렉트된다
```

---

## 🎯 기대 결과

1. 로그인하지 않은 사용자가 `/` 또는 `/history` 접근 시 자동으로 `/login`으로 리다이렉트
2. 로그인 페이지 URL에 `redirect` 쿼리 파라미터 포함
3. 로그인 성공 시 원래 접근하려던 페이지로 자동 복귀
4. 로그인된 사용자가 `/login` 접근 시 `/`로 리다이렉트
5. 페이지 깜빡임 없이 부드러운 리다이렉트

---

## 📝 참고사항

### Middleware 동작 원리
- Next.js Middleware는 서버 사이드에서 실행
- 요청이 페이지로 도달하기 전에 미리 처리
- 쿠키 기반 인증 확인

### 보호된 라우트
- `/` - 환전 페이지
- `/history` - 환전 내역 페이지

### 리다이렉트 쿼리 파라미터
- `redirect`: 원래 접근하려던 페이지 경로
- 예: `/login?redirect=/history`

### Layout과 Middleware의 차이
- **Middleware**: 요청 처리 전에 동작 (더 빠름)
- **Layout**: 페이지 렌더링 전에 동작 (컴포넌트 트리 내부)
- 둘 다 구현하여 이중 보호

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ⏳ To Do

