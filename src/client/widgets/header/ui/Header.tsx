'use client'

import { Coins, ArrowLeftRight, History, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { useLogoutMutation } from '@/features/logout'

interface HeaderProps {
  isAuthenticated?: boolean
  currentPath?: string
}

export function Header({ isAuthenticated = false, currentPath = '/' }: HeaderProps) {
  const logout = useLogoutMutation()
  
  return (
    <header className="sticky top-0 z-sticky h-16 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md border-b border-secondary-200/50 dark:border-secondary-800/50 shadow-sm">
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Coins className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent hidden sm:inline">
              Switch Won
            </span>
            <span className="text-xl font-bold bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent sm:hidden">
              SW
            </span>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Navigation (Desktop - Authenticated) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className={`gap-2 ${currentPath === '/' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : ''}`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span className="hidden lg:inline">환전하기</span>
                </Button>
              </Link>
              
              <Link href="/history">
                <Button 
                  variant="ghost" 
                  className={`gap-2 ${currentPath === '/history' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : ''}`}
                >
                  <History className="w-4 h-4" />
                  <span className="hidden lg:inline">환전내역</span>
                </Button>
              </Link>
            </nav>
          )}

          {/* Logout Button (Desktop - Authenticated) */}
          {isAuthenticated && (
            <Button 
              variant="outline" 
              className="gap-2 hidden md:flex"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">{logout.isPending ? '로그아웃 중...' : '로그아웃'}</span>
            </Button>
          )}

          {/* Mobile Menu (Authenticated) */}
          {isAuthenticated && (
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* Theme Toggle (Always) */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

