import { ExchangeHistoryTable } from '@/entities/exchange-history';

export async function HistoryPage() {
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
        <ExchangeHistoryTable />
      </div>
    </div>
  );
}
