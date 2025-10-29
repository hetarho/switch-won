'use server'

import { cookies } from 'next/headers';
import { handleAuthError } from '@server/utils/handleAuthError';

export interface GetQuoteInput {
  fromCurrency: string;
  toCurrency: string;
  forexAmount: number;
}

export interface Quote {
  krwAmount: number;
  appliedRate: number;
}

export interface GetQuoteOutput {
  quote: Quote;
}

export async function getQuoteAction(input: GetQuoteInput): Promise<GetQuoteOutput> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // GET 요청으로 변경
  const params = new URLSearchParams({
    fromCurrency: input.fromCurrency,
    toCurrency: input.toCurrency,
    forexAmount: input.forexAmount.toString(),
  });
  
  const response = await fetch(`${process.env.API_BASE_URL}/orders/quote?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    await handleAuthError(response, error);
    throw new Error(error.message || '견적 조회에 실패했습니다.');
  }
  
  const data = await response.json();
  return { quote: data.data };
}

