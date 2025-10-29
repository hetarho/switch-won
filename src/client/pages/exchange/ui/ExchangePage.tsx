'use client';

import { ExchangeRate } from '@/entities/exchange-rate';
import { Wallet } from '@/entities/wallet';
import { ExchangeOrderForm } from '@/entities/exchange-order';
import { useExchangePageContainer } from '../hooks/useContainer';

export function ExchangePage() {
  const {
    wallets,
    rates,
    usdRate,
    jpyRate,
    quote,
    calculateTotalAssets,
    isWalletsLoading,
    isRatesLoading,
    ratesError,
    handleQuoteRequest,
    handleQuoteReset,
    handleExchange,
    isExchanging,
  } = useExchangePageContainer();

  return (
    <div className="bg-surface-secondary min-h-screen p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          {/* 좌측: 환율 정보 */}
          <aside>
            {/* 환율 정보 */}
            <ExchangeRate
              usdRate={usdRate}
              jpyRate={jpyRate}
              isLoading={isRatesLoading}
              error={ratesError}
            />

            {/* 내 지갑 */}
            <Wallet
              isLoading={isWalletsLoading}
              currencies={wallets}
              totalKrwBalance={calculateTotalAssets}
            />
          </aside>

          {/* 우측: 환전 폼 */}
          <main>
            <ExchangeOrderForm
              rates={rates}
              quote={quote}
              onQuoteRequest={handleQuoteRequest}
              onQuoteReset={handleQuoteReset}
              onExchange={handleExchange}
              isExchanging={isExchanging}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
