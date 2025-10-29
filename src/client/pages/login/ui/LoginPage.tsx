'use client';

import { useState } from 'react';
import { Rss } from 'lucide-react';
import { Input, Button, Card, CardContent } from '@/shared/ui';
import { useLoginMutation } from '@/features/login';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const login = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(email);
  };

  return (
    <div className="bg-surface-secondary flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 브랜드 아이콘 */}
        <div className="bg-surface-tertiary mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105">
          <Rss className="text-primary-500 h-9 w-9" strokeWidth={2.5} />
        </div>

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-text-primary mb-3 text-4xl font-bold">
            반갑습니다.
          </h1>
          <p className="text-text-secondary text-lg">
            로그인 정보를 입력해주세요.
          </p>
        </div>

        {/* 폼 카드 */}
        <Card className="border-border-primary bg-surface-primary shadow-xl">
          <CardContent className="px-8 pt-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-text-secondary block text-sm font-medium"
                >
                  이메일 주소를 입력해주세요.
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  data-testid="email-input"
                  disabled={login.isPending}
                  className="border-border-primary focus:border-primary-500 focus:ring-primary-500/20 bg-surface-primary h-12 text-base focus:ring-2"
                />
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                disabled={login.isPending}
                className="bg-surface-invert text-text-invert h-12 w-full text-base font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                data-testid="login-button"
              >
                {login.isPending ? '로그인 중...' : '로그인 하기'}
              </Button>

              {/* 에러 메시지 */}
              {login.error && (
                <p className="text-center text-sm text-red-500">
                  {login.error.message}
                </p>
              )}

              {/* 안내 문구 */}
              <p className="text-text-tertiary mt-4 text-center text-xs">
                가입되지 않은 이메일은 자동으로 회원가입됩니다
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
