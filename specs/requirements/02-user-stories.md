# User Stories: Switch Won

## 📋 목차

- [Epic 1: 사용자 인증](#epic-1-사용자-인증)
- [Epic 2: 환전 기능](#epic-2-환전-기능)
- [Epic 3: 환전 내역](#epic-3-환전-내역)
- [Epic 4: 라우트 보호](#epic-4-라우트-보호)

---

## Epic 1: 사용자 인증

### US-001: 이메일 로그인

**As a** 환전 서비스를 이용하려는 사용자  
**I want to** 이메일 주소만으로 간편하게 로그인할 수 있다  
**So that** 복잡한 회원가입 없이 빠르게 서비스를 시작할 수 있다

**Acceptance Criteria:**
- [ ] 로그인 페이지에 이메일 입력 필드가 있어야 함
- [ ] 이메일 형식 유효성 검사가 있어야 함 (예: `user@example.com`)
- [ ] 유효하지 않은 이메일 입력 시 에러 메시지 표시
- [ ] '시작하기' 버튼을 클릭하면 `POST /auth/login` API 호출
- [ ] 로그인 성공 시 JWT 토큰을 받아서 저장
- [ ] 로그인 성공 시 환전 페이지(`/`)로 자동 리다이렉트
- [ ] 로그인 실패 시 명확한 에러 메시지 표시
- [ ] 로딩 중에는 버튼이 비활성화되고 로딩 인디케이터 표시

**Dependencies**: 없음

**BDD Scenarios:**
- ✅ Scenario: 유효한 이메일로 로그인 성공
- ✅ Scenario: 유효하지 않은 이메일 형식으로 로그인 실패
- ✅ Scenario: 서버 에러로 로그인 실패

**API:**
```
POST /auth/login
```

---

### US-002: JWT 토큰 관리

**As a** 로그인한 사용자  
**I want to** 발급받은 JWT 토큰이 안전하게 저장되고 관리된다  
**So that** 페이지를 새로고침해도 로그인 상태가 유지되고, 인증이 필요한 API를 호출할 수 있다

**Acceptance Criteria:**
- [ ] 로그인 성공 시 JWT Access Token을 클라이언트에 저장
- [ ] 저장 방식: HTTP-Only Cookie (권장) 또는 Local Storage
- [ ] 모든 인증 API 요청의 `Authorization` 헤더에 `Bearer ${token}` 포함
- [ ] 페이지 새로고침 시에도 토큰이 유지되어야 함
- [ ] 토큰이 유효하지 않을 경우 자동으로 로그인 페이지로 리다이렉트
- [ ] 토큰 만료 시 자동으로 로그아웃 처리

**Dependencies**: US-001

**Technical Notes:**
- React Context 또는 Custom Hook으로 토큰 관리
- Axios/Fetch 인터셉터에서 자동으로 토큰 추가
- 401 응답 시 자동 로그아웃 처리

---

### US-003: 로그아웃

**As a** 로그인한 사용자  
**I want to** 로그아웃 버튼을 클릭하여 로그아웃할 수 있다  
**So that** 서비스 이용을 종료하고 보안을 유지할 수 있다

**Acceptance Criteria:**
- [ ] 환전 페이지 및 내역 페이지에 로그아웃 버튼이 있어야 함
- [ ] 로그아웃 버튼 클릭 시 저장된 JWT 토큰 삭제
- [ ] 로그아웃 후 로그인 페이지(`/login`)로 리다이렉트
- [ ] 로그아웃 후 뒤로 가기를 해도 보호된 페이지에 접근 불가
- [ ] 로그아웃 확인 모달 표시 (선택사항)

**Dependencies**: US-001, US-002

**BDD Scenarios:**
- ✅ Scenario: 로그아웃 후 로그인 페이지로 이동
- ✅ Scenario: 로그아웃 후 보호된 페이지 접근 시도

---

## Epic 2: 환전 기능

### US-004: 지갑 잔액 조회

**As a** 로그인한 사용자  
**I want to** 환전 페이지에서 내 지갑 잔액을 확인할 수 있다  
**So that** 현재 보유한 통화별 금액을 파악할 수 있다

**Acceptance Criteria:**
- [ ] 환전 페이지 로드 시 자동으로 지갑 잔액 API 호출
- [ ] 지갑에 보유한 모든 통화(KRW, USD 등)와 잔액을 표시
- [ ] 각 통화별로 금액을 구분하여 표시
- [ ] 잔액은 통화에 맞는 형식으로 포맷팅 (예: `₩1,000`, `$10.00`)
- [ ] 로딩 중에는 스켈레톤 UI 표시
- [ ] API 에러 시 에러 메시지 표시 및 재시도 버튼 제공

**Dependencies**: US-001, US-002

**API:**
```
GET /wallets
```

**BDD Scenarios:**
- ✅ Scenario: 로그인 후 지갑 잔액 정상 표시
- ✅ Scenario: 지갑 조회 실패 시 에러 처리

---

### US-005: 실시간 환율 조회

**As a** 로그인한 사용자  
**I want to** 환전 페이지에서 실시간 환율 정보를 확인할 수 있다  
**So that** 현재 환율을 기준으로 환전을 결정할 수 있다

**Acceptance Criteria:**
- [ ] 환전 페이지 로드 시 자동으로 환율 정보 API 호출
- [ ] 지원하는 모든 통화 쌍의 환율 표시 (예: USD/KRW)
- [ ] 환율 정보에는 매수율과 매도율 포함
- [ ] 환율 업데이트 시간 표시 (예: "1분 전 업데이트")
- [ ] 1분마다 자동으로 최신 환율 재조회
- [ ] 환율 변동 시 시각적 피드백 제공 (예: 깜빡임 효과)
- [ ] 로딩 중에는 스켈레톤 UI 표시

**Dependencies**: US-001, US-002

**API:**
```
GET /exchange-rates
```

**Technical Notes:**
- React Query의 `refetchInterval` 사용하여 1분마다 자동 갱신
- 또는 `setInterval` + manual refetch

**BDD Scenarios:**
- ✅ Scenario: 환율 정보 정상 표시
- ✅ Scenario: 1분 후 환율 자동 갱신
- ✅ Scenario: 환율 조회 실패 시 에러 처리

---

### US-006: 환전 견적 조회

**As a** 로그인한 사용자  
**I want to** 환전할 금액을 입력하면 실시간으로 견적을 확인할 수 있다  
**So that** 환전 후 받을 금액을 미리 알고 환전을 결정할 수 있다

**Acceptance Criteria:**
- [ ] 출발 통화(From Currency) 선택 드롭다운 제공
- [ ] 도착 통화(To Currency) 선택 드롭다운 제공
- [ ] 환전할 금액 입력 필드 제공
- [ ] 금액 입력 시 실시간으로 견적 API 호출 (디바운스 적용)
- [ ] 받을 금액을 명확하게 표시
- [ ] 적용된 환율 표시
- [ ] 수수료 정보 표시 (서버에서 제공 시)
- [ ] 입력 금액이 지갑 잔액을 초과하면 에러 메시지 표시
- [ ] 최소/최대 환전 금액 제한 (서버에서 검증)

**Dependencies**: US-004, US-005

**API:**
```
POST /orders/quote
```

**BDD Scenarios:**
- ✅ Scenario: 유효한 금액 입력 시 견적 정상 표시
- ✅ Scenario: 잔액 부족 시 에러 메시지 표시
- ✅ Scenario: 최소 금액 미만 입력 시 에러 메시지

---

### US-007: 환전 실행

**As a** 로그인한 사용자  
**I want to** 견적을 확인한 후 '환전하기' 버튼을 클릭하여 환전을 실행할 수 있다  
**So that** 원하는 통화로 환전할 수 있다

**Acceptance Criteria:**
- [ ] '환전하기' 버튼 제공
- [ ] 버튼 클릭 시 환전 실행 API 호출
- [ ] 환전 중에는 버튼 비활성화 및 로딩 표시
- [ ] 환전 성공 시 성공 메시지 또는 모달 표시
- [ ] 환전 성공 시 지갑 잔액 자동으로 최신화
- [ ] 환전 성공 시 입력 필드 초기화
- [ ] 환전 실패 시 명확한 에러 메시지 표시
- [ ] 환전 성공 후 '내역 보기' 링크 제공

**Dependencies**: US-006

**API:**
```
POST /orders
```

**BDD Scenarios:**
- ✅ Scenario: 환전 성공
- ✅ Scenario: 환전 성공 후 잔액 자동 갱신
- ✅ Scenario: 잔액 부족으로 환전 실패
- ✅ Scenario: 서버 에러로 환전 실패

---

## Epic 3: 환전 내역

### US-008: 환전 내역 목록 조회

**As a** 로그인한 사용자  
**I want to** 환전 내역 페이지에서 내가 수행한 모든 환전 기록을 확인할 수 있다  
**So that** 과거 환전 내역을 추적하고 관리할 수 있다

**Acceptance Criteria:**
- [ ] 환전 내역 페이지(`/history`)에서 내역 목록 표시
- [ ] 환전 내역은 최신 순으로 정렬
- [ ] 각 내역에는 다음 정보 포함:
  - 환전 일시
  - 출발 통화 및 금액
  - 도착 통화 및 금액
  - 적용된 환율
  - 환전 상태 (성공/실패/대기 등)
- [ ] 페이지 로드 시 자동으로 내역 API 호출
- [ ] 내역이 없을 경우 "아직 환전 내역이 없습니다" 메시지 표시
- [ ] 로딩 중에는 스켈레톤 UI 표시
- [ ] API 에러 시 에러 메시지 및 재시도 버튼 표시

**Dependencies**: US-007

**API:**
```
GET /orders
```

**BDD Scenarios:**
- ✅ Scenario: 환전 내역 목록 정상 표시
- ✅ Scenario: 내역이 없을 때 안내 메시지 표시
- ✅ Scenario: 내역 조회 실패 시 에러 처리

---

### US-009: 환전 내역 페이지 네비게이션

**As a** 로그인한 사용자  
**I want to** 환전 페이지에서 '내역 보기' 버튼을 통해 내역 페이지로 이동할 수 있다  
**So that** 쉽게 내역을 확인할 수 있다

**Acceptance Criteria:**
- [ ] 환전 페이지에 '내역 보기' 또는 '내역' 버튼/링크 제공
- [ ] 클릭 시 환전 내역 페이지(`/history`)로 이동
- [ ] 환전 내역 페이지에서 '환전하기' 또는 '홈' 버튼으로 메인 페이지 복귀 가능
- [ ] 현재 페이지를 시각적으로 표시 (예: 네비게이션 바의 활성 상태)

**Dependencies**: US-008

**BDD Scenarios:**
- ✅ Scenario: 환전 페이지에서 내역 페이지로 이동
- ✅ Scenario: 내역 페이지에서 환전 페이지로 복귀

---

## Epic 4: 라우트 보호

### US-010: 미인증 사용자 리다이렉트

**As a** 로그인하지 않은 사용자  
**I want to** 보호된 페이지에 접근하려고 하면 자동으로 로그인 페이지로 리다이렉트된다  
**So that** 인증이 필요한 기능은 로그인 후에만 사용할 수 있다

**Acceptance Criteria:**
- [ ] 로그인하지 않은 상태에서 `/` (환전 페이지) 접근 시 `/login`으로 리다이렉트
- [ ] 로그인하지 않은 상태에서 `/history` 접근 시 `/login`으로 리다이렉트
- [ ] 리다이렉트 후 로그인하면 원래 접근하려던 페이지로 이동 (선택사항)
- [ ] 보호된 페이지 렌더링 전에 리다이렉트 처리 (깜빡임 방지)
- [ ] 로그인 상태인 경우 `/login` 접근 시 `/`로 리다이렉트

**Dependencies**: US-002

**Technical Notes:**
- Next.js Middleware 또는 HOC(Higher-Order Component) 사용
- `useAuth` hook으로 인증 상태 확인

**BDD Scenarios:**
- ✅ Scenario: 미인증 사용자가 환전 페이지 접근 시도
- ✅ Scenario: 미인증 사용자가 내역 페이지 접근 시도
- ✅ Scenario: 로그인 후 원래 페이지로 복귀 (선택)
- ✅ Scenario: 로그인 상태에서 로그인 페이지 접근 시도

---

## 📊 사용자 스토리 요약

| ID | User Story | Epic | Status |
|----|-----------|------|--------|
| US-001 | 이메일 로그인 | 인증 | ⏳ To Do |
| US-002 | JWT 토큰 관리 | 인증 | ⏳ To Do |
| US-003 | 로그아웃 | 인증 | ⏳ To Do |
| US-004 | 지갑 잔액 조회 | 환전 | ⏳ To Do |
| US-005 | 실시간 환율 조회 | 환전 | ⏳ To Do |
| US-006 | 환전 견적 조회 | 환전 | ⏳ To Do |
| US-007 | 환전 실행 | 환전 | ⏳ To Do |
| US-008 | 환전 내역 목록 조회 | 내역 | ⏳ To Do |
| US-009 | 내역 페이지 네비게이션 | 내역 | ⏳ To Do |
| US-010 | 미인증 사용자 리다이렉트 | 라우트 보호 | ⏳ To Do |

---

## 🔗 관련 문서

- [프로젝트 개요](./01-project-overview.md)
- [비기능 요구사항](./03-non-functional.md)
- [BDD Feature 파일](../../cypress/features/) (작성 예정)
- [Design 명세](../design/) (Design 단계에서 작성)

---

**작성일**: 2025-10-27  
**버전**: 1.0.0  
**상태**: ✅ 승인됨

