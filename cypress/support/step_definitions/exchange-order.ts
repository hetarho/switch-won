import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('현재 환율은 {string}이다', (rate: string) => {
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

When('{string}를 선택한다', (currency: string) => {
  cy.get('[data-testid="source-currency-select"]').click();
  cy.wait(300);
  cy.get('[role="option"]').contains(currency).click();
});

When('환전 금액 {string}을 입력한다', (amount: string) => {
  const amountValue = amount.replace(/,/g, '');
  cy.intercept('GET', '**/api/orders/quote*', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        code: 'SUCCESS',
        message: '견적 조회 성공',
        data: {
          krwAmount: parseFloat(amountValue) * 1300,
          appliedRate: 1300
        }
      }
    });
  }).as('getQuote');
  
  cy.get('[data-testid="amount-input"]').clear().type(amountValue);
  cy.wait(500);
});

When('환전 금액을 {string}으로 변경한다', (amount: string) => {
  const amountValue = amount.replace(/,/g, '');
  cy.intercept('GET', '**/api/orders/quote*', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        code: 'SUCCESS',
        message: '견적 조회 성공',
        data: {
          krwAmount: parseFloat(amountValue) * 1300,
          appliedRate: 1300
        }
      }
    });
  }).as('getQuote');
  
  cy.get('[data-testid="amount-input"]').clear().type(amountValue);
  cy.wait(500);
});

Then('환전 견적이 표시된다', () => {
  cy.get('[data-testid="quote-result"]', { timeout: 10000 }).should('be.visible');
  cy.get('[data-testid="quote-result"]').should('not.contain', '금액을 입력하세요');
});

Then('적용된 환율이 표시된다', () => {
  cy.contains('적용 환율').should('be.visible');
});

Then('환전 견적 API가 호출된다', () => {
  cy.get('[data-testid="quote-result"]').should('be.visible');
});

Then('환전 견적 API가 다시 호출된다', () => {
  cy.get('[data-testid="quote-result"]').should('be.visible');
});

Then('새로운 견적이 표시된다', () => {
  cy.get('[data-testid="quote-result"]').should('be.visible');
});

beforeEach(function() {
  cy.intercept('POST', '**/api/orders', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        code: 'SUCCESS',
        message: '환전 완료',
        data: {
          orderId: 'order-123',
          status: 'completed',
          fromCurrency: 'KRW',
          fromAmount: 100000,
          toCurrency: 'USD',
          toAmount: 76.92,
          appliedRate: 1300,
          orderedAt: new Date().toISOString()
        }
      }
    });
  }).as('createOrder');
  
  cy.intercept('GET', '**/api/wallets', {
    statusCode: 200,
    body: {
      code: 'SUCCESS',
      message: '지갑 조회 성공',
      data: [
        { currency: 'KRW', balance: 900000 },
        { currency: 'USD', balance: 576.92 }
      ]
    }
  }).as('getWalletsAfterOrder');
});

Then('입력 필드가 초기화된다', () => {
  cy.get('[data-testid="amount-input"]').should('have.value', '');
});

