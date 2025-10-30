import { describe, it, expect } from 'vitest';
import { isValidAmount, validateAmount, parseAmount } from '../amount';

describe('isValidAmount', () => {
  describe('문자열 입력', () => {
    it('유효한 양수 문자열에 대해 true를 반환해야 함', () => {
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount('1.5')).toBe(true);
      expect(isValidAmount('0.01')).toBe(true);
      expect(isValidAmount('1000.99')).toBe(true);
    });

    it('0 이하의 값에 대해 false를 반환해야 함', () => {
      expect(isValidAmount('0')).toBe(false);
      expect(isValidAmount('-1')).toBe(false);
      expect(isValidAmount('-100.5')).toBe(false);
    });

    it('빈 문자열이나 공백에 대해 false를 반환해야 함', () => {
      expect(isValidAmount('')).toBe(false);
      expect(isValidAmount('   ')).toBe(false);
      expect(isValidAmount('\t')).toBe(false);
    });

    it('숫자가 아닌 문자열에 대해 false를 반환해야 함', () => {
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('12a')).toBe(false);
      expect(isValidAmount('a12')).toBe(false);
    });

    it('특수한 숫자 값에 대해 false를 반환해야 함', () => {
      expect(isValidAmount('Infinity')).toBe(false);
      expect(isValidAmount('NaN')).toBe(false);
    });
  });

  describe('숫자 입력', () => {
    it('유효한 양수에 대해 true를 반환해야 함', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(1.5)).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
    });

    it('0 이하의 값에 대해 false를 반환해야 함', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-1)).toBe(false);
      expect(isValidAmount(-100.5)).toBe(false);
    });

    it('특수한 숫자 값에 대해 false를 반환해야 함', () => {
      expect(isValidAmount(Infinity)).toBe(false);
      expect(isValidAmount(-Infinity)).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
    });
  });
});

describe('validateAmount', () => {
  describe('기본 유효성 검사', () => {
    it('유효한 금액에 대해 성공 결과를 반환해야 함', () => {
      const result = validateAmount('100');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('빈 값에 대해 에러 메시지를 반환해야 함', () => {
      const result = validateAmount('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('금액을 입력해주세요.');
    });

    it('숫자가 아닌 값에 대해 에러 메시지를 반환해야 함', () => {
      const result = validateAmount('abc');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('올바른 금액을 입력해주세요.');
    });

    it('0 이하의 값에 대해 에러 메시지를 반환해야 함', () => {
      const result = validateAmount('0');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('금액은 0보다 커야 합니다.');
    });

    it('음수에 대해 에러 메시지를 반환해야 함', () => {
      const result = validateAmount('-10');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('금액은 0보다 커야 합니다.');
    });
  });

  describe('커스텀 필드명', () => {
    it('커스텀 필드명을 에러 메시지에 사용해야 함', () => {
      const result = validateAmount('', { fieldName: '환전 금액' });
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('환전 금액을 입력해주세요.');
    });

    it('양수 검사 시 커스텀 필드명을 사용해야 함', () => {
      const result = validateAmount('0', { fieldName: '송금액' });
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('송금액은 0보다 커야 합니다.');
    });
  });

  describe('최소값 검사', () => {
    it('최소값보다 작은 경우 에러를 반환해야 함', () => {
      const result = validateAmount('5', { min: 10 });
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('금액은 최소 10 이상이어야 합니다.');
    });

    it('최소값과 같은 경우 성공을 반환해야 함', () => {
      const result = validateAmount('10', { min: 10 });
      expect(result.isValid).toBe(true);
    });

    it('최소값보다 큰 경우 성공을 반환해야 함', () => {
      const result = validateAmount('15', { min: 10 });
      expect(result.isValid).toBe(true);
    });
  });

  describe('최대값 검사', () => {
    it('최대값보다 큰 경우 에러를 반환해야 함', () => {
      const result = validateAmount('150', { max: 100 });
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('금액은 최대 100 이하여야 합니다.');
    });

    it('최대값과 같은 경우 성공을 반환해야 함', () => {
      const result = validateAmount('100', { max: 100 });
      expect(result.isValid).toBe(true);
    });

    it('최대값보다 작은 경우 성공을 반환해야 함', () => {
      const result = validateAmount('50', { max: 100 });
      expect(result.isValid).toBe(true);
    });
  });

  describe('최소값과 최대값 범위 검사', () => {
    it('범위 내의 값에 대해 성공을 반환해야 함', () => {
      const result = validateAmount('50', { min: 10, max: 100 });
      expect(result.isValid).toBe(true);
    });

    it('최소값보다 작은 경우 에러를 반환해야 함', () => {
      const result = validateAmount('5', { min: 10, max: 100 });
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('최소 10');
    });

    it('최대값보다 큰 경우 에러를 반환해야 함', () => {
      const result = validateAmount('150', { min: 10, max: 100 });
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('최대 100');
    });
  });

  describe('숫자 타입 입력', () => {
    it('숫자 타입의 유효한 값을 처리해야 함', () => {
      expect(validateAmount(100).isValid).toBe(true);
      expect(validateAmount(1.5).isValid).toBe(true);
    });

    it('숫자 타입의 잘못된 값에 대해 에러를 반환해야 함', () => {
      expect(validateAmount(0).isValid).toBe(false);
      expect(validateAmount(-10).isValid).toBe(false);
      expect(validateAmount(NaN).isValid).toBe(false);
    });
  });
});

describe('parseAmount', () => {
  it('유효한 금액 문자열을 숫자로 변환해야 함', () => {
    expect(parseAmount('100')).toBe(100);
    expect(parseAmount('1.5')).toBe(1.5);
    expect(parseAmount('0.01')).toBe(0.01);
  });

  it('빈 문자열에 대해 null을 반환해야 함', () => {
    expect(parseAmount('')).toBe(null);
    expect(parseAmount('   ')).toBe(null);
  });

  it('숫자가 아닌 문자열에 대해 null을 반환해야 함', () => {
    expect(parseAmount('abc')).toBe(null);
    expect(parseAmount('12a')).toBe(null);
  });

  it('특수한 숫자 값에 대해 null을 반환해야 함', () => {
    expect(parseAmount('Infinity')).toBe(null);
    expect(parseAmount('NaN')).toBe(null);
  });

  it('음수를 올바르게 파싱해야 함', () => {
    expect(parseAmount('-10')).toBe(-10);
    expect(parseAmount('-1.5')).toBe(-1.5);
  });

  it('0을 올바르게 파싱해야 함', () => {
    expect(parseAmount('0')).toBe(0);
  });
});
