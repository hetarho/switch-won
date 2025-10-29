import { Card, formatAmount } from '@/shared';
import { TrendingUp, TrendingDown } from 'lucide-react';

type ExchangeRateCardProps = {
  currencyName: string;
  currency: string;
  rate: number;
  changePercentage: number;
};

export function ExchangeRateCard({
  currencyName,
  currency,
  rate,
  changePercentage,
}: ExchangeRateCardProps) {
  return (
    <Card className="border-border-primary mb-4 border p-6 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm">{currencyName}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-text-primary text-3xl font-bold">
              {formatAmount(rate)}
            </span>
            <span className="text-text-secondary text-lg">원</span>
          </div>
          <p className="text-text-tertiary mt-1 text-xs">1 {currency} 기준</p>
        </div>

        <div className="flex flex-col items-end">
          <div
            className={`mt-2 flex items-center gap-1 rounded-md px-2 py-1 ${
              changePercentage >= 0
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}
          >
            {changePercentage >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {changePercentage >= 0 ? '+' : ''}
              {changePercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

