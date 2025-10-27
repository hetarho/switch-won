declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 로그인 커맨드 예제
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * 특정 텍스트를 가진 요소 찾기
       * @example cy.getByText('Submit')
       */
      getByText(text: string): Chainable<JQuery<HTMLElement>>;

      /**
       * data-testid로 요소 찾기
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
