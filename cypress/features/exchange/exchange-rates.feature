# language: ko
Feature: 실시간 환율 조회
  로그인한 사용자가 실시간 환율 정보를 확인할 수 있다

  Background:
    Given 사용자가 로그인되어 있다

  Scenario: 환전 페이지 로드 시 환율 정보 표시
    When 환전 페이지에 접속한다
    Then 환율 정보가 표시된다
    And USD/KRW 환율이 표시된다
    And 환율 업데이트 시간이 표시된다

  Scenario: 환율 정보 로딩 상태
    When 환전 페이지에 접속한다
    Then 환율 로딩 스켈레톤 UI가 표시된다
    And 환율이 로드되면 스켈레톤이 사라진다

  Scenario: 1분마다 환율 자동 갱신
    Given 환전 페이지에 접속한다
    And 현재 환율이 "1,300.00"이다
    When 1분이 지난다
    Then 환율 API가 다시 호출된다
    And 새로운 환율이 표시된다

  Scenario: 환율 변동 시각적 피드백
    Given 환전 페이지에 접속한다
    And 현재 환율이 "1,300.00"이다
    When 환율이 "1,305.00"으로 변경된다
    Then 환율 영역에 깜빡임 효과가 표시된다

  Scenario: 환율 조회 실패
    Given 환율 API가 에러를 반환하도록 설정한다
    When 환전 페이지에 접속한다
    Then 에러 메시지 "환율 정보를 불러올 수 없습니다"가 표시된다
    And "재시도" 버튼이 표시된다

  Scenario: 환율 재시도
    Given 환율 API가 에러를 반환하도록 설정한다
    And 환전 페이지에 접속한다
    When "재시도" 버튼을 클릭한다
    Then 환율 정보가 정상적으로 표시된다

  Scenario: 매수율과 매도율 표시
    When 환전 페이지에 접속한다
    Then 매수율이 표시된다
    And 매도율이 표시된다
    And 매수율과 매도율이 구분되어 표시된다

