/**
 * 금액이 유효한 숫자인지 검사
 */
export function isValidAmount(amount: string | number): boolean {
  if (typeof amount === 'string') {
    // 빈 문자열이나 공백만 있는 경우
    const trimmed = amount.trim();
    if (!trimmed) {
      return false;
    }
    
    // 숫자 형식 검사 (선택적 +/-, 소수점, 숫자만 허용)
    const numericPattern = /^-?\d+(\.\d+)?$/;
    if (!numericPattern.test(trimmed)) {
      return false;
    }
    
    const numValue = parseFloat(trimmed);
    return !isNaN(numValue) && isFinite(numValue) && numValue > 0;
  }
  
  return !isNaN(amount) && isFinite(amount) && amount > 0;
}

/**
 * 금액 유효성 검사 (메시지 포함)
 */
export function validateAmount(
  amount: string | number,
  options?: {
    min?: number;
    max?: number;
    fieldName?: string;
  }
): {
  isValid: boolean;
  message?: string;
} {
  const fieldName = options?.fieldName || '금액';
  
  // 빈 값 검사
  if (typeof amount === 'string' && !amount.trim()) {
    return { isValid: false, message: `${fieldName}을 입력해주세요.` };
  }
  
  // 숫자 형식 검사
  if (typeof amount === 'string') {
    const trimmed = amount.trim();
    // 숫자 형식 검사 (선택적 +/-, 소수점, 숫자만 허용)
    const numericPattern = /^-?\d+(\.\d+)?$/;
    if (!numericPattern.test(trimmed)) {
      return { isValid: false, message: `올바른 ${fieldName}을 입력해주세요.` };
    }
  }
  
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return { isValid: false, message: `올바른 ${fieldName}을 입력해주세요.` };
  }
  
  // 양수 검사
  if (numValue <= 0) {
    return { isValid: false, message: `${fieldName}은 0보다 커야 합니다.` };
  }
  
  // 최소값 검사
  if (options?.min !== undefined && numValue < options.min) {
    return { 
      isValid: false, 
      message: `${fieldName}은 최소 ${options.min} 이상이어야 합니다.` 
    };
  }
  
  // 최대값 검사
  if (options?.max !== undefined && numValue > options.max) {
    return { 
      isValid: false, 
      message: `${fieldName}은 최대 ${options.max} 이하여야 합니다.` 
    };
  }
  
  return { isValid: true };
}

/**
 * 금액 문자열을 숫자로 안전하게 변환
 */
export function parseAmount(amount: string): number | null {
  const trimmed = amount.trim();
  if (!trimmed) {
    return null;
  }
  
  // 숫자 형식 검사 (선택적 +/-, 소수점, 숫자만 허용)
  const numericPattern = /^-?\d+(\.\d+)?$/;
  if (!numericPattern.test(trimmed)) {
    return null;
  }
  
  const numValue = parseFloat(trimmed);
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return null;
  }
  
  return numValue;
}
