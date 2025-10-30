'use client';

import { useState, useMemo, useCallback, ChangeEvent } from 'react';
import { ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
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
import { formatAmount } from '@/shared/utils/format/currency';
import { validateAmount } from '@/shared/utils';

type ExchangeRate = {
  exchangeRateId: number;
  currency: string;
  rate: number;
  changePercentage: number;
  applyDateTime: string;
};

type Quote = {
  krwAmount: number;
  appliedRate: number;
};

type ExchangeOrderFormProps = {
  // 환율 데이터
  rates: ExchangeRate[];

  // 환전 견적
  quote: Quote | null;
  onQuoteRequest: (params: {
    fromCurrency: string;
    toCurrency: string;
    forexAmount: number;
  }) => void;
  onQuoteReset: () => void;

  // 환전 실행
  onExchange: (params: {
    exchangeRateId: number;
    fromCurrency: string;
    toCurrency: string;
    forexAmount: number;
  }) => Promise<void>;
  isExchanging: boolean;
};

export function ExchangeOrderForm({
  rates,
  quote,
  onQuoteRequest,
  onQuoteReset,
  onExchange,
  isExchanging,
}: ExchangeOrderFormProps) {
  // 내부 상태 관리
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [isSelling, setIsSelling] = useState(true); // true: 매도, false: 매입

  // 매입/매도에 따른 통화 방향 계산
  // 매도: 선택한 통화 -> KRW
  // 매입: KRW -> 선택한 통화
  const toCurrency = useMemo(
    () => (isSelling ? 'KRW' : fromCurrency),
    [isSelling, fromCurrency]
  );
  const actualFromCurrency = useMemo(
    () => (isSelling ? fromCurrency : 'KRW'),
    [isSelling, fromCurrency]
  );
  const inputCurrency = fromCurrency; // 항상 선택한 통화를 입력

  // 통화 변경 핸들러
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setFromCurrency(newCurrency);
    setAmount(''); // 통화 변경 시 입력 금액 초기화
    onQuoteReset(); // 견적 초기화
  }, [onQuoteReset]);

  // 매도/매입 변경 핸들러
  const handleTradeTypeChange = useCallback((selling: boolean) => {
    setIsSelling(selling);
    setAmount(''); // 매도/매입 변경 시 입력 금액 초기화
    onQuoteReset(); // 견적 초기화
  }, [onQuoteReset]);

  // 금액 변경 핸들러
  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, debounced?: boolean) => {
      const value = e.target.value;

      // 항상 상태 업데이트 (즉시 UI 반영)
      setAmount(value);

      // 인풋이 비워졌으면 즉시 견적 초기화
      if (!value || value.trim() === '') {
        onQuoteReset();
        return;
      }

      // 디바운스된 호출에서만 API 호출
      if (debounced && parseFloat(value) > 0) {
        onQuoteRequest({
          fromCurrency: actualFromCurrency,
          toCurrency,
          forexAmount: parseFloat(value),
        });
      }
    },
    [actualFromCurrency, toCurrency, onQuoteRequest, onQuoteReset]
  );

  // 환전 실행 핸들러
  const handleExchange = useCallback(async () => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      return;
    }

    // 환율 ID 찾기
    const rateCurrency = fromCurrency;
    const rate = rates.find((r) => r.currency === rateCurrency);
    if (!rate) {
      toast.error('환율 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      await onExchange({
        exchangeRateId: rate.exchangeRateId,
        fromCurrency: actualFromCurrency,
        toCurrency,
        forexAmount: parseFloat(amount),
      });

      // 성공 후 초기화
      setAmount('');
      toast.success('환전이 완료되었습니다!');
    } catch (error) {
      console.error('환전 실패:', error);
      toast.error('환전에 실패했습니다. 다시 시도해주세요.');
    }
  }, [amount, rates, fromCurrency, actualFromCurrency, toCurrency, onExchange]);

  const appliedRate = useMemo(() => {
    return quote && amount && parseFloat(amount) > 0 ? quote.appliedRate : null;
  }, [quote, amount]);

  return (
    <Card className="border-border-primary border p-8 shadow-xl">
      {/* 통화 선택 */}
      <Select value={fromCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="h-14 w-full [&>svg]:h-5 [&>svg]:w-5" data-testid="source-currency-select">
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
            <SelectItem
              key={rate.currency}
              value={rate.currency}
              className="hover:bg-surface-secondary"
            >
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
          onClick={() => handleTradeTypeChange(true)}
        >
          매도
        </Button>
        <Button
          variant={isSelling ? 'outline' : 'default'}
          className={`h-12 flex-1 ${
            !isSelling ? 'bg-primary-500 hover:bg-primary-600' : ''
          }`}
          onClick={() => handleTradeTypeChange(false)}
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
            allowDebouncing={true}
            delay={300}
            type="number"
            placeholder="금액을 입력하세요"
            value={amount}
            onChange={handleAmountChange}
            className="h-14 pr-24 text-right text-2xl font-semibold"
            data-testid="amount-input"
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
        <div className="bg-surface-secondary border-border-primary flex h-18 items-center justify-center rounded-xl border p-4" data-testid="quote-result">
          <div className="text-right">
            {quote && amount && parseFloat(amount) > 0 ? (
              <>
                <span className="text-primary-600 text-3xl font-bold">
                  {formatAmount(quote.krwAmount)}
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

      <div className="text-text-secondary my-6 flex h-10 items-center justify-center gap-2">
        {amount ? (
          <>
            <span className="text-sm">적용 환율</span>
            <span className="text-text-primary font-semibold">
              1 {inputCurrency} = {appliedRate} KRW
            </span>
          </>
        ) : null}
      </div>

      {/* 환전하기 버튼 */}
      <Button
        type="button"
        onClick={handleExchange}
        disabled={!validateAmount(amount).isValid || isExchanging}
        className="bg-surface-invert text-text-invert h-14 w-full text-lg font-semibold shadow-xl hover:opacity-90 disabled:opacity-50"
        data-testid="exchange-button"
      >
        환전하기
      </Button>
    </Card>
  );
}
