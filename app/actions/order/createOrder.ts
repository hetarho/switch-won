'use server'

import { cookies } from 'next/headers';

export interface CreateOrderInput {
  exchangeRateId: number;
  fromCurrency: string;
  toCurrency: string;
  forexAmount: number;
}

export interface Order {
  orderId: number;
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
  appliedRate: number;
  orderedAt: string;
}

export interface CreateOrderOutput {
  order: Order;
}

export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderOutput> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${process.env.API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '환전 실행에 실패했습니다.');
  }
  
  const data = await response.json();
  return { order: data.data };
}

