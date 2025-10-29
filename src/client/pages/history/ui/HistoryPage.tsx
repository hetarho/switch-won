'use client'

import { History as HistoryIcon, RefreshCw } from 'lucide-react'
import { Card, Button } from '@/shared/ui'
import { useOrdersQuery } from '@/entities/order'
import { formatCurrency, formatAmount } from '@/shared/utils/format/currency'
import { formatDateTime } from '@/shared/utils/format/date'

export function HistoryPage() {
  const { data, isLoading, error, refetch } = useOrdersQuery()
  
  const orders = data?.orders || []
  const hasHistory = orders.length > 0

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              환전 내역
            </h1>
            <p className="text-lg text-text-secondary">
              환전 내역을 확인하실 수 있어요.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-primary rounded-2xl shadow-xl overflow-hidden">
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center animate-pulse">
                <HistoryIcon className="w-8 h-8 text-text-tertiary" />
              </div>
              <p className="text-lg font-semibold text-text-primary mb-2">
                내역을 불러오는 중...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-surface-secondary p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              환전 내역
            </h1>
            <p className="text-lg text-text-secondary">
              환전 내역을 확인하실 수 있어요.
            </p>
          </div>

          <div className="bg-surface-primary border border-border-primary rounded-2xl shadow-xl overflow-hidden">
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <HistoryIcon className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-lg font-semibold text-text-primary mb-2">
                내역을 불러올 수 없습니다
              </p>
              <p className="text-sm text-text-secondary mb-4">
                {error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.'}
              </p>
              <Button 
                onClick={() => refetch()} 
                variant="outline"
                data-testid="retry-button"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                재시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            환전 내역
          </h1>
          <p className="text-lg text-text-secondary">
            환전 내역을 확인하실 수 있어요.
          </p>
        </div>

        {/* 테이블 컨테이너 */}
        <div className="bg-surface-primary border border-border-primary rounded-2xl shadow-xl overflow-hidden">
          {hasHistory ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                        거래 ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                        거래 일시
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                        매수 금액
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                        체결 환율
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                        매도 금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary">
                    {orders.map((order) => (
                      <tr 
                        key={order.orderId}
                        className="hover:bg-surface-secondary transition-colors"
                        data-testid="order-row"
                      >
                        <td className="px-6 py-4 text-sm text-text-primary font-medium">
                          {order.orderId}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {formatDateTime(order.orderedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary text-right font-semibold">
                          {formatCurrency(order.fromAmount, order.fromCurrency)}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary text-right">
                          {formatAmount(order.appliedRate.toString())}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary text-right font-semibold">
                          {formatCurrency(order.toAmount, order.toCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {orders.map((order) => (
                  <Card key={order.orderId} className="p-4 border border-border-primary" data-testid="order-card">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium text-text-secondary">
                        거래 ID
                      </span>
                      <span className="text-sm font-semibold text-text-primary">
                        {order.orderId}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-text-secondary">
                          거래 일시
                        </span>
                        <span className="text-xs text-text-primary">
                          {formatDateTime(order.orderedAt)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-text-secondary">
                          매수 금액
                        </span>
                        <span className="text-sm font-semibold text-text-primary">
                          {formatCurrency(order.fromAmount, order.fromCurrency)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-text-secondary">
                          체결 환율
                        </span>
                        <span className="text-xs text-text-primary">
                          {formatAmount(order.appliedRate.toString())}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-text-secondary">
                          매도 금액
                        </span>
                        <span className="text-sm font-semibold text-primary-600">
                          {formatCurrency(order.toAmount, order.toCurrency)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Empty State
            <div className="py-20 text-center" data-testid="empty-state">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
                <HistoryIcon className="w-8 h-8 text-text-tertiary" />
              </div>
              <p className="text-lg font-semibold text-text-primary mb-2">
                아직 환전 내역이 없습니다
              </p>
              <p className="text-sm text-text-secondary">
                첫 환전을 시작해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
