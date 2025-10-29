'use client'

import { useEffect } from 'react';
import { Button } from '@/shared/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러를 에러 리포팅 서비스에 전송
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">알 수 없는 오류가 발생했습니다</h2>
      <p className="text-muted-foreground mb-4 text-center">
        {error.message || '페이지를 새로고침해주세요.'}
      </p>
      {error.digest && (
        <p className="text-sm text-muted-foreground mb-4">
          에러 ID: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={reset}>
          다시 시도
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          새로고침
        </Button>
      </div>
    </div>
  );
}

