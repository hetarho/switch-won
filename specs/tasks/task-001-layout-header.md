# Task 001: 공통 헤더 레이아웃 구현

> **Phase**: UI 구현 (정적 UI)  
> **관련 US**: 모든 페이지 공통  
> **Priority**: High (모든 페이지에서 사용되는 기본 레이아웃)

## 📋 연관 문서

- **Requirements**: [01-project-overview.md](../requirements/01-project-overview.md)
- **Design**: [architecture.md](../design/architecture.md) - FSD Widgets 레이어
- **Design System**: [design-system.md](../design/design-system.md)

---

## 🎯 작업 목표

애플리케이션의 **공통 헤더 컴포넌트**를 구현합니다. 로그인 여부에 따라 다른 UI를 보여주며, 다크모드 토글 기능을 포함합니다.

---

## 🎨 UI 요구사항 (가상 디자이너 시안)

### 전체 헤더 스펙

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                    [환전하기] [환전내역] [🌙] [로그아웃] │  ← 로그인 시
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [Logo]                                              [🌙]     │  ← 로그아웃 시
└─────────────────────────────────────────────────────────────┘
```

### 디자인 컨셉

**"신뢰감 있는 금융 서비스의 미니멀 헤더"**

- **투명한 배경 + 서브틀한 테두리**: 콘텐츠 위에 떠있는 느낌
- **간격과 정렬의 일관성**: 좌우 대칭, 충분한 여백
- **액션 버튼의 시각적 계층**: Primary(로그아웃) > Secondary(네비게이션) > Ghost(테마 토글)
- **반응형**: 모바일에서는 햄버거 메뉴로 전환

---

## 📐 상세 UI 스펙

### 1. 헤더 컨테이너

```
높이: 64px (h-16)
배경: bg-white/80 backdrop-blur-md (Glass effect)
테두리: border-b border-secondary-200/50
그림자: shadow-sm
위치: sticky top-0 (스크롤 시 상단 고정)
z-index: z-sticky (1020)
```

**다크모드**:
```
배경: bg-secondary-900/80 backdrop-blur-md
테두리: border-secondary-800/50
```

---

### 2. 로고 (좌측)

#### 로그인 전/후 공통

```tsx
위치: 좌측 정렬
간격: px-6 (24px)
구성: [아이콘] + [텍스트]

아이콘:
- Coins (lucide-react)
- 크기: w-8 h-8
- 색상: text-primary-600 (Amber)
- 그라데이션 배경: bg-gradient-to-br from-primary-500 to-primary-600
- 원형: rounded-xl p-1.5

텍스트:
- "Switch Won"
- 폰트: text-xl font-bold
- 색상: text-secondary-900 dark:text-secondary-50
- 좌측 여백: ml-3
```

**예시**:
```tsx
<Link href="/">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
      <Coins className="w-6 h-6 text-white" strokeWidth={2.5} />
    </div>
    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
      Switch Won
    </span>
  </div>
</Link>
```

---

### 3. 네비게이션 (로그인 시만 표시)

#### 위치 및 레이아웃

```
위치: 우측, 로그아웃 버튼 왼쪽
간격: gap-1 (4px)
```

#### 네비게이션 아이템

**"환전하기" 버튼**:
```tsx
컴포넌트: Link + Button (ghost variant)
경로: /exchange
아이콘: ArrowLeftRight (lucide-react)
텍스트: "환전하기"
스타일:
  - variant="ghost"
  - 기본: text-secondary-700 dark:text-secondary-300
  - Hover: bg-secondary-100 dark:bg-secondary-800
  - Active: bg-surface-tertiary text-primary-600 dark:text-primary-400
```

**"환전내역" 버튼**:
```tsx
컴포넌트: Link + Button (ghost variant)
경로: /history
아이콘: History (lucide-react)
텍스트: "환전내역"
스타일: "환전하기"와 동일
```

**예시**:
```tsx
<nav className="flex items-center gap-1">
  <Link href="/exchange">
    <Button variant="ghost" className="gap-2">
      <ArrowLeftRight className="w-4 h-4" />
      <span>환전하기</span>
    </Button>
  </Link>
  
  <Link href="/history">
    <Button variant="ghost" className="gap-2">
      <History className="w-4 h-4" />
      <span>환전내역</span>
    </Button>
  </Link>
