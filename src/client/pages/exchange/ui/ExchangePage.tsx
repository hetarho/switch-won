'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, ArrowDownUp, ChevronDown, Loader2 } from 'lucide-react'
import { Button, Input, Card } from '@/shared/ui'
import { useWalletsQuery } from '@/entities/wallet'
import { useExchangeRatesQuery } from '@/entities/exchange-rate'
import { useExchangeQuoteMutation } from '@/features/exchange-quote'
import { useCreateOrderMutation } from '@/features/create-order'
import { formatAmount } from '@/shared/utils/format/currency'

export function ExchangePage() {
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [amount, setAmount] = useState('')
  const [isSelling, setIsSelling] = useState(true) // true: 매도, false: 매입
  const [showCurrencySelect, setShowCurrencySelect] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  
  // 매입/매도에 따른 통화 방향 결정
  // 매도: 선택한 통화 -> KRW
  // 매입: KRW -> 선택한 통화
  const toCurrency = isSelling ? 'KRW' : fromCurrency
  const actualFromCurrency = isSelling ? fromCurrency : 'KRW'
  
  // 입력 필드 라벨 및 통화 표시용
  const inputCurrency = fromCurrency // 항상 선택한 통화를 입력
  
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowCurrencySelect(false)
      }
    }
    
    if (showCurrencySelect) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCurrencySelect])
  
  // 데이터 조회
  const { data: walletsData, isLoading: isWalletsLoading } = useWalletsQuery()
  const { data: ratesData, isLoading: isRatesLoading, error: ratesError } = useExchangeRatesQuery()
  
  // 환전 관련 hooks
  const quoteMutation = useExchangeQuoteMutation()
  const createOrderMutation = useCreateOrderMutation()
  
  const wallets = walletsData?.wallets || []
  const rates = ratesData?.rates || []
  
  // 환율 찾기 (실제 API 구조에 맞게 수정)
  const getRate = (currency: string) => {
    return rates.find(r => r.currency === currency)
  }
  
  // 총 보유 자산 계산 (KRW 기준)
  const calculateTotalAssets = () => {
    if (walletsData?.totalKrwBalance !== undefined) {
      return walletsData.totalKrwBalance
    }
    
    // fallback: 직접 계산
    let total = 0
    wallets.forEach(wallet => {
      const balance = wallet.balance
      if (wallet.currency === 'KRW') {
        total += balance
      } else {
        const rate = getRate(wallet.currency)
        if (rate) {
          total += balance * rate.rate
        }
      }
    })
    return total
  }
  
  // 견적 조회 (디바운스 처리)
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      return
    }
    
    const timer = setTimeout(() => {
      quoteMutation.mutate({
        fromCurrency: actualFromCurrency,
        toCurrency,
        forexAmount: parseFloat(amount),
      })
    }, 500)
    
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, actualFromCurrency, toCurrency])
  
  // 환전 실행
  const handleExchange = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return
    }
    
    // 환율 ID 찾기 (매입일 때는 선택한 통화의 환율을 사용)
    const rateCurrency = isSelling ? fromCurrency : fromCurrency
    const rate = getRate(rateCurrency)
    if (!rate) {
      alert('환율 정보를 찾을 수 없습니다.')
      return
    }
    
    try {
      await createOrderMutation.mutateAsync({
        exchangeRateId: rate.exchangeRateId,
        fromCurrency: actualFromCurrency,
        toCurrency,
        forexAmount: parseFloat(amount),
      })
      
      // 성공 후 초기화
      setAmount('')
      alert('환전이 완료되었습니다!')
    } catch (error) {
      console.error('환전 실패:', error)
    }
  }
  
  // 주요 환율 표시용 (USD, JPY)
  const usdRate = getRate('USD')
  const jpyRate = getRate('JPY')
  
  console.log('USD 환율:', usdRate)
  console.log('JPY 환율:', jpyRate)
  
  return (
    <div className="min-h-screen bg-surface-secondary p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* 좌측: 환율 정보 */}
          <aside>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              환율 정보
            </h2>
            
            {/* USD 환율 카드 */}
            {usdRate && (
              <Card className="p-6 mb-4 border border-border-primary shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">미국 달러</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold text-text-primary">
                        {formatAmount(usdRate.rate)}
                      </span>
                      <span className="text-lg text-text-secondary">
                        원
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">1 USD 기준</p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-text-tertiary">미국 달러</span>
                    <div className={`flex items-center gap-1 mt-2 px-2 py-1 rounded-md ${
                      usdRate.changePercentage >= 0 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {usdRate.changePercentage >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        usdRate.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {usdRate.changePercentage >= 0 ? '+' : ''}{usdRate.changePercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
            {/* JPY 환율 카드 */}
            {jpyRate && (
              <Card className="p-6 mb-6 border border-border-primary shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">일본 엔</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold text-text-primary">
                        {formatAmount(jpyRate.rate)}
                      </span>
                      <span className="text-lg text-text-secondary">
                        원
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">1 JPY 기준</p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-text-tertiary">일본 엔</span>
                    <div className={`flex items-center gap-1 mt-2 px-2 py-1 rounded-md ${
                      jpyRate.changePercentage >= 0 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {jpyRate.changePercentage >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        jpyRate.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {jpyRate.changePercentage >= 0 ? '+' : ''}{jpyRate.changePercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
            {/* 로딩 상태 */}
            {isRatesLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
                <span className="ml-2 text-text-tertiary">환율 정보를 불러오는 중...</span>
              </div>
            )}
            
            {/* 에러 상태 */}
            {ratesError && (
              <Card className="p-6 mb-4 border border-red-500 bg-red-50 dark:bg-red-900/20">
                <p className="text-red-600 text-sm">
                  환율 정보를 불러올 수 없습니다: {ratesError.message}
                </p>
              </Card>
            )}
            
            {/* 데이터 없음 */}
            {!isRatesLoading && !ratesError && rates.length === 0 && (
              <Card className="p-6 mb-4 border border-border-primary">
                <p className="text-text-tertiary text-sm">
                  환율 정보가 없습니다.
                </p>
              </Card>
            )}
            
            {/* 내 지갑 */}
            <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">
              내 지갑
            </h3>
            
            {isWalletsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
              </div>
            ) : (
              <Card className="p-6 mb-4 border border-border-primary">
                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <div key={wallet.currency} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{wallet.currency}</span>
                      <span className="text-lg font-semibold text-text-primary">
                        {wallet.currency === 'USD' ? '$' : wallet.currency === 'JPY' ? '¥' : '₩'} {formatAmount(wallet.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {/* 총 보유 자산 */}
            <div className="bg-surface-invert rounded-xl p-6 shadow-lg border border-border-primary">
              <p className="text-sm text-text-invert opacity-80">총 보유 자산</p>
              <p className="text-3xl font-bold text-text-invert mt-2">
                ₩ {formatAmount(calculateTotalAssets())}
              </p>
            </div>
          </aside>

          {/* 우측: 환전 폼 */}
          <main>
            <Card className="p-8 border border-border-primary shadow-xl">
              {/* 통화 선택 */}
              <div className="relative" ref={selectRef}>
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-14"
                  onClick={() => setShowCurrencySelect(!showCurrencySelect)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {fromCurrency === 'USD' ? '🇺🇸' : fromCurrency === 'JPY' ? '🇯🇵' : '🇰🇷'}
                    </span>
                    <span className="font-semibold text-lg">
                      {fromCurrency} 환전하기
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showCurrencySelect ? 'rotate-180' : ''}`} />
                </Button>
                
                {/* 드롭다운 메뉴 */}
                {showCurrencySelect && (
                  <div className="absolute top-16 left-0 right-0 bg-surface-primary border border-border-primary rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      {rates.map((rate) => (
                        <button
                          key={rate.currency}
                          onClick={() => {
                            setFromCurrency(rate.currency)
                            setShowCurrencySelect(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-surface-secondary transition-colors ${
                            fromCurrency === rate.currency ? 'bg-surface-secondary' : ''
                          }`}
                        >
                          <span className="text-2xl">
                            {rate.currency === 'USD' ? '🇺🇸' : rate.currency === 'JPY' ? '🇯🇵' : '🇰🇷'}
                          </span>
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{rate.currency}</div>
                            <div className="text-sm text-text-tertiary">
                              {rate.currency === 'USD' ? '미국 달러' : rate.currency === 'JPY' ? '일본 엔' : '대한민국 원'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatAmount(rate.rate)} 원</div>
                            <div className="text-xs text-text-tertiary">1 {rate.currency} 기준</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 매도/매입 토글 */}
              <div className="flex gap-2 mt-6">
                <Button 
                  className={`flex-1 h-12 ${isSelling ? 'bg-primary-500 hover:bg-primary-600' : ''}`}
                  variant={isSelling ? 'default' : 'outline'}
                  onClick={() => setIsSelling(true)}
                >
                  매도
                </Button>
                <Button 
                  variant={isSelling ? 'outline' : 'default'}
                  className={`flex-1 h-12 ${!isSelling ? 'bg-primary-500 hover:bg-primary-600' : ''}`}
                  onClick={() => setIsSelling(false)}
                >
                  매입
                </Button>
              </div>

              {/* 매도/매입 금액 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {isSelling ? '매도 금액' : '매수 금액'}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="금액을 입력하세요"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 text-right pr-24 text-2xl font-semibold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                    {inputCurrency} 입력
                  </div>
                </div>
              </div>

              {/* 환전 방향 */}
              <div className="flex justify-center my-6">
                <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                  <ArrowDownUp className="w-5 h-5 text-text-tertiary" />
                </div>
              </div>

              {/* 환전 견적 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {isSelling ? '받을 원화' : '필요한 원화'}
                </label>
                <div className="bg-surface-secondary border border-border-primary rounded-xl p-4">
                  <div className="text-right">
                    {quoteMutation.isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin text-text-tertiary mx-auto" />
                    ) : quoteMutation.data?.quote ? (
                      <>
                        <span className="text-3xl font-bold text-primary-600">
                          {formatAmount(quoteMutation.data.quote.krwAmount)}
                        </span>
                        <span className="text-lg text-text-secondary ml-2">
                          {isSelling ? '원 받으실거예요' : '원 필요해요'}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg text-text-tertiary">
                        금액을 입력하세요
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 적용 환율 */}
              {quoteMutation.data?.quote && (
                <div className="flex items-center justify-center gap-2 text-text-secondary my-6">
                  <span className="text-sm">적용 환율</span>
                  <span className="font-semibold text-text-primary">
                    1 {inputCurrency} = {formatAmount(quoteMutation.data.quote.appliedRate)} KRW
                  </span>
                </div>
              )}

              {/* 환전하기 버튼 */}
              <Button
                type="button"
                onClick={handleExchange}
                disabled={!amount || parseFloat(amount) <= 0 || createOrderMutation.isPending}
                className="w-full h-14 bg-surface-invert hover:opacity-90 text-text-invert font-semibold text-lg shadow-xl disabled:opacity-50"
                data-testid="exchange-button"
              >
                {createOrderMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  '환전하기'
                )}
              </Button>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
