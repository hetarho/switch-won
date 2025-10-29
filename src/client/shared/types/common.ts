/**
 * 공통 타입 정의
 */

export interface CommonResponse<T = unknown> {
  code: string;
  message: string;
  data: T;
}

