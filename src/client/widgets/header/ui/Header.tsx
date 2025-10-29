'use client';

import { Coins, ArrowLeftRight, History, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { useLogoutMutation } from '@/features/logout';

interface HeaderProps {
  isAuthenticated?: boolean;
  currentPath?: string;
}

export function Header({
  isAuthenticated = false,
  currentPath = '/',
}: HeaderProps) {
  const logout = useLogoutMutation();

  return (
    <header className="z-sticky dark:bg-secondary-900/80 border-secondary-200/50 dark:border-secondary-800/50 sticky top-0 h-16 border-b bg-white/80 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        {/* Logo */}
        <Link href="/">
          <div className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80">
            <div className="from-primary-500 to-primary-600 flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br shadow-md">
              <Coins className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="from-primary-600 to-primary-500 hidden bg-linear-to-r bg-clip-text text-xl font-bold text-transparent sm:inline">
              Switch Won
            </span>
            <span className="from-primary-600 to-primary-500 bg-linear-to-r bg-clip-text text-xl font-bold text-transparent sm:hidden">
              SW
            </span>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Navigation (Desktop - Authenticated) */}
          {isAuthenticated && (
            <nav className="hidden items-center gap-1 md:flex">
              <Link href="/">
                <Button
                  variant="ghost"
                  className={`gap-2 ${currentPath === '/' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : ''}`}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span className="hidden lg:inline">환전하기</span>
                </Button>
              </Link>

              <Link href="/history">
                <Button
                  variant="ghost"
                  className={`gap-2 ${currentPath === '/history' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : ''}`}
                >
                  <History className="h-4 w-4" />
                  <span className="hidden lg:inline">환전내역</span>
                </Button>
              </Link>
            </nav>
          )}

          {/* Logout Button (Desktop - Authenticated) */}
          {isAuthenticated && (
            <Button
              variant="outline"
              className="hidden gap-2 md:flex"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">
                {logout.isPending ? '로그아웃 중...' : '로그아웃'}
              </span>
            </Button>
          )}

          {/* Mobile Menu (Authenticated) */}
          {isAuthenticated && (
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Theme Toggle (Always) */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
