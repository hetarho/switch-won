'use client'

import { History as HistoryIcon } from 'lucide-react'
import { Card } from '@/shared/ui'

// Mock data
const mockHistory = [
  { id: 10, date: '2025-10-05 00:00:00', buyAmount: 32.50, rate: 1383.07, sellAmount: 51976 },
  { id: 9, date: '2025-10-05 00:00:00', buyAmount: 500, rate: 1383.07, sellAmount: 699690 },
  { id: 8, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 1609.70, sellAmount: 454734 },
  { id: 7, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 1609.70, sellAmount: 454734 },
  { id: 6, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 1383.07, sellAmount: 454734 },
  { id: 5, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 942.58, sellAmount: 454734 },
  { id: 4, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 942.58, sellAmount: 454734 },
  { id: 3, date: '2025-10-05 00:00:00', buyAmount: 41698, rate: 942.58, sellAmount: 30.00 },
  { id: 2, date: '2025-10-05 00:00:00', buyAmount: 41698, rate: 1383.07, sellAmount: 30.00 },
  { id: 1, date: '2025-10-05 00:00:00', buyAmount: 325.50, rate: 1383.07, sellAmount: 454734 },
]

export function HistoryPage() {
  const hasHistory = mockHistory.length > 0

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
                    {mockHistory.map((item) => (
                      <tr 
                        key={item.id}
                        className="hover:bg-surface-secondary transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-text-primary font-medium">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary text-right font-semibold">
                          {item.buyAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary text-right">
                          {item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary text-right font-semibold">
                          {item.sellAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {mockHistory.map((item) => (
                  <Card key={item.id} className="p-4 border border-border-primary">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium text-text-secondary">
                        거래 ID
                      </span>
                      <span className="text-sm font-semibold text-text-primary">
                        {item.id}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-text-secondary">
                          거래 일시
                        </span>
                        <span className="text-xs text-text-primary">
                          {item.date}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-text-secondary">
                          매수 금액
                        </span>
                        <span className="text-sm font-semibold text-text-primary">
                          {item.buyAmount.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-text-secondary">
                          체결 환율
                        </span>
                        <span className="text-xs text-text-primary">
                          {item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-text-secondary">
                          매도 금액
                        </span>
                        <span className="text-sm font-semibold text-primary-600">
                          {item.sellAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Empty State
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
                <HistoryIcon className="w-8 h-8 text-text-tertiary" />
              </div>
              <p className="text-lg font-semibold text-text-primary mb-2">
                환전 내역이 없습니다
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
