"use server";

import { cookies } from "next/headers";

export interface Order {
  orderId: number;
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
  appliedRate: number;
  orderedAt: string;
}

export interface OrdersData {
  orders: Order[];
}

export async function getOrdersAction(): Promise<OrdersData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(`${process.env.API_BASE_URL}/orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "환전 내역 조회에 실패했습니다.");
  }

  const data = await response.json();
  return { orders: data.data };
}
