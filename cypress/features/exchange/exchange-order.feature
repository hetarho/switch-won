Feature: 환전 견적 및 실행
  로그인한 사용자가 환전 견적을 확인하고 환전을 실행할 수 있다

  Background:
    Given 사용자가 로그인되어 있다
    And 지갑에 KRW "1,000,000"이 있다
    And 현재 환율은 "1,300.00"이다
    And 환전 페이지에 접속한다

  Scenario: 환전 견적 조회
    When "USD"를 선택한다
    And "매도" 버튼을 클릭한다
    And 환전 금액 "100"을 입력한다
    Then 환전 견적이 표시된다
    And 적용된 환율이 표시된다

  Scenario: 환전 금액 입력 시 실시간 견적 업데이트
    When "USD"를 선택한다
    And "매도" 버튼을 클릭한다
    And 환전 금액 "100"을 입력한다
    Then 환전 견적 API가 호출된다
    When 환전 금액을 "200"으로 변경한다
    Then 환전 견적 API가 다시 호출된다
    And 새로운 견적이 표시된다

  Scenario: 환전 실행
    Given "USD"를 선택한다
    And "매도" 버튼을 클릭한다
    And 환전 금액 "100"을 입력한다
    When "환전하기" 버튼을 클릭한다

  Scenario: 통화 선택 변경
    When "USD"를 선택한다
    And "매입" 버튼을 클릭한다
    And 환전 금액 "100"을 입력한다
    Then 환전 견적이 표시된다

