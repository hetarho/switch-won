/**
 * 공통 타입 정의
 */

export interface CommonResponse<T = unknown> {
  code: string;
  message: string;
  data: T;
}

/**
 * 지원하는 통화 코드 (ISO 4217)
 */
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY';

/**
 * 통화 정보
 */
export interface CurrencyInfo {
  /** 통화 코드 */
  code: Currency;

  /** 통화 이름 */
  name: string;

  /** 통화 심볼 */
  symbol: string;

  /** 소수점 자릿수 */
  decimals: number;
}

/**
 * 통화 목록
 */
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  KRW: {
    code: 'KRW',
    name: '대한민국 원',
    symbol: '₩',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    name: '미국 달러',
    symbol: '$',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    name: '유로',
    symbol: '€',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    name: '일본 엔',
    symbol: '¥',
    decimals: 0,
  },
  CNY: {
    code: 'CNY',
    name: '중국 위안',
    symbol: '¥',
    decimals: 2,
  },
};
