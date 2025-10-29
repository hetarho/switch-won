'use server'

import { cookies } from 'next/headers';

export interface Wallet {
  walletId: number;
  currency: string;
  balance: number;
  priceDifference?: number; // 가격 차이 (소수점 둘째 자리)
  priceDifferencePercent?: number; // 가격 차이 퍼센트 (소수점 둘째 자리)
}

export interface WalletsData {
  totalKrwBalance: number;
  wallets: Wallet[];
}

interface Order {
  orderId: number;
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
  appliedRate: number;
  orderedAt: string;
}

interface ExchangeRate {
  exchangeRateId: number;
  currency: string;
  rate: number;
  changePercentage: number;
  applyDateTime: string;
}

export async function getWalletsAction(): Promise<WalletsData> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // 지갑 정보 가져오기
  const walletsResponse = await fetch(`${process.env.API_BASE_URL}/wallets`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  
  if (!walletsResponse.ok) {
    const error = await walletsResponse.json();
    throw new Error(error.message || '지갑 조회에 실패했습니다.');
  }
  
  const walletsData = await walletsResponse.json();
  const apiData = walletsData.data;
  
  // Orders 데이터 가져오기
  const ordersResponse = await fetch(`${process.env.API_BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  
  const orders: Order[] = ordersResponse.ok 
    ? (await ordersResponse.json()).data 
    : [];
  
  // Exchange Rates 데이터 가져오기
  const ratesResponse = await fetch(
    `${process.env.API_BASE_URL}/exchange-rates/latest`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  );
  
  const exchangeRates: ExchangeRate[] = ratesResponse.ok
    ? (await ratesResponse.json()).data
    : [];
  
  // 각 통화별 구매 시점 환율 계산
  const purchaseRates: Record<string, number> = {};
  
  apiData.wallets.forEach((wallet: Wallet) => {
    if (wallet.currency === 'KRW') return;
    
    // 해당 통화를 구매한 주문들 찾기 (KRW -> 해당 통화)
    const purchaseOrders = orders.filter(
      (order: Order) => order.toCurrency === wallet.currency && order.fromCurrency === 'KRW'
    );
    
    if (purchaseOrders.length > 0) {
      // 가중 평균 환율 계산
      let totalAmount = 0;
      let weightedRate = 0;
      
      purchaseOrders.forEach((order: Order) => {
        totalAmount += order.toAmount;
        weightedRate += order.toAmount * order.appliedRate;
      });
      
      purchaseRates[wallet.currency] = totalAmount > 0 ? weightedRate / totalAmount : 0;
    }
  });
  
  // 현재 환율과 비교하여 차이 계산
  const walletsWithPriceComparison = apiData.wallets.map((wallet: Wallet) => {
    if (wallet.currency === 'KRW') {
      return wallet;
    }
    
    const purchaseRate = purchaseRates[wallet.currency];
    const currentRate = exchangeRates.find((r) => r.currency === wallet.currency)?.rate;
    
    if (purchaseRate && currentRate) {
      const difference = currentRate - purchaseRate;
      const percentageDiff = purchaseRate > 0 ? (difference / purchaseRate) * 100 : 0;
      
      return {
        ...wallet,
        priceDifference: parseFloat(difference.toFixed(2)),
        priceDifferencePercent: parseFloat(percentageDiff.toFixed(2)),
      };
    }
    
    return wallet;
  });
  
  return {
    totalKrwBalance: apiData.totalKrwBalance,
    wallets: walletsWithPriceComparison,
  };
}

