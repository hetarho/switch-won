import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const mockExchangeRates = [
  {
    exchangeRateId: 1,
    currency: 'USD',
    rate: 1300.0,
    changePercentage: 0.5,
    applyDateTime: new Date().toISOString()
  },
  {
    exchangeRateId: 2,
    currency: 'JPY',
    rate: 900.0,
    changePercentage: -0.3,
    applyDateTime: new Date().toISOString()
  }
];

beforeEach(() => {
  cy.intercept('GET', '**/api/exchange-rates', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '환율 조회 성공',
      data: mockExchangeRates
    }
  }).as('getExchangeRates');
});

Then('환율 정보가 표시된다', () => {
  cy.get('[data-testid="exchange-rate"]').should('be.visible');
});

Then('USD/KRW 환율이 표시된다', () => {
  cy.contains('USD/KRW').should('be.visible');
});

Then('환율 업데이트 시간이 표시된다', () => {
  cy.get('[data-testid="exchange-rate-updated-time"]').should('be.visible');
});

Then('환율 로딩 스켈레톤 UI가 표시된다', () => {
  cy.get('[data-testid="exchange-rate-skeleton"]').should('be.visible');
});

Then('환율이 로드되면 스켈레톤이 사라진다', () => {
  cy.wait('@getExchangeRates');
  cy.get('[data-testid="exchange-rate-skeleton"]').should('not.exist');
});

Given('현재 환율이 {string}이다', (rate: string) => {
  const rateValue = parseFloat(rate.replace(',', ''));
  cy.intercept('GET', '**/api/exchange-rates', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '환율 조회 성공',
      data: [{
        exchangeRateId: 1,
        currency: 'USD',
        rate: rateValue,
        changePercentage: 0.5,
        applyDateTime: new Date().toISOString()
      }]
    }
  }).as('getExchangeRates');
});

When('환율이 {string}으로 변경된다', (newRate: string) => {
  const rateValue = parseFloat(newRate.replace(',', ''));
  cy.intercept('GET', '**/api/exchange-rates', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '환율 조회 성공',
      data: [{
        exchangeRateId: 1,
        currency: 'USD',
        rate: rateValue,
        changePercentage: 0.5,
        applyDateTime: new Date().toISOString()
      }]
    }
  }).as('getExchangeRates');
  
  cy.wait(1000);
});

Then('환율 API가 다시 호출된다', () => {
  cy.wait('@getExchangeRates');
});

Then('새로운 환율이 표시된다', () => {
  cy.get('[data-testid="exchange-rate"]').should('be.visible');
});

Then('환율 정보가 정상적으로 표시된다', () => {
  cy.wait('@getExchangeRates');
  cy.get('[data-testid="exchange-rate"]').should('be.visible');
});

Then('환율 변동률이 퍼센트로 표시된다', () => {
  cy.get('[data-testid="exchange-rate"]').contains(/%/).should('be.visible');
});

Then('변동률이 양수일 때 상승 아이콘이 표시된다', () => {
  cy.get('[data-testid="exchange-rate"]').find('svg').should('be.visible');
});

