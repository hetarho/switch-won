# Task 007: 에러 처리 및 공통 유틸리티 구현

> **Phase**: 인프라 구현  
> **관련 US**: 모든 기능  
> **Priority**: Medium (사용자 경험 개선)

## 📋 연관 문서

- **Requirements**: [NFR-012](../requirements/03-non-functional.md#nfr-012-에러-핸들링)
- **Design**: 
  - [api-spec.md](../design/api-spec.md) - 에러 처리 섹션
  - [data-models.md](../design/data-models.md) - 타입 정의

---

## 🎯 작업 목표

전역 에러 처리 시스템과 공통 유틸리티를 구현하여 사용자 경험을 개선합니다.

---

## 📝 구현 항목

### 1. 에러 타입 정의

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

/**
 * 에러 코드 타입
 */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'MISSING_PARAMETER'
  | 'WALLET_INSUFFICIENT_BALANCE'
  | 'INVALID_DEPOSIT_AMOUNT'
  | 'INVALID_WITHDRAW_AMOUNT'
  | 'CURRENCY_MISMATCH'
  | 'INVALID_AMOUNT_SCALE'
  | 'EXCHANGE_RATE_CURRENCY_MISMATCH'
  | 'UNSUPPORTED_FOREX_CONVERSION_CURRENCY'
  | 'INVALID_EXCHANGE_RATE_CURRENCY'
  | 'UNSUPPORTED_CURRENCY_FOR_KRW_CONVERSION';
```

---

### 2. 공통 에러 처리 Hook

```typescript
// src/shared/hooks/useErrorHandler.ts
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useErrorHandler() {
  const router = useRouter();
  
  const handleError = useCallback((error: Error) => {
    console.error('Error:', error.message);
    
    // UNAUTHORIZED 에러 시 로그아웃 처리
    if (error.message.includes('로그인이 필요합니다')) {
      router.push('/login');
      return;
    }
    
    // 기타 에러는 토스트로 표시
    // TODO: 토스트 라이브러리 연동
  }, [router]);
  
  return { handleError };
}
```

---

### 3. Error Boundary 컴포넌트

```typescript
// src/shared/ui/ErrorBoundary.tsx
'use client'

import React from 'react';
import { Button } from './button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">알 수 없는 오류가 발생했습니다</h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message || '페이지를 새로고침해주세요.'}
          </p>
          <Button onClick={() => window.location.reload()}>
            새로고침
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

### 4. 통화 포맷 유틸리티

```typescript
// src/shared/utils/format/currency.ts

export function formatCurrency(
  amount: string | number,
  currency: string
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const formatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  });
  
  return formatter.format(numAmount);
}

export function formatAmount(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
}
```

---

### 5. 날짜 포맷 유틸리티

```typescript
// src/shared/utils/format/date.ts

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '방금 전';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}일 전`;
}
```

---

### 6. 이메일 검증 유틸리티

```typescript
// src/shared/utils/validation/email.ts

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email) {
    return { isValid: false, message: '이메일을 입력해주세요.' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, message: '유효한 이메일 주소를 입력해주세요.' };
  }
  
  return { isValid: true };
}
```

---

### 7. Public API Export

```typescript
// src/shared/types/index.ts
export * from './error';
export * from './common';

// src/shared/utils/index.ts
export * from './format/currency';
export * from './format/date';
export * from './validation/email';

// src/shared/hooks/index.ts
export * from './useErrorHandler';

// src/shared/ui/index.ts
export * from './ErrorBoundary';
```

---

## ✅ 체크리스트رال

### 에러 처리
- [ ] `src/shared/types/error.ts` 구현
- [ ] `src/shared/hooks/useErrorHandler.ts` 구현
- [ ] `src/shared/ui/ErrorBoundary.tsx` 구현
- [ ] Error Boundary를 루트 레이아웃에 적용

### 유틸리티
- [ ] `src/shared/utils/format/currency.ts` 구현
- [ ] `src/shared/utils/format/date.ts` 구현
- [ ] `src/shared/utils/validation/email.ts` 구현

### Public API
- [ ] `src/shared/types/index.ts` export
- [ ] `src/shared/utils/index.ts` export
- [ ] `src/shared/hooks/index.ts` export
- [ ] `src/shared/ui/index.ts` export

---

## 🧪 테스트

### 유틸리티 함수 테스트

```typescript
// src/shared/utils/__tests__/currency.test.ts
import { formatCurrency, formatAmount } from '../format/currency';

describe('formatCurrency', () => {
  it('should format KRW correctly', () => {
    expect(formatCurrency(1000, 'KRW')).toBe('₩1,000');
  });
  
  it('should format USD correctly', () => {
    expect(formatCurrency(10.5, 'USD')).toBe('$10.50');
  });
});

describe('formatAmount', () => {
  it('should format with commas', () => {
    expect(formatAmount(1000)).toBe('1,000');
  });
});

// src/shared/utils/__tests__/email.test.ts
import { isValidEmail, validateEmail } from '../validation/email';

describe('isValidEmail', () => {
  it('should return true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
  
  it('should return false for invalid email', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

---

## 🎯 기대 결과

1. 통일된 에러 처리 시스템 구축
2. 사용자 친화적인 에러 메시지 표시
3. 통화 및 날짜 포맷팅 일관성 유지
4. 코드 재사용성 향상
5. 유지보수성 개선

---

## 📝 참고사항

### 에러 처리 전략
- **401 UNAUTHORIZED**: 자동 로그아웃 + 로그인 페이지 리다이렉트
- **400 BAD_REQUEST**: 입력 값 검증 에러 메시지 표시
- **500 SERVER_ERROR**: 일반적인 에러 메시지 표시
- **Network Error**: 네트워크 연결 확인 메시지

### 유틸리티 사용 예시
```typescript
import { formatCurrency } from '@/shared/utils';
import { isValidEmail } from '@/shared/utils';

// 통화 포맷팅
formatCurrency(1000, 'KRW'); // ₩1,000

// 이메일 검증
if (isValidEmail(email)) {
  // 이메일이 유효함
}
```

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ⏳ To Do

