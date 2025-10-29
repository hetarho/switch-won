/**
 * API 에러 응답
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  data: Record<string, string> | null;
}

/**
 * 커스텀 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public data: Record<string, string> | null = null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 에러 코드 타입
 */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'MISSING_PARAMETER'
  | 'WALLET_INSUFFICIENT_BALANCE'
  | 'INVALID_DEPOSIT_AMOUNT'
  | 'INVALID_WITHDRAW_AMOUNT'
  | 'CURRENCY_MISMATCH'
  | 'INVALID_AMOUNT_SCALE'
  | 'EXCHANGE_RATE_CURRENCY_MISMATCH'
  | 'UNSUPPORTED_FOREX_CONVERSION_CURRENCY'
  | 'INVALID_EXCHANGE_RATE_CURRENCY'
  | 'UNSUPPORTED_CURRENCY_FOR_KRW_CONVERSION';

