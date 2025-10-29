'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { useWalletsQuery, Wallet } from '@/entities/wallet';
import { useExchangeRatesQuery, ExchangeRate } from '@/entities/exchange-rate';
import { useExchangeQuoteMutation } from '@/features/exchange-quote';
import { useCreateOrderMutation } from '@/features/create-order';
import { formatAmount } from '@/shared/utils/format/currency';

export function ExchangePage() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [isSelling, setIsSelling] = useState(true); // true: 매도, false: 매입

  // 매입/매도에 따른 통화 방향 결정
  // 매도: 선택한 통화 -> KRW
  // 매입: KRW -> 선택한 통화
  const toCurrency = isSelling ? 'KRW' : fromCurrency;
  const actualFromCurrency = isSelling ? fromCurrency : 'KRW';

  // 입력 필드 라벨 및 통화 표시용
  const inputCurrency = fromCurrency; // 항상 선택한 통화를 입력

  // 데이터 조회
  const { data: walletsData, isLoading: isWalletsLoading } = useWalletsQuery();
  const {
    data: ratesData,
    isLoading: isRatesLoading,
    error: ratesError,
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
  }, [walletsData?.totalKrwBalance, wallets, rates]);

  // 견적 조회 (디바운스 처리)
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      quoteMutation.mutate({
        fromCurrency: actualFromCurrency,
        toCurrency,
        forexAmount: parseFloat(amount),
      });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, actualFromCurrency, toCurrency]);

  // 환전 실행
  const handleExchange = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    // 환율 ID 찾기 (매입일 때는 선택한 통화의 환율을 사용)
    const rateCurrency = isSelling ? fromCurrency : fromCurrency;
    const rate = rates.find((r) => r.currency === rateCurrency);
    if (!rate) {
      alert('환율 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        exchangeRateId: rate.exchangeRateId,
        fromCurrency: actualFromCurrency,
        toCurrency,
        forexAmount: parseFloat(amount),
      });

      // 성공 후 초기화
      setAmount('');
      alert('환전이 완료되었습니다!');
    } catch (error) {
      console.error('환전 실패:', error);
    }
  };

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
            <Card className="border-border-primary border p-8 shadow-xl">
              {/* 통화 선택 */}
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="h-14 w-full [&>svg]:h-5 [&>svg]:w-5">
                  <SelectValue>
                    <div className="text-text-primary flex items-center gap-3">
                      <span className="text-2xl">
                        {fromCurrency === 'USD'
                          ? '🇺🇸'
                          : fromCurrency === 'JPY'
                            ? '🇯🇵'
                            : '🇰🇷'}
                      </span>
                      <span className="text-lg font-semibold">
                        {fromCurrency} 환전하기
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-surface-primary">
                  {rates.map((rate) => (
                    <SelectItem key={rate.currency} value={rate.currency} className="hover:bg-surface-secondary">
                      <div className="flex w-full items-center gap-3">
                        <span className="text-2xl">
                          {rate.currency === 'USD'
                            ? '🇺🇸'
                            : rate.currency === 'JPY'
                              ? '🇯🇵'
                              : '🇰🇷'}
                        </span>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{rate.currency}</div>
                          <div className="text-text-tertiary text-sm">
                            {rate.currency === 'USD'
                              ? '미국 달러'
                              : rate.currency === 'JPY'
                                ? '일본 엔'
                                : '대한민국 원'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatAmount(rate.rate)} 원
                          </div>
                          <div className="text-text-tertiary text-xs">
                            1 {rate.currency} 기준
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 매도/매입 토글 */}
              <div className="mt-6 flex gap-2">
                <Button
                  className={`h-12 flex-1 ${
                    isSelling ? 'bg-primary-500 hover:bg-primary-600' : ''
                  }`}
                  variant={isSelling ? 'default' : 'outline'}
                  onClick={() => setIsSelling(true)}
                >
                  매도
                </Button>
                <Button
                  variant={isSelling ? 'outline' : 'default'}
                  className={`h-12 flex-1 ${
                    !isSelling ? 'bg-primary-500 hover:bg-primary-600' : ''
                  }`}
                  onClick={() => setIsSelling(false)}
                >
                  매입
                </Button>
              </div>

              {/* 매도/매입 금액 */}
              <div className="mt-6">
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  {isSelling ? '매도 금액' : '매수 금액'}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="금액을 입력하세요"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 pr-24 text-right text-2xl font-semibold"
                  />
                  <div className="text-text-tertiary absolute top-1/2 right-4 -translate-y-1/2">
                    {inputCurrency} 입력
                  </div>
                </div>
              </div>

              {/* 환전 방향 */}
              <div className="my-6 flex justify-center">
                <div className="bg-surface-secondary flex h-10 w-10 items-center justify-center rounded-full">
                  <ArrowDown className="text-text-tertiary h-5 w-5" />
                </div>
              </div>

              {/* 환전 견적 */}
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  {isSelling ? '받을 원화' : '필요한 원화'}
                </label>
                <div className="bg-surface-secondary border-border-primary rounded-xl border p-4">
                  <div className="text-right">
                    {quoteMutation.isPending ? (
                      <Loader2 className="text-text-tertiary mx-auto h-6 w-6 animate-spin" />
                    ) : quoteMutation.data?.quote ? (
                      <>
                        <span className="text-primary-600 text-3xl font-bold">
                          {formatAmount(quoteMutation.data.quote.krwAmount)}
                        </span>
                        <span className="text-text-secondary ml-2 text-lg">
                          {isSelling ? '원 받으실거예요' : '원 필요해요'}
                        </span>
                      </>
                    ) : (
                      <span className="text-text-tertiary text-lg">
                        금액을 입력하세요
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 적용 환율 */}
              {quoteMutation.data?.quote && (
                <div className="text-text-secondary my-6 flex items-center justify-center gap-2">
                  <span className="text-sm">적용 환율</span>
                  <span className="text-text-primary font-semibold">
                    1 {inputCurrency} ={' '}
                    {formatAmount(quoteMutation.data.quote.appliedRate)} KRW
                  </span>
                </div>
              )}

              {/* 환전하기 버튼 */}
              <Button
                type="button"
                onClick={handleExchange}
                disabled={
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  createOrderMutation.isPending
                }
                className="bg-surface-invert text-text-invert h-14 w-full text-lg font-semibold shadow-xl hover:opacity-90 disabled:opacity-50"
                data-testid="exchange-button"
              >
                {createOrderMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  '환전하기'
                )}
              </Button>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
