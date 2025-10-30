import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('환전 페이지에 접속한다', () => {
  cy.visit('/', { timeout: 10000 });
  cy.get('[data-testid="wallet"]', { timeout: 10000 }).should('exist');
});

When('환전 내역 페이지로 이동한다', () => {
  cy.visit('/history', { timeout: 10000 });
  cy.get('[data-testid="order-list"]', { timeout: 10000 }).should('exist');
});

When('환전 페이지 URL로 직접 접근한다', () => {
  cy.visit('/', { timeout: 10000 });
  cy.wait(500);
});

When('환전 내역 페이지 URL로 직접 접근한다', () => {
  cy.visit('/history', { timeout: 10000 });
  cy.wait(500);
});

When('로그인 페이지 URL로 직접 접근한다', () => {
  cy.visit('/login', { timeout: 10000 });
  cy.wait(500);
});

When('브라우저 뒤로 가기를 한다', () => {
  cy.go('back');
  cy.wait(1000);
  cy.reload();
  cy.wait(1000);
});

When('{string} 버튼을 클릭한다', (buttonText: string) => {
  cy.get('button').contains(buttonText).click();
  
  if (buttonText === '로그아웃') {
    cy.wait(2000);
  }
});

When('{string} 링크를 클릭한다', (linkText: string) => {
  cy.contains(linkText).click();
});
Then('로그인 페이지로 이동한다', () => {
  cy.url().should('include', '/login');
});

Then('환전 페이지로 이동한다', () => {
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

Then('환전 내역 페이지에 있다', () => {
  cy.url().should('include', '/history');
});

Then('로그인 페이지로 리다이렉트된다', () => {
  cy.url().should('include', '/login');
});

Then('환전 페이지로 리다이렉트된다', () => {
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

Then('로그인 페이지에 그대로 있다', () => {
  cy.url().should('include', '/login');
});

Then('에러 메시지 {string}가 표시된다', (message: string) => {
  cy.contains(message).should('be.visible');
});

Then('성공 메시지 {string}가 표시된다', (message: string) => {
  cy.get('[data-sonner-toast][data-type="success"]', { timeout: 10000 })
    .should('be.visible')
    .and('contain', message);
});

Then('성공 메시지에 {string} 링크가 표시된다', (linkText: string) => {
  cy.contains(linkText).should('be.visible');
});

Then('로딩 인디케이터가 표시된다', () => {
  cy.get('[data-testid="loading-indicator"]').should('be.visible');
});
Then('{string} 버튼이 비활성화되어 있다', (buttonText: string) => {
  cy.contains('button', buttonText).should('be.disabled');
});

Then('{string} 버튼이 비활성화된다', (buttonText: string) => {
  cy.contains('button', buttonText).should('be.disabled');
});

Then('{string} 버튼이 표시된다', (buttonText: string) => {
  cy.contains('button', buttonText).should('be.visible');
});

When('{int}분이 지난다', (minutes: number) => {
  cy.clock();
  cy.tick(minutes * 60 * 1000);
});

Then('{string} API가 호출된다', (apiName: string) => {
  cy.wait(`@${apiName}`);
});

Then('{string} API가 다시 호출된다', (apiName: string) => {
  cy.wait(`@${apiName}`);
});

