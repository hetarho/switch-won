import { Card } from '@/shared';
import { ExchangeRateCard } from './ExchangeRateCard';
import { ExchangeRateCardSkeleton } from './ExchangeRateCardSkeleton';

type ExchangeRate = {
  exchangeRateId: number;
  currency: string;
  rate: number;
  changePercentage: number;
  applyDateTime: string;
};

type ExchangeRateProps = {
  usdRate?: ExchangeRate;
  jpyRate?: ExchangeRate;
  isLoading: boolean;
  error: Error | null;
};

export function ExchangeRate({
  usdRate,
  jpyRate,
  isLoading,
  error,
}: ExchangeRateProps) {
  return (
    <div>
      <h2 className="text-text-primary mb-6 text-2xl font-bold">환율 정보</h2>

      {/* USD 환율 카드 */}
      {isLoading ? (
        <ExchangeRateCardSkeleton />
      ) : (
        usdRate && (
          <ExchangeRateCard
            currencyName="미국 달러"
            currency="USD"
            rate={usdRate.rate}
            changePercentage={usdRate.changePercentage}
            updatedAt={usdRate.applyDateTime}
          />
        )
      )}

      {/* JPY 환율 카드 */}
      {isLoading ? (
        <ExchangeRateCardSkeleton />
      ) : (
        jpyRate && (
          <ExchangeRateCard
            currencyName="일본 엔"
            currency="JPY"
            rate={jpyRate.rate}
            changePercentage={jpyRate.changePercentage}
            updatedAt={jpyRate.applyDateTime}
          />
        )
      )}

      {/* 에러 상태 */}
      {error && (
        <Card className="mb-4 border border-red-500 bg-red-50 p-6 dark:bg-red-900/20">
          <p className="text-sm text-red-600">
            환율 정보를 불러올 수 없습니다: {error.message}
          </p>
        </Card>
      )}

      {/* 데이터 없음 */}
      {!isLoading && !error && !usdRate && !jpyRate && (
        <Card className="border-border-primary mb-4 border p-6">
          <p className="text-text-tertiary text-sm">환율 정보가 없습니다.</p>
        </Card>
      )}
    </div>
  );
}
