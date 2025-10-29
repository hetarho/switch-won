import { Card, Skeleton } from '@/shared';

export function ExchangeRateCardSkeleton() {
  return (
    <Card className="border-border-primary mb-4 border p-6 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-5 w-24" />
          <div className="mt-1 flex items-baseline gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-8" />
          </div>
          <Skeleton className="mt-1 h-4 w-20" />
        </div>
        <div className="flex flex-col items-end">
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </Card>
  );
}

