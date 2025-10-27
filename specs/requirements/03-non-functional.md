# Non-Functional Requirements: Switch Won

## 📋 목차

- [성능 요구사항](#성능-요구사항)
- [보안 요구사항](#보안-요구사항)
- [사용성 요구사항](#사용성-요구사항)
- [신뢰성 요구사항](#신뢰성-요구사항)
- [유지보수성 요구사항](#유지보수성-요구사항)
- [호환성 요구사항](#호환성-요구사항)
- [접근성 요구사항](#접근성-요구사항)

---

## 🚀 성능 요구사항

### NFR-001: 페이지 로드 시간
**요구사항**: 모든 페이지의 초기 로드 시간은 2초 이내여야 함

**측정 방법**:
- Lighthouse Performance Score: > 90
- First Contentful Paint (FCP): < 1.5초
- Time to Interactive (TTI): < 2초
- Largest Contentful Paint (LCP): < 2.5초

**구현 방법**:
- Next.js의 자동 코드 스플리팅 활용
- 이미지 최적화 (Next.js Image 컴포넌트)
- 폰트 최적화 (next/font)
- React Query를 사용한 효율적인 데이터 캐싱

---

### NFR-002: API 응답 시간
**요구사항**: 모든 API 호출의 평균 응답 시간은 1초 이내여야 함

**측정 방법**:
- 개발자 도구의 Network 탭으로 측정
- API 호출 시간: < 1초 (95 percentile)

**구현 방법**:
- API 호출 시 로딩 상태 표시
- React Query의 캐싱 전략 활용
- Optimistic Updates 적용 (가능한 경우)
- 에러 발생 시 자동 재시도 (3회)

---

### NFR-003: 실시간 환율 갱신
**요구사항**: 환율 정보는 1분마다 자동으로 갱신되어야 함

**측정 방법**:
- 갱신 주기: 정확히 60초 ± 5초
- 갱신 지연: < 5초

**구현 방법**:
- React Query의 `refetchInterval: 60000` 사용
- 백그라운드에서 자동 갱신
- 사용자가 탭을 전환해도 갱신 유지 (`refetchOnWindowFocus: true`)

---

### NFR-004: 번들 크기 최적화
**요구사항**: JavaScript 번들 크기는 500KB 이하여야 함

**측정 방법**:
- Next.js 빌드 후 번들 크기 확인
- 초기 로드 번들: < 300KB
- 전체 번들: < 500KB

**구현 방법**:
- 동적 import 사용
- Tree-shaking 활용
- 불필요한 라이브러리 제거
- Bundle Analyzer로 주기적 분석

---

## 🔒 보안 요구사항

### NFR-005: JWT 토큰 보안
**요구사항**: JWT 토큰은 안전하게 저장되고 전송되어야 함

**구현 방법**:
- **저장**: HTTP-Only Cookie (권장) 또는 Local Storage
- **전송**: HTTPS 사용 (프로덕션 환경)
- **만료**: 토큰 만료 시 자동 로그아웃
- **헤더**: 모든 인증 API 요청에 `Authorization: Bearer ${token}` 포함

**보안 체크리스트**:
- [ ] 토큰을 클라이언트 JavaScript로 직접 접근 불가 (HTTP-Only Cookie 사용 시)
- [ ] HTTPS를 통한 토큰 전송 (프로덕션)
- [ ] 토큰 만료 시간 설정
- [ ] XSS 공격 방지 (입력 값 검증 및 이스케이프)
- [ ] CSRF 공격 방지 (Cookie 사용 시 CSRF 토큰 필요)

---

### NFR-006: API 보안
**요구사항**: 모든 API 요청은 인증되고 검증되어야 함

**구현 방법**:
- 인증이 필요한 모든 API에 JWT 토큰 포함
- 401 Unauthorized 응답 시 자동 로그아웃
- API 에러 메시지에 민감한 정보 포함하지 않기
- Rate Limiting (서버 측에서 처리)

**보안 체크리스트**:
- [ ] Bearer Token이 없는 요청은 자동 거부
- [ ] 유효하지 않은 토큰은 자동 로그아웃
- [ ] API 에러 메시지는 일반적인 메시지만 표시

---

### NFR-007: 입력 값 검증
**요구사항**: 모든 사용자 입력은 클라이언트와 서버 양쪽에서 검증되어야 함

**구현 방법**:
- 이메일 형식 검증 (정규식)
- 환전 금액 검증 (숫자, 최소/최대값)
- XSS 공격 방지를 위한 입력 값 이스케이프
- React의 자동 이스케이프 활용

**검증 규칙**:
- 이메일: RFC 5322 표준 준수
- 금액: 양수, 소수점 2자리까지
- 통화: 서버에서 지원하는 통화 코드만 허용

---

## 👤 사용성 요구사항

### NFR-008: 로딩 상태 표시
**요구사항**: 모든 비동기 작업에 로딩 상태를 명확하게 표시해야 함

**구현 방법**:
- API 호출 중: 로딩 스피너 또는 스켈레톤 UI
- 버튼 클릭 시: 버튼 비활성화 + 로딩 인디케이터
- 페이지 전환 시: 로딩 바 (nprogress 등)

**로딩 UI 위치**:
- 로그인: 버튼 내 로딩 인디케이터
- 지갑 잔액: 스켈레톤 UI
- 환율 정보: 스켈레톤 UI
- 환전 내역: 스켈레톤 UI 또는 목록 로딩
- 환전 실행: 버튼 비활성화 + 로딩

---

### NFR-009: 에러 메시지
**요구사항**: 모든 에러는 사용자가 이해할 수 있는 명확한 메시지로 표시되어야 함

**에러 메시지 작성 규칙**:
- 구체적이고 명확하게
- 기술적 용어 대신 일반 용어 사용
- 해결 방법 제시 (가능한 경우)
- 긍정적이고 도움이 되는 톤

**에러 메시지 예시**:
```
❌ 나쁜 예: "Error 500: Internal Server Error"
✅ 좋은 예: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."

❌ 나쁜 예: "Invalid email format"
✅ 좋은 예: "유효한 이메일 주소를 입력해주세요. (예: user@example.com)"

❌ 나쁜 예: "Insufficient funds"
✅ 좋은 예: "지갑 잔액이 부족합니다. 현재 잔액: ₩10,000"
```

---

### NFR-010: 성공 피드백
**요구사항**: 사용자 액션이 성공하면 명확한 피드백을 제공해야 함

**피드백 방법**:
- 토스트 메시지 (3초 후 자동 사라짐)
- 성공 모달 (중요한 액션)
- 체크 아이콘 + 메시지
- 자동 데이터 갱신 (환전 후 잔액 갱신 등)

**피드백 예시**:
- 로그인 성공: 페이지 리다이렉트 (별도 메시지 불필요)
- 환전 성공: "환전이 완료되었습니다!" 토스트 메시지
- 로그아웃: "로그아웃되었습니다" 토스트 메시지 (선택)

---

### NFR-011: 반응형 디자인
**요구사항**: 모바일, 태블릿, 데스크톱 모든 화면 크기에서 정상 작동해야 함

**반응형 브레이크포인트** (Tailwind CSS 기본값):
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**구현 방법**:
- Tailwind CSS의 반응형 유틸리티 사용
- 모바일 우선(Mobile-First) 접근
- 터치 친화적인 UI (버튼 크기 최소 44x44px)

**테스트 기기**:
- [ ] iPhone (iOS Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop (Chrome, Safari, Firefox)

---

## 🔧 신뢰성 요구사항

### NFR-012: 에러 핸들링
**요구사항**: 모든 API 에러는 적절하게 처리되어야 함

**에러 처리 전략**:
- **401 Unauthorized**: 자동 로그아웃 + 로그인 페이지 리다이렉트
- **400 Bad Request**: 입력 값 검증 에러 메시지 표시
- **404 Not Found**: "요청한 데이터를 찾을 수 없습니다" 메시지
- **500 Server Error**: "일시적인 오류입니다. 잠시 후 다시 시도해주세요"
- **Network Error**: "인터넷 연결을 확인해주세요"

**구현 방법**:
- React Query의 `onError` 콜백 사용
- Axios/Fetch 인터셉터에서 전역 에러 처리
- Error Boundary로 예상치 못한 에러 처리

---

### NFR-013: 자동 재시도
**요구사항**: 일시적인 네트워크 오류 시 자동으로 재시도해야 함

**재시도 전략**:
- 재시도 횟수: 최대 3회
- 재시도 간격: 1초, 2초, 4초 (exponential backoff)
- 재시도 대상: GET 요청 (멱등성 보장)
- 재시도 제외: POST/PUT/DELETE (중복 요청 방지)

**구현 방법**:
```typescript
useQuery({
  queryKey: ['wallets'],
  queryFn: fetchWallets,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
```

---

### NFR-014: 데이터 일관성
**요구사항**: 환전 후 지갑 잔액이 자동으로 최신화되어야 함

**구현 방법**:
- 환전 성공 후 지갑 잔액 쿼리 무효화 (invalidate)
- React Query의 `invalidateQueries` 사용
- Optimistic Updates (선택사항)

**코드 예시**:
```typescript
const mutation = useMutation({
  mutationFn: createExchangeOrder,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['wallets'] });
  },
});
```

---

## 🛠️ 유지보수성 요구사항

### NFR-015: 코드 품질
**요구사항**: 코드는 일관된 스타일과 높은 품질을 유지해야 함

**코드 품질 기준**:
- TypeScript 타입 에러 0개
- ESLint 에러 0개 (Warning은 최소화)
- Feature Sliced Design 아키텍처 준수
- 함수/컴포넌트는 단일 책임 원칙 준수

**코딩 컨벤션**:
- 컴포넌트: PascalCase (예: `LoginForm`)
- 함수/변수: camelCase (예: `useLogin`)
- 상수: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- 파일명: kebab-case (예: `login-form.tsx`)

---

### NFR-016: 테스트 커버리지
**요구사항**: 모든 주요 기능은 BDD 테스트로 커버되어야 함

**테스트 요구사항**:
- 모든 사용자 스토리는 Cucumber Feature 파일로 작성
- 모든 Feature는 Step Definitions 구현
- 주요 시나리오는 Cypress E2E 테스트로 검증
- Critical Path는 100% 테스트 커버리지

**테스트 범위**:
- ✅ 로그인/로그아웃
- ✅ 라우트 보호
- ✅ 환전 견적 및 실행
- ✅ 환전 내역 조회
- ✅ 에러 핸들링

---

### NFR-017: 문서화
**요구사항**: 모든 명세와 코드는 명확하게 문서화되어야 함

**문서화 요구사항**:
- Requirements 명세 작성 완료
- Design 명세 작성 완료
- Tasks 명세 작성 완료
- BDD Feature 파일 작성
- 주요 컴포넌트에 JSDoc 주석
- API 함수에 타입 정의 및 주석

**문서 유지보수**:
- 코드 변경 시 관련 명세서 업데이트
- 명세서와 코드의 일관성 유지

---

## 🌐 호환성 요구사항

### NFR-018: 브라우저 지원
**요구사항**: 주요 모던 브라우저를 지원해야 함

**지원 브라우저**:
- ✅ Chrome (최신 버전)
- ✅ Safari (최신 버전)
- ✅ Firefox (최신 버전)
- ✅ Edge (최신 버전)
- ❌ Internet Explorer (지원 안 함)

**테스트 방법**:
- BrowserStack 또는 실제 기기 테스트
- Cypress의 멀티 브라우저 테스트 활용

---

### NFR-019: 디바이스 지원
**요구사항**: 다양한 디바이스에서 정상 작동해야 함

**지원 디바이스**:
- ✅ Desktop (Windows, macOS)
- ✅ Mobile (iOS, Android)
- ✅ Tablet (iPad, Android Tablet)

**테스트 해상도**:
- Mobile: 375x667 (iPhone SE)
- Tablet: 768x1024 (iPad)
- Desktop: 1920x1080 (Full HD)

---

## ♿ 접근성 요구사항

### NFR-020: 기본 접근성
**요구사항**: WCAG 2.1 Level A 기준을 준수해야 함

**접근성 체크리스트**:
- [ ] 모든 이미지에 대체 텍스트(`alt`) 제공
- [ ] 키보드만으로 모든 기능 사용 가능
- [ ] 포커스 인디케이터 명확하게 표시
- [ ] 색상만으로 정보 전달하지 않기
- [ ] 충분한 색상 대비 (4.5:1 이상)
- [ ] 폼 요소에 적절한 레이블 제공
- [ ] ARIA 속성 적절히 사용

**테스트 도구**:
- Lighthouse Accessibility Score: > 90
- axe DevTools로 자동 검사

---

## 📊 비기능 요구사항 요약

| ID | Category | Requirement | Status |
|----|----------|-------------|--------|
| NFR-001 | 성능 | 페이지 로드 < 2초 | ⏳ To Do |
| NFR-002 | 성능 | API 응답 < 1초 | ⏳ To Do |
| NFR-003 | 성능 | 환율 갱신 1분마다 | ⏳ To Do |
| NFR-004 | 성능 | 번들 크기 < 500KB | ⏳ To Do |
| NFR-005 | 보안 | JWT 토큰 보안 | ⏳ To Do |
| NFR-006 | 보안 | API 보안 | ⏳ To Do |
| NFR-007 | 보안 | 입력 값 검증 | ⏳ To Do |
| NFR-008 | 사용성 | 로딩 상태 표시 | ⏳ To Do |
| NFR-009 | 사용성 | 명확한 에러 메시지 | ⏳ To Do |
| NFR-010 | 사용성 | 성공 피드백 | ⏳ To Do |
| NFR-011 | 사용성 | 반응형 디자인 | ⏳ To Do |
| NFR-012 | 신뢰성 | 에러 핸들링 | ⏳ To Do |
| NFR-013 | 신뢰성 | 자동 재시도 | ⏳ To Do |
| NFR-014 | 신뢰성 | 데이터 일관성 | ⏳ To Do |
| NFR-015 | 유지보수 | 코드 품질 | ⏳ To Do |
| NFR-016 | 유지보수 | 테스트 커버리지 | ⏳ To Do |
| NFR-017 | 유지보수 | 문서화 | ⏳ To Do |
| NFR-018 | 호환성 | 브라우저 지원 | ⏳ To Do |
| NFR-019 | 호환성 | 디바이스 지원 | ⏳ To Do |
| NFR-020 | 접근성 | WCAG 2.1 Level A | ⏳ To Do |

---

## 🔗 관련 문서

- [프로젝트 개요](./01-project-overview.md)
- [사용자 스토리](./02-user-stories.md)
- [Design 명세](../design/) (Design 단계에서 작성)

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ✅ 승인됨

