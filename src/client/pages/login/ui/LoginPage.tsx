"use client";

import { useState } from "react";
import { Rss } from "lucide-react";
import { Input, Button, Card, CardContent } from "@/shared/ui";
import { useLoginMutation } from "@/features/login";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const login = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(email);
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 브랜드 아이콘 */}
        <div className="w-16 h-16 mx-auto mb-8 bg-surface-tertiary rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
          <Rss className="w-9 h-9 text-primary-500" strokeWidth={2.5} />
        </div>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-3">
            반갑습니다.
          </h1>
          <p className="text-lg text-text-secondary">
            로그인 정보를 입력해주세요.
          </p>
        </div>

        {/* 폼 카드 */}
        <Card className="border-border-primary shadow-xl bg-surface-primary">
          <CardContent className="pt-8 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-secondary"
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
                  className="h-12 text-base border-border-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-surface-primary"
                />
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                disabled={login.isPending}
                className="w-full h-12 bg-surface-invert hover:opacity-90 text-text-invert font-semibold text-base shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                data-testid="login-button"
              >
                {login.isPending ? "로그인 중..." : "로그인 하기"}
              </Button>

              {/* 에러 메시지 */}
              {login.error && (
                <p className="text-sm text-red-500 text-center">
                  {login.error.message}
                </p>
              )}

              {/* 안내 문구 */}
              <p className="text-xs text-text-tertiary text-center mt-4">
                가입되지 않은 이메일은 자동으로 회원가입됩니다
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
