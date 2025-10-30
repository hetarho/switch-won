import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

function setupAuthenticatedAPIs() {
  cy.intercept('GET', '**/api/wallets', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '지갑 조회 성공',
      data: [
        { currency: 'KRW', balance: 1000000 },
        { currency: 'USD', balance: 500 },
        { currency: 'JPY', balance: 50000 }
      ]
    }
  }).as('getWallets');

  cy.intercept('GET', '**/api/exchange-rates', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '환율 조회 성공',
      data: [
        {
          exchangeRateId: 1,
          currency: 'USD',
          rate: 1300.00,
          changePercentage: 0.5,
          applyDateTime: new Date().toISOString()
        },
        {
          exchangeRateId: 2,
          currency: 'JPY',
          rate: 900.00,
          changePercentage: -0.3,
          applyDateTime: new Date().toISOString()
        }
      ]
    }
  }).as('getExchangeRates');

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
}

Given('사용자가 로그인되어 있다', () => {
  cy.intercept('POST', '**/auth/login?email=*', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '로그인 성공',
      data: {
        memberId: 1,
        token: 'mock-jwt-token'
      }
    }
  }).as('loginAPI');

  cy.getCookie('auth-token').then((cookie) => {
    if (!cookie) {
      cy.visit('/login', { timeout: 10000 });
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button').contains('로그인').click();
      cy.wait(1000);
    }
  });
  
  setupAuthenticatedAPIs();
});

Given('로그인하지 않은 상태다', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

Given('유효하지 않은 JWT 토큰이 저장되어 있다', () => {
  cy.setCookie('auth-token', 'invalid-token');
});

When('이메일 {string}을 입력한다', (email: string) => {
  cy.get('input[type="email"]').clear().type(email);
});

Then('JWT 토큰이 저장되어 있어야 한다', () => {
  cy.getCookie('auth-token').should('exist');
});

Then('JWT 토큰이 삭제되어 있어야 한다', () => {
  cy.getCookie('auth-token').should('not.exist');
});

Given('JWT 토큰이 만료된다', () => {
  cy.setCookie('auth-token', 'expired-token');
  
  cy.intercept('GET', '**/api/**', {
    statusCode: 401,
    body: { code: 'UNAUTHORIZED', message: 'Token expired' }
  }).as('expiredToken');
});

When('API를 호출한다', () => {
  cy.reload();
  cy.wait(500);
});

Given('로그인 페이지에 접속한다', () => {
  cy.intercept('POST', '**/auth/login?email=*', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '로그인 성공',
      data: {
        memberId: 1,
        token: 'mock-jwt-token'
      }
    }
  }).as('loginAPI');
  
  cy.visit('/login');
});

