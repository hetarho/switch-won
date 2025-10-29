'use server'

import { cookies } from 'next/headers';
import { handleAuthError } from '@server/utils/handleAuthError';

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
    await handleAuthError(walletsResponse, error);
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
  
  // 각 통화별 현재 보유 잔고에 대한 평균 매수가(원/단위)를 계산한다
  const purchaseRates: Record<string, number> = {};

  function computeAverageCostPerUnit(targetCurrency: string): number {
    const EPS = 1e-8; // 부동소수점으로 인해 0에 매우 가까운 값을 0으로 간주
    // 해당 통화의 KRW<->통화 간 거래만 시간순으로 정렬
    const related = orders
      .filter((o: Order) =>
        (o.toCurrency === targetCurrency && o.fromCurrency === 'KRW') ||
        (o.fromCurrency === targetCurrency && o.toCurrency === 'KRW')
      )
      .sort((a: Order, b: Order) => new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime());

    let position = 0; // 보유 수량(단위)
    let totalCostKrw = 0; // 잔존 수량의 총 원가(원)

    for (const order of related) {
      if (order.toCurrency === targetCurrency && order.fromCurrency === 'KRW') {
        // 매수: 수량 증가, 원가 증가
        position += order.toAmount;
        totalCostKrw += order.toAmount * order.appliedRate;
      } else if (order.fromCurrency === targetCurrency && order.toCurrency === 'KRW') {
        // 매도: 평균단가 기준으로 원가를 줄인다
        const sellAmount = order.fromAmount;
        const avgCost = position > 0 ? totalCostKrw / position : 0;
        const reduceAmount = Math.min(sellAmount, position);
        totalCostKrw -= avgCost * reduceAmount;
        position -= reduceAmount;
        if (position <= EPS) {
          // 포지션이 0이 되었으면 그 이전 이력은 모두 무시
          position = 0;
          totalCostKrw = 0;
        }
      }
    }

    return position > EPS ? totalCostKrw / position : 0;
  }
  
  apiData.wallets.forEach((wallet: Wallet) => {
    if (wallet.currency === 'KRW') return;
    
    const avgCost = computeAverageCostPerUnit(wallet.currency);
    if (avgCost > 0) {
      purchaseRates[wallet.currency] = avgCost;
    }
  });
  
  // 현재 환율과 비교하여 차이 계산
  const walletsWithPriceComparison = apiData.wallets.map((wallet: Wallet) => {
    // 원화 지갑이거나 해당 통화의 잔액이 0이면 수익/손실 정보를 계산하지 않는다
    if (wallet.currency === 'KRW' || wallet.balance <= 0) {
      return wallet;
    }
    
    const purchaseRate = purchaseRates[wallet.currency];
    const currentRate = exchangeRates.find((r) => r.currency === wallet.currency)?.rate;
    
    if (purchaseRate && currentRate) {
      // 환율 차이(원/단위)와 보유 수량을 곱해 총 평가손익(원)을 계산한다
      const perUnitDifference = currentRate - purchaseRate;
      const totalKrwDifference = perUnitDifference * wallet.balance;
      const percentageDiff = purchaseRate > 0 ? (perUnitDifference / purchaseRate) * 100 : 0;

      return {
        ...wallet,
        priceDifference: parseFloat(totalKrwDifference.toFixed(2)),
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

