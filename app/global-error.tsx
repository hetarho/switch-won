'use client'

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 전역 에러를 에러 리포팅 서비스에 전송
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h2 className="text-2xl font-bold mb-4">심각한 오류가 발생했습니다</h2>
          <p className="text-muted-foreground mb-4 text-center">
            {error.message || '앱을 새로고침해주세요.'}
          </p>
          {error.digest && (
            <p className="text-sm text-muted-foreground mb-4">
              에러 ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}

