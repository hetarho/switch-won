import { describe, it, expect } from 'vitest';
import { isValidEmail, validateEmail } from '../email';

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.com')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    expect(isValidEmail('user123@example-domain.com')).toBe(true);
    expect(isValidEmail('test_email@example-site.org')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
    expect(isValidEmail('user@@example.com')).toBe(false);
  });

  it('should return false for empty or nullish values', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
  });

  it('should handle special characters correctly', () => {
    expect(isValidEmail('user+test@example.com')).toBe(true);
    expect(isValidEmail('user-test@example.com')).toBe(true);
    expect(isValidEmail('user_test@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.com')).toBe(true);
  });

  it('should handle domain extensions', () => {
    expect(isValidEmail('test@example.co.uk')).toBe(true);
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('test@example.org')).toBe(true);
    expect(isValidEmail('test@example.net')).toBe(true);
  });
});

describe('validateEmail', () => {
  it('should return valid result for valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('should return invalid result with message for empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('이메일을 입력해주세요');
  });

  it('should return invalid result with message for invalid email', () => {
    const result = validateEmail('invalid');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('유효한 이메일 주소를 입력해주세요');
  });

  it('should return invalid result for email without @', () => {
    const result = validateEmail('testexample.com');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('유효한 이메일 주소를 입력해주세요');
  });

  it('should return invalid result for email without domain', () => {
    const result = validateEmail('test@');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('유효한 이메일 주소를 입력해주세요');
  });

  it('should return invalid result for email without TLD', () => {
    const result = validateEmail('test@example');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('유효한 이메일 주소를 입력해주세요');
  });

  it('should handle various valid formats', () => {
    expect(validateEmail('user.name@example.com').isValid).toBe(true);
    expect(validateEmail('user+tag@example.com').isValid).toBe(true);
    expect(validateEmail('user123@example.co.uk').isValid).toBe(true);
  });

  it('should handle edge cases', () => {
    expect(validateEmail('test@@example.com').isValid).toBe(false);
    // trim 처리로 인해 공백이 있는 이메일도 검증 가능
    expect(validateEmail(' test@example.com ').isValid).toBe(true);
  });

  it('should trim email addresses before validation', () => {
    expect(validateEmail('  test@example.com  ').isValid).toBe(true);
    expect(validateEmail('  test@example.com').isValid).toBe(true);
    expect(validateEmail('test@example.com  ').isValid).toBe(true);
  });
});
