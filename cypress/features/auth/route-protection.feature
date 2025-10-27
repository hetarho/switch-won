# language: ko
Feature: 라우트 보호
  인증되지 않은 사용자는 보호된 페이지에 접근할 수 없다

  Scenario: 미인증 사용자가 환전 페이지 접근 시도
    Given 로그인하지 않은 상태다
    When 환전 페이지 URL로 직접 접근한다
    Then 로그인 페이지로 리다이렉트된다

  Scenario: 미인증 사용자가 환전 내역 페이지 접근 시도
    Given 로그인하지 않은 상태다
    When 환전 내역 페이지 URL로 직접 접근한다
    Then 로그인 페이지로 리다이렉트된다

  Scenario: 로그인 후 원래 접근하려던 페이지로 이동
    Given 로그인하지 않은 상태다
    When 환전 내역 페이지 URL로 직접 접근한다
    Then 로그인 페이지로 리다이렉트된다
    When 이메일 "user@example.com"을 입력한다
    And "시작하기" 버튼을 클릭한다
    Then 환전 내역 페이지로 이동한다

  Scenario: 로그인한 사용자가 로그인 페이지 접근 시도
    Given 사용자가 로그인되어 있다
    When 로그인 페이지 URL로 직접 접근한다
    Then 환전 페이지로 리다이렉트된다

  Scenario: 토큰 만료 시 자동 로그아웃
    Given 사용자가 로그인되어 있다
    And 환전 페이지에 접속한다
    When JWT 토큰이 만료된다
    And API를 호출한다
    Then 로그인 페이지로 리다이렉트된다
    And JWT 토큰이 삭제되어 있어야 한다

  Scenario: 유효하지 않은 토큰으로 페이지 로드
    Given 유효하지 않은 JWT 토큰이 저장되어 있다
    When 환전 페이지 URL로 직접 접근한다
    Then 로그인 페이지로 리다이렉트된다

