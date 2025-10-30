Feature: 지갑 잔액 조회
  로그인한 사용자가 자신의 지갑 잔액을 확인할 수 있다

  Background:
    Given 사용자가 로그인되어 있다

  Scenario: 환전 페이지 로드 시 지갑 잔액 표시
    When 환전 페이지에 접속한다
    Then 지갑 잔액이 표시된다

  Scenario: 여러 통화 잔액 표시
    Given 지갑에 여러 통화가 있다
    When 환전 페이지에 접속한다
    Then 모든 통화의 잔액이 표시된다

