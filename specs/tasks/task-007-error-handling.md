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

### 2. Next.js 에러 바운더리 (error.tsx)

Next.js의 공식 에러 바운더리 방식을 사용합니다.

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

```typescript
// app/global-error.tsx
'use client'

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h2 className="text-2xl font-bold mb-4">심각한 오류가 발생했습니다</h2>
          <p className="text-muted-foreground mb-4 text-center">
            {error.message || '앱을 새로고침해주세요.'}
          </p>
          {error.digest && (
            <p className="text-sm text-muted-foreground mb-4">
              에러 ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
```

**Next.js 에러 바운더리의 장점:**
- 자동으로 에러를 캐치하여 처리
- 세그먼트별 에러 처리 가능 (nested error boundaries)
- `reset()` 함수로 세그먼트만 재렌더링
- 에러 digest로 프로덕션 디버깅 지원

---

### 3. 통화 포맷 유틸리티

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

### 4. 날짜 포맷 유틸리티

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

### 5. 이메일 검증 유틸리티

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

### 6. Public API Export

```typescript
// src/client/shared/types/index.ts
export * from './error';
export * from './common';

// src/client/shared/utils/index.ts
export { cn } from './cn';
export * from './format/currency';
export * from './format/date';
export * from './validation/email';

// src/client/shared/ui/index.ts
export { Button, buttonVariants } from './button';
export { ThemeToggle } from './theme-toggle';
export { Input } from './input';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
```

---

## ✅ 체크리스트

### 에러 처리
- [x] `src/client/shared/types/error.ts` 구현
- [x] `app/error.tsx` 구현 (Next.js 공식 에러 바운더리)
- [x] `app/global-error.tsx` 구현 (전역 에러 처리)

### 유틸리티
- [x] `src/client/shared/utils/format/currency.ts` 구현
- [x] `src/client/shared/utils/format/date.ts` 구현
- [x] `src/client/shared/utils/validation/email.ts` 구현

### 테스트
- [x] `src/client/shared/utils/format/__tests__/currency.test.ts` 작성
- [x] `src/client/shared/utils/format/__tests__/date.test.ts` 작성
- [x] `src/client/shared/utils/validation/__tests__/email.test.ts` 작성
- [x] Vitest 설정 완료 (40개 테스트 모두 통과)

### Public API
- [x] `src/client/shared/types/index.ts` export
- [x] `src/client/shared/utils/index.ts` export
- [x] `src/client/shared/ui/index.ts` export

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
- **자동 에러 처리**: Next.js error.tsx가 자동으로 에러를 캐치
- **세그먼트별 처리**: 라우트 세그먼트별로 error.tsx를 배치하여 세밀한 제어 가능
- **reset() 함수**: 전체 앱 리로드 없이 세그먼트만 재렌더링
- **에러 digest**: 프로덕션 환경에서 에러 추적에 사용되는 고유 ID

### Next.js 에러 바운더리 동작 방식
1. 에러 발생 시 가장 가까운 `error.tsx`가 활성화됨
2. 에러가 캐치되지 않으면 상위로 버블링됨
3. 최상위까지 에러가 전파되면 `global-error.tsx`가 처리
4. layout 컴포넌트의 에러는 `global-error.tsx`만 처리 가능

### 구현 변경 사항
- ~~커스텀 ErrorBoundary 클래스 컴포넌트~~ → Next.js 공식 error.tsx 사용
- ~~useErrorHandler 훅~~ → Next.js 자동 에러 처리 사용
- Currency, ExchangeRate 타입 제거 (도메인 타입이므로 shared에 적합하지 않음)

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
**상태**: ✅ 완료

**구현일**: 2025-01-25  
**변경 사항**:
- Next.js 공식 에러 바운더리 방식으로 구현
- useErrorHandler 훅 제거 (불필요)
- 도메인 타입(Currency, ExchangeRate) 제거
- Vitest 테스트 코드 작성 완료 (40개 테스트 통과)

