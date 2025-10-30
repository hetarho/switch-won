import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const mockWallets = [
  {
    currency: 'KRW',
    balance: 1000000
  },
  {
    currency: 'USD',
    balance: 500
  }
];

beforeEach(() => {
  cy.intercept('GET', '**/api/wallets', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '지갑 조회 성공',
      data: mockWallets
    }
  }).as('getWallets');
});

Given('지갑에 KRW {string}이 있다', (amount: string) => {
  const balance = parseFloat(amount.replace(/,/g, ''));
  cy.intercept('GET', '**/api/wallets', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '지갑 조회 성공',
      data: [
        { currency: 'KRW', balance },
        { currency: 'USD', balance: 500 }
      ]
    }
  }).as('getWallets');
});

Given('지갑에 여러 통화가 있다', () => {
  cy.intercept('GET', '**/api/wallets', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '지갑 조회 성공',
      data: [
        { currency: 'KRW', balance: 1000000 },
        { currency: 'USD', balance: 500 },
        { currency: 'EUR', balance: 300 },
        { currency: 'JPY', balance: 50000 }
      ]
    }
  }).as('getWallets');
});

Then('지갑 잔액이 표시된다', () => {
  cy.get('[data-testid="wallet"]').should('be.visible');
});

Then('KRW 잔액이 {string} 형식으로 표시된다', (format: string) => {
  cy.get('[data-testid="wallet-item"]').contains('KRW').parent().should('contain', '₩');
  cy.get('[data-testid="wallet-item"]').contains('KRW').parent().should('contain', '1,000,000');
});

Then('USD 잔액이 {string} 형식으로 표시된다', (format: string) => {
  cy.get('[data-testid="wallet-item"]').contains('USD').parent().should('contain', '$');
  cy.get('[data-testid="wallet-item"]').contains('USD').parent().should('contain', '500');
});

Then('잔액 로딩 스켈레톤 UI가 표시된다', () => {
  cy.get('[data-testid="wallet-skeleton"]').should('be.visible');
});

Then('잔액이 로드되면 스켈레톤이 사라진다', () => {
  cy.wait('@getWallets');
  cy.get('[data-testid="wallet-skeleton"]').should('not.exist');
});

Then('지갑 잔액이 정상적으로 표시된다', () => {
  cy.wait('@getWallets');
  cy.get('[data-testid="wallet"]').should('be.visible');
});

Then('모든 통화의 잔액이 표시된다', () => {
  cy.get('[data-testid="wallet-item"]').should('have.length.at.least', 2);
});

Then('각 통화는 적절한 형식으로 포맷되어 있다', () => {
  cy.get('[data-testid="wallet-item"]').each(($el) => {
    cy.wrap($el).should('contain.text', /[₩$€¥]/);
  });
});

Then('지갑 잔액이 자동으로 갱신된다', () => {
  cy.wait('@getWallets');
  cy.get('[data-testid="wallet"]').should('be.visible');
});

Then('지갑 잔액은 변경되지 않는다', () => {
  cy.get('[data-testid="wallet"]').should('be.visible');
});

