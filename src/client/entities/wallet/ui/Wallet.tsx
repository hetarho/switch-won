import { Card, formatAmount, Skeleton } from '@/shared';

type Currency = {
  currency: string;
  balance: number;
  priceDifference?: number;
  priceDifferencePercent?: number;
};

type WalletProps = {
  currencies: Currency[];
  totalKrwBalance: number;
  isLoading: boolean;
};

export function Wallet({
  currencies,
  totalKrwBalance,
  isLoading,
}: WalletProps) {

  return (
    <div>
      <h3 className="text-text-primary mt-8 mb-4 text-xl font-semibold">
        내 지갑
      </h3>
      <Card className="border-border-primary mb-4 border p-6">
        <div className="space-y-3">
          {isLoading ? (
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-24" />
              </div>
            </>
          ) : (
            currencies.map(({ balance, currency, priceDifference, priceDifferencePercent }) => {
              const hasPriceData = priceDifference !== undefined && priceDifferencePercent !== undefined;
              const isProfit = hasPriceData && priceDifference! > 0;
              
              return (
                <div key={currency} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">{currency}</span>
                    <span className="text-text-primary text-lg font-semibold">
                      {currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : '₩'}{' '}
                      {formatAmount(balance)}
                    </span>
                  </div>
                  {hasPriceData && (
                    <div className="flex items-center justify-end">
                      <span
                        className={`text-xs ${
                          isProfit ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isProfit ? '↑' : '↓'} {priceDifference} 원
                        ({isProfit ? '+' : ''}
                        {priceDifferencePercent}%)
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
      <div className="bg-surface-invert border-border-primary rounded-xl border p-6 shadow-lg">
        <p className="text-text-invert text-sm opacity-80">총 보유 자산</p>
        {isLoading ? (
          <Skeleton className="mt-2 h-10 w-48 bg-surface-primary/50" />
        ) : (
          <p className="text-text-invert mt-2 text-3xl font-bold">
            ₩ {formatAmount(totalKrwBalance)}
          </p>
        )}
      </div>
    </div>
  );
}