</nav>
```

---

### 4. 우측 액션 영역

#### 레이아웃

```
위치: 우측 끝
간격: gap-2 (8px)
패딩: px-6 (24px)
구성: [로그아웃 버튼 (로그인 시만)] + [테마 토글]
```

#### 로그아웃 버튼 (로그인 시만)

```tsx
컴포넌트: Button
variant: outline
아이콘: LogOut (lucide-react)
텍스트: "로그아웃"
스타일:
  - border-secondary-300 dark:border-secondary-700
  - text-secondary-700 dark:text-secondary-300
  - hover:bg-secondary-100 dark:hover:bg-secondary-800
```

**예시**:
```tsx
<Button variant="outline" className="gap-2">
  <LogOut className="w-4 h-4" />
  <span className="hidden sm:inline">로그아웃</span>
</Button>
```

#### 테마 토글 버튼 (항상 표시)

```tsx
컴포넌트: ThemeToggle (src/client/shared/ui/theme-toggle.tsx)
위치: 가장 우측
스타일:
  - variant="outline"
  - size="icon"
  - 아이콘: Sun (라이트 모드) / Moon (다크 모드)
```

---

### 5. 반응형 디자인

#### Desktop (lg 이상, ≥1024px)

```tsx
- 로고, 네비게이션, 액션 버튼 모두 표시
- 텍스트 모두 표시
```

#### Tablet (md ~ lg, 768px ~ 1023px)

```tsx
- 로고 텍스트 유지
- 네비게이션 아이콘만 표시 (텍스트 숨김)
- 로그아웃 버튼 텍스트 숨김
```

#### Mobile (< md, < 768px)

```tsx
- 로고 아이콘 + 축약 텍스트 ("SW")
- 네비게이션 + 로그아웃을 햄버거 메뉴로 변경
- 우측: [햄버거 메뉴] + [테마 토글]
```

**모바일 메뉴 (Sheet/Drawer)**:
```tsx
트리거: Menu 아이콘 (lucide-react)
위치: 우측에서 슬라이드
내용:
  - 로고
  - 네비게이션 링크 (세로 배열)
  - 로그아웃 버튼
```

---

## 📁 구현할 파일

### 1. Widget - Header

#### `src/client/widgets/header/ui/Header.tsx`

```tsx
'use client'

