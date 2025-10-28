# Task 002: 로그인 페이지 UI 구현

> **Phase**: UI 구현 (정적 UI)  
> **관련 US**: US-001 (사용자 로그인)  
> **Priority**: High

## 📋 연관 문서

- **Requirements**: [US-001](../requirements/02-user-stories.md#us-001-이메일-로그인)
- **Design**: [architecture.md](../design/architecture.md) - FSD Pages 레이어
- **Design System**: [design-system.md](../design/design-system.md)
- **BDD**: [login.feature](../../cypress/features/auth/login.feature)

---

## 🎯 작업 목표

로그인 페이지의 **정적 UI**를 구현합니다. 이 단계에서는 실제 로그인 기능 없이 **UI 구조와 스타일링**만 완성합니다.

---

## 🎨 UI 요구사항 (와이어프레임 기반)

### 전체 레이아웃

```
┌─────────────────────────────────────────┐
│  Header (Task 001) - "환전 내역" 활성화     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│                                         │
│              [RSS 아이콘]               │
│                                         │
│             반갑습니다.                 │
│      로그인 정보를 입력해주세요.        │
│                                         │
│    ┌───────────────────────────────┐   │
│    │  이메일 주소를 입력해주세요.  │   │
│    │  [test@test.com          ]    │   │
│    │                               │   │
│    │  [    로그인 하기    ]        │   │
│    └───────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 디자인 컨셉

**"신뢰감 있는 금융 서비스의 첫 인상"**

- **중앙 정렬 레이아웃**: 집중도 향상
- **심플한 구조**: 이메일만 입력하면 시작
- **브랜드 아이덴티티**: 아이콘 + 환영 메시지
- **명확한 CTA**: 큰 로그인 버튼

---

## 📐 상세 UI 스펙

### 1. 페이지 컨테이너

```tsx
배경: bg-gradient-to-br from-secondary-50 via-white to-primary-50
패딩: p-4
최소 높이: min-h-screen
정렬: flex items-center justify-center
```

**다크모드**:
```tsx
배경: bg-gradient-to-br from-secondary-950 via-secondary-900 to-secondary-950
```

---

### 2. 메인 카드 영역

```tsx
최대 너비: max-w-md (448px)
너비: w-full
```

#### 브랜드 아이콘

```tsx
컴포넌트: Rss (lucide-react)
크기: w-16 h-16
색상: text-primary-500
배경: bg-gradient-to-br from-primary-100 to-primary-50
  dark:from-primary-900/30 dark:to-primary-950/20
패딩: p-4
테두리: rounded-2xl
그림자: shadow-lg shadow-primary-500/20
위치: mx-auto (중앙 정렬)
여백: mb-8
```

**애니메이션**:
```tsx
hover:scale-105 transition-transform duration-300
```

---

### 3. 헤더 텍스트

#### 메인 제목 "반갑습니다."

```tsx
크기: text-4xl
굵기: font-bold
색상: text-secondary-900 dark:text-secondary-50
정렬: text-center
여백: mb-3
```

#### 부제목 "로그인 정보를 입력해주세요."

```tsx
크기: text-lg
색상: text-secondary-600 dark:text-secondary-400
정렬: text-center
여백: mb-8
```

---

### 4. 폼 카드

```tsx
배경: bg-white dark:bg-secondary-900
테두리: border border-secondary-200 dark:border-secondary-800
둥근 모서리: rounded-2xl
패딩: p-8
그림자: shadow-xl
```

#### 폼 내부 구조

```tsx
간격: space-y-6
```

---

### 5. 이메일 입력 필드

#### 라벨

```tsx
텍스트: "이메일 주소를 입력해주세요."
크기: text-sm
굵기: font-medium
색상: text-secondary-700 dark:text-secondary-300
여백: mb-2
```

#### Input 필드

```tsx
컴포넌트: Input (shadcn/ui)
타입: email
placeholder: "example@email.com"
높이: h-12
테두리: border-secondary-300 dark:border-secondary-700
포커스: focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
data-testid: "email-input"
```

**스타일**:
```tsx
className="h-12 text-base border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-secondary-700 dark:bg-secondary-800"
```

---

### 6. 로그인 버튼

```tsx
컴포넌트: Button (shadcn/ui)
타입: submit
너비: w-full
높이: h-12
배경: bg-gradient-to-r from-secondary-900 to-secondary-800
  dark:from-secondary-800 dark:to-secondary-700
텍스트: text-white font-semibold text-base
그림자: shadow-lg shadow-secondary-900/30
호버: hover:shadow-xl hover:shadow-secondary-900/40
data-testid: "login-button"
```

**애니메이션**:
```tsx
transition-all duration-200
hover:scale-[1.02]
```

---

### 7. 하단 안내 텍스트 (옵션)

```tsx
텍스트: "가입되지 않은 이메일은 자동으로 회원가입됩니다"
크기: text-xs
색상: text-secondary-500 dark:text-secondary-400
정렬: text-center
여백: mt-4
```

---

## 📁 구현할 파일

### 1. Pages - Login

#### `src/client/pages/login/ui/LoginPage.tsx`

```tsx
'use client'

import { Rss } from 'lucide-react'
import { Input, Button, Card, CardContent } from '@/shared/ui'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 브랜드 아이콘 */}
        <div className="w-16 h-16 mx-auto mb-8 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-950/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 hover:scale-105 transition-transform duration-300">
          <Rss className="w-9 h-9 text-primary-500" strokeWidth={2.5} />
        </div>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-3">
            반갑습니다.
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400">
            로그인 정보를 입력해주세요.
          </p>
        </div>

        {/* 폼 카드 */}
        <Card className="border-secondary-200 dark:border-secondary-800 shadow-xl">
          <CardContent className="pt-8 pb-8 px-8">
            <form className="space-y-6">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
                >
                  이메일 주소를 입력해주세요.
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  data-testid="email-input"
                  className="h-12 text-base border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-secondary-700 dark:bg-secondary-800"
                />
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-secondary-900 to-secondary-800 dark:from-secondary-800 dark:to-secondary-700 hover:shadow-xl hover:shadow-secondary-900/40 text-white font-semibold text-base shadow-lg shadow-secondary-900/30 transition-all duration-200 hover:scale-[1.02]"
                data-testid="login-button"
              >
                로그인 하기
              </Button>

              {/* 안내 문구 */}
              <p className="text-xs text-secondary-500 dark:text-secondary-400 text-center mt-4">
                가입되지 않은 이메일은 자동으로 회원가입됩니다
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

