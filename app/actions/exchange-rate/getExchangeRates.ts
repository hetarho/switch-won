"use server";

import { cookies } from "next/headers";

export interface ExchangeRate {
  exchangeRateId: number;
  currency: string;
  rate: number;
  changePercentage: number;
  applyDateTime: string;
}

export interface ExchangeRatesData {
  rates: ExchangeRate[];
  updatedAt: string;
}

export async function getExchangeRatesAction(): Promise<ExchangeRatesData> {
  
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(
    `${process.env.API_BASE_URL}/exchange-rates/latest`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );


  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "환율 조회에 실패했습니다.");
  }

  const data = await response.json();
  // API 응답을 내부 구조로 변환
  const rates = data.data || [];
  const updatedAt = rates.length > 0 ? rates[0].applyDateTime : new Date().toISOString();
  return {
    rates,
    updatedAt,
  };
}
