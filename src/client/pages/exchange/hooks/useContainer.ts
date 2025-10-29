import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useWalletsQuery } from '@/entities/wallet';
import { useExchangeRatesQuery } from '@/entities/exchange-rate';
import { useExchangeQuoteMutation } from '@/features/exchange-quote';
import { useCreateOrderMutation } from '@/features/create-order';

export function useExchangePageContainer() {
  // 데이터 조회
  const { data: walletsData, isLoading: isWalletsLoading } = useWalletsQuery();
  const {
    data: ratesData,
    isLoading: isRatesLoading,
    error: ratesError,
    refetch: refetchRates,
  } = useExchangeRatesQuery();

  // 환전 관련 hooks
  const quoteMutation = useExchangeQuoteMutation();
  const createOrderMutation = useCreateOrderMutation();

  const wallets = useMemo(() => walletsData?.wallets || [], [walletsData]);
  const rates = useMemo(() => ratesData?.rates || [], [ratesData]);
  const usdRate = useMemo(
    () => rates.find((r) => r.currency === 'USD'),
    [rates]
  );
  const jpyRate = useMemo(
    () => rates.find((r) => r.currency === 'JPY'),
    [rates]
  );

  const quote = useMemo(
    () => (quoteMutation.data?.quote ? quoteMutation.data.quote : null),
    [quoteMutation.data]
  );

  // 총 보유 자산 계산 (KRW 기준)
  const calculateTotalAssets = useMemo(() => {
    if (walletsData?.totalKrwBalance !== undefined) {
      return walletsData.totalKrwBalance;
    }

    // fallback: 직접 계산
    let total = 0;
    wallets?.forEach((wallet) => {
      const balance = wallet.balance;
      if (wallet.currency === 'KRW') {
        total += balance;
      } else {
        const rate = rates.find((r) => r.currency === wallet.currency);
        if (rate) {
          total += balance * rate.rate;
        }
      }
    });
    return total;
  }, [walletsData, wallets, rates]);

  // 견적 조회 핸들러
  const handleQuoteRequest = useCallback(
    (params: {
      fromCurrency: string;
      toCurrency: string;
      forexAmount: number;
    }) => {
      quoteMutation.mutate(params);
    },
    [quoteMutation]
  );

  // 견적 초기화 핸들러
  const handleQuoteReset = useCallback(() => {
    quoteMutation.reset();
  }, [quoteMutation]);

  // 환전 실행 핸들러 (환율 ID 불일치 시 자동 재시도)
  const handleExchange = useCallback(
    async (params: {
      exchangeRateId: number;
      fromCurrency: string;
      toCurrency: string;
      forexAmount: number;
    }) => {
      const maxRetries = 1; // 최대 1회 재시도
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          await createOrderMutation.mutateAsync(params);
          return; // 성공 시 종료
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          // 환율 ID 불일치 에러인지 확인
          const isRateMismatch =
            errorMessage.includes('환율 ID가 일치하지 않습니다') ||
            errorMessage.includes('요청한 환율 ID와 최신 환율 ID가 일치하지 않습니다');

          // 재시도 가능 여부 확인
          if (isRateMismatch && attempt < maxRetries) {
            attempt++;
            
            // 환율 갱신 중임을 사용자에게 알림
            toast.info('환율이 변경되었습니다. 최신 환율로 다시 시도합니다...');
            
            // 환율 갱신
            const refetchResult = await refetchRates();
            
            if (refetchResult?.data?.rates) {
              // 새로운 환율 ID 찾기
              const newRate = refetchResult.data.rates.find(
                (r: { currency: string }) =>
                  r.currency === (params.fromCurrency === 'KRW' ? params.toCurrency : params.fromCurrency)
              );

              if (newRate) {
                // 새로운 환율 ID로 재시도
                params.exchangeRateId = newRate.exchangeRateId;
                continue;
              }
            }
          }

          // 재시도 불가능하거나 다른 에러인 경우 throw
          throw error;
        }
      }
    },
    [createOrderMutation, refetchRates]
  );

  return {
    // 데이터
    wallets,
    rates,
    usdRate,
    jpyRate,
    quote,
    calculateTotalAssets,
    
    // 로딩 상태
    isWalletsLoading,
    isRatesLoading,
    
    // 에러
    ratesError,
    
    // 핸들러
    handleQuoteRequest,
    handleQuoteReset,
    handleExchange,
    
    // Mutation 상태
    isExchanging: createOrderMutation.isPending,
  };
}