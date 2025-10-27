# language: ko
Feature: 지갑 잔액 조회
  로그인한 사용자가 자신의 지갑 잔액을 확인할 수 있다

  Background:
    Given 사용자가 로그인되어 있다

  Scenario: 환전 페이지 로드 시 지갑 잔액 표시
    When 환전 페이지에 접속한다
    Then 지갑 잔액이 표시된다
    And KRW 잔액이 "₩1,000,000" 형식으로 표시된다
    And USD 잔액이 "$500.00" 형식으로 표시된다

  Scenario: 지갑 잔액 로딩 상태
    When 환전 페이지에 접속한다
    Then 잔액 로딩 스켈레톤 UI가 표시된다
    And 잔액이 로드되면 스켈레톤이 사라진다

  Scenario: 지갑 잔액 조회 실패
    Given 지갑 API가 에러를 반환하도록 설정한다
    When 환전 페이지에 접속한다
    Then 에러 메시지 "지갑 정보를 불러올 수 없습니다"가 표시된다
    And "재시도" 버튼이 표시된다

  Scenario: 지갑 잔액 재시도
    Given 지갑 API가 에러를 반환하도록 설정한다
    And 환전 페이지에 접속한다
    When "재시도" 버튼을 클릭한다
    Then 지갑 잔액이 정상적으로 표시된다

  Scenario: 여러 통화 잔액 표시
    Given 지갑에 여러 통화가 있다
    When 환전 페이지에 접속한다
    Then 모든 통화의 잔액이 표시된다
    And 각 통화는 적절한 형식으로 포맷되어 있다

