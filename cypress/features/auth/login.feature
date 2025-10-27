# language: ko
Feature: 사용자 로그인
  사용자가 이메일 주소로 간편하게 로그인할 수 있다
  
  Background:
    Given 로그인 페이지에 접속한다

  Scenario: 유효한 이메일로 로그인 성공
    When 이메일 "user@example.com"을 입력한다
    And "시작하기" 버튼을 클릭한다
    Then 환전 페이지로 이동한다
    And JWT 토큰이 저장되어 있어야 한다

  Scenario: 유효하지 않은 이메일 형식으로 로그인 시도
    When 이메일 "invalid-email"을 입력한다
    And "시작하기" 버튼을 클릭한다
    Then 에러 메시지 "유효한 이메일 주소를 입력해주세요"가 표시된다
    And 로그인 페이지에 그대로 있다

  Scenario: 빈 이메일로 로그인 시도
    When "시작하기" 버튼을 클릭한다
    Then "시작하기" 버튼이 비활성화되어 있다

  Scenario: 서버 에러로 로그인 실패
    Given 서버가 에러를 반환하도록 설정한다
    When 이메일 "user@example.com"을 입력한다
    And "시작하기" 버튼을 클릭한다
    Then 에러 메시지 "일시적인 오류가 발생했습니다"가 표시된다
    And 로그인 페이지에 그대로 있다

  Scenario: 로딩 상태 확인
    When 이메일 "user@example.com"을 입력한다
    And "시작하기" 버튼을 클릭한다
    Then 로딩 인디케이터가 표시된다
    And "시작하기" 버튼이 비활성화된다