#### `src/client/pages/login/index.ts` (Public API)

```tsx
export { LoginPage } from './ui/LoginPage'
```

---

### 2. App Router Page

#### `app/(public)/login/page.tsx`

```tsx
import { LoginPage } from '@/pages/login'

export const metadata = {
  title: '로그인 - Switch Won',
  description: '안전하고 빠른 환전 서비스 Switch Won에 로그인하세요',
}

export default function Page() {
  return <LoginPage />
}
```

---

## 🎨 디자인 토큰 사용

### 색상

```css
/* Light Mode */
--page-bg: bg-gradient-to-br from-secondary-50 via-white to-primary-50
--icon-bg: from-primary-100 to-primary-50
--icon-color: text-primary-500
--card-bg: bg-white
--card-border: border-secondary-200
--title: text-secondary-900
--subtitle: text-secondary-600
--button-bg: from-secondary-900 to-secondary-800

/* Dark Mode */
--page-bg: from-secondary-950 via-secondary-900 to-secondary-950
--icon-bg: from-primary-900/30 to-primary-950/20
--card-bg: bg-secondary-900
--card-border: border-secondary-800
--title: text-secondary-50
--subtitle: text-secondary-400
--button-bg: from-secondary-800 to-secondary-700
```

### 크기

```
아이콘 크기: w-16 h-16 (64px)
제목 크기: text-4xl (36px)
부제목 크기: text-lg (18px)
Input 높이: h-12 (48px)
Button 높이: h-12 (48px)
카드 패딩: p-8 (32px)
```

---

## 🎯 인터랙션

### 1. Input Focus

```tsx
- 테두리 색상 변경: border-primary-500
- Ring 효과: ring-2 ring-primary-500/20
- 트랜지션: transition-all duration-200
```

### 2. Button Hover

```tsx
- 그림자 확대: hover:shadow-xl
- 약간 확대: hover:scale-[1.02]
- 트랜지션: transition-all duration-200
```

### 3. Icon Hover

```tsx
- 확대: hover:scale-105
- 트랜지션: transition-transform duration-300
```

---

## ✅ 완료 조건

- [ ] LoginPage 컴포넌트 구현
- [ ] 반응형 디자인 (모바일/데스크톱)
- [ ] 다크모드 지원
- [ ] Input 포커스 효과
- [ ] Button 호버 효과
- [ ] 아이콘 애니메이션
- [ ] 그라데이션 배경 적용
- [ ] 접근성 (label, aria-label)
- [ ] Cypress 테스트 data-testid 추가

---

## 🚀 AI 프롬프트

### 1단계: 컴포넌트 생성

```
src/client/pages/login/ 디렉토리를 생성하고
LoginPage.tsx 컴포넌트를 와이어프레임 기준으로 구현해줘
```

### 2단계: App Router 연결

```
app/(public)/login/page.tsx를 생성하고
LoginPage를 연결해줘
```

### 3단계: 스타일링 확인

```
다크모드와 라이트모드에서 모두 확인
반응형 동작 테스트
애니메이션 동작 확인
```

---

## 📝 참고사항

### 와이어프레임 특징

1. **심플함**: 이메일 하나만 입력
2. **브랜드 강조**: RSS 아이콘으로 시각적 식별
3. **환영 메시지**: "반갑습니다." - 친근한 느낌
4. **자동 가입**: 별도 회원가입 불필요

### 컴포넌트 사용

- **Rss 아이콘**: `lucide-react`
- **Input**: `shadcn/ui`
- **Button**: `shadcn/ui`
- **Card**: `shadcn/ui`

### 접근성

```tsx
- label htmlFor="email"
- Input id="email"
- Button type="submit"
- data-testid 속성
```

---

## 🎯 기대 결과

### Light Mode

```
┌─────────────────────────────────────┐
│         [파란색 RSS 아이콘]          │
│                                     │
│         반갑습니다.                 │
│    로그인 정보를 입력해주세요.      │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ 이메일 주소를 입력해주세요.  │  │
│  │ [example@email.com     ]    │  │
│  │                             │  │
│  │ [   로그인 하기   ]         │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Dark Mode

```
┌─────────────────────────────────────┐ (어두운 배경)
│      [은은한 Amber RSS 아이콘]      │
│                                     │
│         반갑습니다.                 │  (밝은 텍스트)
│    로그인 정보를 입력해주세요.      │
│                                     │
│  ┌─────────────────────────────┐  │ (어두운 카드)
│  │ 이메일 주소를 입력해주세요.  │  │
│  │ [example@email.com     ]    │  │
│  │                             │  │
│  │ [   로그인 하기   ]         │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

심플하면서도 신뢰감 있는 로그인 페이지가 완성됩니다! 🎉

