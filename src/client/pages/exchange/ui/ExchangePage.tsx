'use client'

import { TrendingUp, TrendingDown, ArrowDownUp, ChevronDown } from 'lucide-react'
import { Button, Input, Card } from '@/shared/ui'

export function ExchangePage() {
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
            <Card className="p-6 mb-4 border border-border-primary shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">미국 달러</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-text-primary">
                      1,320.50
                    </span>
                    <span className="text-lg text-text-secondary">
                      KRW
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-xs text-text-tertiary">미국 달러</span>
                  <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">+13.5%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* JPY 환율 카드 */}
            <Card className="p-6 mb-6 border border-border-primary shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">일본 엔</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-text-primary">
                      9.85
                    </span>
                    <span className="text-lg text-text-secondary">
                      KRW
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-xs text-text-tertiary">일본 엔</span>
                  <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">-1.1%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 내 지갑 */}
            <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">
              내 지갑
            </h3>
            
            <Card className="p-6 mb-4 border border-border-primary">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">KRW</span>
                  <span className="text-lg font-semibold text-text-primary">
                    ₩ 1,200,000
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">USD</span>
                  <span className="text-lg font-semibold text-text-primary">
                    $ 50,000
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">JPY</span>
                  <span className="text-lg font-semibold text-text-primary">
                    ¥ 150,000
                  </span>
                </div>
              </div>
            </Card>

            {/* 총 보유 자산 */}
            <div className="bg-surface-invert rounded-xl p-6 shadow-lg border border-border-primary">
              <p className="text-sm text-text-invert opacity-80">총 보유 자산</p>
              <p className="text-3xl font-bold text-text-invert mt-2">₩ 3,000,000</p>
            </div>
          </aside>

          {/* 우측: 환전 폼 */}
          <main>
            <Card className="p-8 border border-border-primary shadow-xl">
              {/* 통화 선택 */}
              <Button variant="outline" className="w-full justify-between h-14">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="font-semibold text-lg">USD 환전하기</span>
                </div>
                <ChevronDown className="w-5 h-5" />
              </Button>

              {/* 매도/매입 토글 */}
              <div className="flex gap-2 mt-6">
                <Button className="flex-1 h-12 bg-primary-500 hover:bg-primary-600">
                  매도
                </Button>
                <Button variant="outline" className="flex-1 h-12">
                  매입
                </Button>
              </div>

              {/* 매도 금액 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  매도 금액
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="30"
                    className="h-14 text-right pr-24 text-2xl font-semibold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                    달러 입력
                  </div>
                </div>
              </div>

              {/* 환전 방향 */}
              <div className="flex justify-center my-6">
                <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                  <ArrowDownUp className="w-5 h-5 text-text-tertiary" />
                </div>
              </div>

              {/* 원화 환율 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  원화 환율
                </label>
                <div className="bg-surface-secondary border border-border-primary rounded-xl p-4">
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary-600">
                      42,530
                    </span>
                    <span className="text-lg text-text-secondary ml-2">
                      원 받으실거예요
                    </span>
                  </div>
                </div>
              </div>

              {/* 적용 환율 */}
              <div className="flex items-center justify-center gap-2 text-text-secondary my-6">
                <span className="text-sm">적용 환율</span>
                <span className="font-semibold text-text-primary">
                  1 USD = 1,320.50 원
                </span>
              </div>

              {/* 환전하기 버튼 */}
              <Button
                type="submit"
                className="w-full h-14 bg-surface-invert hover:opacity-90 text-text-invert font-semibold text-lg shadow-xl"
                data-testid="exchange-button"
              >
                환전하기
              </Button>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}

