Feature: 사용자 로그아웃
  로그인한 사용자가 로그아웃할 수 있다

  Background:
    Given 사용자가 로그인되어 있다

  Scenario: 로그아웃 성공
    Given 환전 페이지에 접속한다
    When "로그아웃" 버튼을 클릭한다
    Then 로그인 페이지로 이동한다
    And JWT 토큰이 삭제되어 있어야 한다

  Scenario: 로그아웃 후 보호된 페이지 접근 불가
    Given 환전 페이지에 접속한다
    When "로그아웃" 버튼을 클릭한다
    And 브라우저 뒤로 가기를 한다
    Then 로그인 페이지로 리다이렉트된다

  Scenario: 환전 내역 페이지에서 로그아웃
    When 환전 내역 페이지로 이동한다
    And "로그아웃" 버튼을 클릭한다
    Then 로그인 페이지로 이동한다
    And JWT 토큰이 삭제되어 있어야 한다

