'use client';

import { History as HistoryIcon, RefreshCw } from 'lucide-react';
import { Card, Button } from '@/shared/ui';
import { useOrdersQuery } from '@/entities/order';
import { formatCurrency, formatAmount } from '@/shared/utils/format/currency';
import { formatDateTime } from '@/shared/utils/format/date';

export function HistoryPage() {
  const { data, isLoading, error, refetch } = useOrdersQuery();

  const orders = data?.orders || [];
  const hasHistory = orders.length > 0;

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-surface-secondary min-h-screen p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-text-primary mb-3 text-3xl font-bold">
              환전 내역
            </h1>
            <p className="text-text-secondary text-lg">
              환전 내역을 확인하실 수 있어요.
            </p>
          </div>

          <div className="bg-surface-primary border-border-primary overflow-hidden rounded-2xl border shadow-xl">
            <div className="py-20 text-center">
              <div className="bg-surface-secondary mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full">
                <HistoryIcon className="text-text-tertiary h-8 w-8" />
              </div>
              <p className="text-text-primary mb-2 text-lg font-semibold">
                내역을 불러오는 중...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-surface-secondary min-h-screen p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-text-primary mb-3 text-3xl font-bold">
              환전 내역
            </h1>
            <p className="text-text-secondary text-lg">
              환전 내역을 확인하실 수 있어요.
            </p>
          </div>

          <div className="bg-surface-primary border-border-primary overflow-hidden rounded-2xl border shadow-xl">
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <HistoryIcon className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-text-primary mb-2 text-lg font-semibold">
                내역을 불러올 수 없습니다
              </p>
              <p className="text-text-secondary mb-4 text-sm">
                {error instanceof Error
                  ? error.message
                  : '네트워크 오류가 발생했습니다.'}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                data-testid="retry-button"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                재시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary min-h-screen p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-text-primary mb-3 text-3xl font-bold">
            환전 내역
          </h1>
          <p className="text-text-secondary text-lg">
            환전 내역을 확인하실 수 있어요.
          </p>
        </div>

        {/* 테이블 컨테이너 */}
        <div className="bg-surface-primary border-border-primary overflow-hidden rounded-2xl border shadow-xl">
          {hasHistory ? (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="text-text-primary px-6 py-4 text-left text-sm font-semibold">
                        거래 ID
                      </th>
                      <th className="text-text-primary px-6 py-4 text-left text-sm font-semibold">
                        거래 일시
                      </th>
                      <th className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                        매수 금액
                      </th>
                      <th className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                        체결 환율
                      </th>
                      <th className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                        매도 금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border-primary divide-y">
                    {orders.map((order) => (
                      <tr
                        key={order.orderId}
                        className="hover:bg-surface-secondary transition-colors"
                        data-testid="order-row"
                      >
                        <td className="text-text-primary px-6 py-4 text-sm font-medium">
                          {order.orderId}
                        </td>
                        <td className="text-text-secondary px-6 py-4 text-sm">
                          {formatDateTime(order.orderedAt)}
                        </td>
                        <td className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                          {formatCurrency(order.fromAmount, order.fromCurrency)}
                        </td>
                        <td className="text-text-secondary px-6 py-4 text-right text-sm">
                          {formatAmount(order.appliedRate.toString())}
                        </td>
                        <td className="text-text-primary px-6 py-4 text-right text-sm font-semibold">
                          {formatCurrency(order.toAmount, order.toCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 p-4 lg:hidden">
                {orders.map((order) => (
                  <Card
                    key={order.orderId}
                    className="border-border-primary border p-4"
                    data-testid="order-card"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <span className="text-text-secondary text-xs font-medium">
                        거래 ID
                      </span>
                      <span className="text-text-primary text-sm font-semibold">
                        {order.orderId}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-secondary text-xs">
                          거래 일시
                        </span>
                        <span className="text-text-primary text-xs">
                          {formatDateTime(order.orderedAt)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-text-secondary text-xs">
                          매수 금액
                        </span>
                        <span className="text-text-primary text-sm font-semibold">
                          {formatCurrency(order.fromAmount, order.fromCurrency)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-text-secondary text-xs">
                          체결 환율
                        </span>
                        <span className="text-text-primary text-xs">
                          {formatAmount(order.appliedRate.toString())}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-text-secondary text-xs">
                          매도 금액
                        </span>
                        <span className="text-primary-600 text-sm font-semibold">
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
              <div className="bg-surface-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <HistoryIcon className="text-text-tertiary h-8 w-8" />
              </div>
              <p className="text-text-primary mb-2 text-lg font-semibold">
                아직 환전 내역이 없습니다
              </p>
              <p className="text-text-secondary text-sm">
                첫 환전을 시작해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
