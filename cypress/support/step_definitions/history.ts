import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const mockOrders = [
  {
    orderId: 1,
    fromCurrency: 'KRW',
    fromAmount: 100000,
    toCurrency: 'USD',
    toAmount: 76.92,
    appliedRate: 1300,
    orderedAt: new Date().toISOString()
  },
  {
    orderId: 2,
    fromCurrency: 'USD',
    fromAmount: 50,
    toCurrency: 'KRW',
    toAmount: 65000,
    appliedRate: 1300,
    orderedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    orderId: 3,
    fromCurrency: 'KRW',
    fromAmount: 200000,
    toCurrency: 'USD',
    toAmount: 153.84,
    appliedRate: 1300,
    orderedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

Given('환전 내역이 {int}건 있다', (count: number) => {
  const orders = mockOrders.slice(0, count);
  cy.intercept('GET', '**/api/orders', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '환전 내역 조회 성공',
      data: {
        orders: orders
      }
    }
  }).as('getOrders');
});

Given('환전 내역이 있다', () => {
  cy.intercept('GET', '**/api/orders', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '환전 내역 조회 성공',
      data: {
        orders: mockOrders
      }
    }
  }).as('getOrders');
});

Given('환전 내역이 없다', () => {
  cy.intercept('GET', '**/api/orders', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '환전 내역 조회 성공',
      data: {
        orders: []
      }
    }
  }).as('getOrders');
});

Then('환전 내역 목록이 표시된다', () => {
  cy.get('[data-testid="order-list"]', { timeout: 10000 }).should('be.visible');
});

Then('{int}개의 내역이 표시된다', (count: number) => {
  cy.get('[data-testid="order-item"]').should('have.length', count);
});

Then('내역은 최신 순으로 정렬되어 있다', () => {
  cy.get('[data-testid="order-item"]').first().should('be.visible');
});

Then('{string} 메시지가 표시된다', (message: string) => {
  cy.contains(message).should('be.visible');
});

Then('각 내역에 환전 일시가 표시된다', () => {
  cy.get('[data-testid="order-date"]').should('exist');
});

Then('각 내역에 출발 통화 및 금액이 표시된다', () => {
  cy.get('[data-testid="source-amount"]').should('exist');
});

Then('각 내역에 도착 통화 및 금액이 표시된다', () => {
  cy.get('[data-testid="target-amount"]').should('exist');
});

Then('각 내역에 적용된 환율이 표시된다', () => {
  cy.get('[data-testid="order-rate"]').should('exist');
});

Then('내역 로딩 스켈레톤 UI가 표시된다', () => {
  cy.get('[data-testid="order-skeleton"]').should('be.visible');
});

Then('내역이 로드되면 스켈레톤이 사라진다', () => {
  cy.get('[data-testid="order-skeleton"]', { timeout: 10000 }).should('not.exist');
});

Then('환전 내역이 정상적으로 표시된다', () => {
  cy.get('[data-testid="order-list"]', { timeout: 10000 }).should('be.visible');
});

Then('KRW 금액은 {string} 형식으로 표시된다', (format: string) => {
  cy.contains(/₩[\d,]+/).should('be.visible');
});

Then('USD 금액은 {string} 형식으로 표시된다', (format: string) => {
  cy.contains(/\$[\d,.]+/).should('be.visible');
});

Then('환전 일시가 {string} 형식으로 표시된다', (format: string) => {
  cy.get('[data-testid="order-date"]').first().should('be.visible');
  cy.get('[data-testid="order-date"]').first().invoke('text').should('match', /\d{4}년\s*\d{1,2}월\s*\d{1,2}일/);
});