import { Coins, ArrowLeftRight, History, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

interface HeaderProps {
  isAuthenticated?: boolean
  currentPath?: string
}

export function Header({ isAuthenticated = false, currentPath = '/' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-sticky h-16 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md border-b border-secondary-200/50 dark:border-secondary-800/50 shadow-sm">
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Coins className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent hidden sm:inline">
              Switch Won
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent sm:hidden">
              SW
            </span>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Navigation (Desktop - Authenticated) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/exchange">
                <Button 
                  variant="ghost" 
                  className={`gap-2 ${currentPath === '/exchange' ? 'bg-surface-tertiary text-primary-600 dark:text-primary-400' : ''}`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span className="hidden lg:inline">환전하기</span>
                </Button>
              </Link>
              
              <Link href="/history">
                <Button 
                  variant="ghost" 
                  className={`gap-2 ${currentPath === '/history' ? 'bg-surface-tertiary text-primary-600 dark:text-primary-400' : ''}`}
                >
                  <History className="w-4 h-4" />
                  <span className="hidden lg:inline">환전내역</span>
                </Button>
              </Link>
            </nav>
          )}

          {/* Logout Button (Desktop - Authenticated) */}
          {isAuthenticated && (
            <Button variant="outline" className="gap-2 hidden md:flex">
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">로그아웃</span>
            </Button>
          )}

          {/* Mobile Menu (Authenticated) */}
          {isAuthenticated && (
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* Theme Toggle (Always) */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
```

#### `src/client/widgets/header/index.ts` (Public API)

```tsx
export { Header } from './ui/Header'
```

---

### 2. Shared - ThemeToggle

#### `src/client/shared/ui/theme-toggle.tsx`

```tsx
'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">테마 전환</span>
    </Button>
  )
}
```

#### `src/client/shared/ui/index.ts` 업데이트

```tsx
// 기존 exports...
export { ThemeToggle } from './theme-toggle'
```

---

### 3. Provider - ThemeProvider

#### `app/providers/ThemeProvider.tsx`

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

#### `app/layout.tsx` 업데이트

```tsx
import { ThemeProvider } from './providers/ThemeProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

### 4. 레이아웃에 Header 추가

#### `app/(authenticated)/layout.tsx` (로그인 필요 페이지)

```tsx
import { Header } from '@/widgets/header'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header isAuthenticated={true} />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  )
}
```

#### `app/(public)/layout.tsx` (공개 페이지)

```tsx
import { Header } from '@/widgets/header'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header isAuthenticated={false} />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  )
}
```

---

## 🎨 디자인 토큰 사용

### 색상

```css
/* Light Mode */
--header-bg: bg-white/80
--header-border: border-secondary-200/50
--logo-gradient: from-primary-500 to-primary-600
--nav-text: text-secondary-700
--nav-hover: bg-secondary-100
--nav-active: bg-surface-tertiary text-primary-600

/* Dark Mode */
--header-bg: bg-secondary-900/80
--header-border: border-secondary-800/50
--nav-text: text-secondary-300
--nav-hover: bg-secondary-800
--nav-active: bg-surface-tertiary text-primary-400
```

### 간격

```
헤더 높이: h-16 (64px)
좌우 패딩: px-6 (24px)
아이템 간격: gap-2 (8px)
로고 아이콘: w-10 h-10 (40px)
```

---

## ✅ 완료 조건

- [ ] Header 컴포넌트 구현 (로그인/로그아웃 상태별 UI)
- [ ] ThemeToggle 컴포넌트 구현 (next-themes 사용)
- [ ] ThemeProvider 설정 (layout.tsx)
- [ ] 로고 클릭 시 홈으로 이동
- [ ] 네비게이션 링크 활성화 상태 표시
- [ ] 다크모드 전환 애니메이션
- [ ] 반응형 디자인 (모바일 메뉴)
- [ ] Glass effect 적용
- [ ] 스크롤 시 sticky 위치 고정
- [ ] 접근성 (키보드 네비게이션, ARIA labels)

---

## 🚀 AI 프롬프트

### 1단계: 디렉토리 생성
```
src/client/widgets/header/ui/ 디렉토리를 생성하고
Header.tsx 컴포넌트를 위 스펙대로 구현해줘
```

### 2단계: ThemeToggle 구현
```
src/client/shared/ui/theme-toggle.tsx를 생성하고
next-themes를 사용한 테마 토글 버튼을 구현해줘
Sun/Moon 아이콘 전환 애니메이션 포함
```

### 3단계: Provider 설정
```
app/providers/ThemeProvider.tsx를 생성하고
app/layout.tsx에 ThemeProvider를 추가해줘
suppressHydrationWarning 포함
```

### 4단계: 통합 테스트
```
Header를 layout.tsx에 추가하고
로그인/로그아웃 상태 시뮬레이션 테스트
다크모드 전환 테스트
반응형 동작 확인
```

---

## 📝 참고사항

### next-themes 설정

```bash
pnpm add next-themes
```

**주요 기능**:
- `attribute="class"`: HTML에 `.dark` 클래스 추가
- `defaultTheme="system"`: 시스템 설정 따름
- `enableSystem`: 시스템 테마 감지
- `disableTransitionOnChange`: 테마 전환 시 깜빡임 방지

### Glass Effect (Glassmorphism)

```tsx
className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md"
```

- `bg-white/80`: 80% 불투명도
- `backdrop-blur-md`: 배경 블러 효과
- 모던하고 고급스러운 느낌

### Active State 표시

현재 페이지에 따라 네비게이션 하이라이트:
```tsx
className={currentPath === '/exchange' ? 'bg-surface-tertiary text-primary-600' : ''}
```

---

## 🎯 기대 결과

### 완성된 헤더 모습

**Light Mode (로그인 전)**:
```
┌─────────────────────────────────────────────────────────┐
│  🪙 Switch Won                                     ☀️   │
└─────────────────────────────────────────────────────────┘
```

**Light Mode (로그인 후)**:
```
┌──────────────────────────────────────────────────────────────────┐
│  🪙 Switch Won    [환전하기] [환전내역]  [로그아웃]  ☀️          │
└──────────────────────────────────────────────────────────────────┘
```

**Dark Mode (로그인 후)**:
```
┌──────────────────────────────────────────────────────────────────┐
│  🪙 Switch Won    [환전하기] [환전내역]  [로그아웃]  🌙          │  (어두운 배경)
└──────────────────────────────────────────────────────────────────┘
```

신뢰감 있고 깔끔한 금융 서비스의 헤더가 완성됩니다! 🎉

