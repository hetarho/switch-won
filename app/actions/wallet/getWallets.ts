'use server'

import { cookies } from 'next/headers';

export interface Wallet {
  walletId: number;
  currency: string;
  balance: number;
}

export interface WalletsData {
  totalKrwBalance: number;
  wallets: Wallet[];
}

export async function getWalletsAction(): Promise<WalletsData> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${process.env.API_BASE_URL}/wallets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '지갑 조회에 실패했습니다.');
  }
  
  const data = await response.json();
  
  // API 응답을 내부 구조로 변환
  const apiData = data.data;
  
  return {
    totalKrwBalance: apiData.totalKrwBalance,
    wallets: apiData.wallets,
  };
}

