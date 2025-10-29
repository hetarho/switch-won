import { describe, it, expect } from 'vitest';
import { formatCurrency, formatAmount } from '../currency';

describe('formatCurrency', () => {
  it('should format KRW correctly without decimals', () => {
    expect(formatCurrency(1000, 'KRW')).toBe('₩1,000');
    expect(formatCurrency(1000000, 'KRW')).toBe('₩1,000,000');
    expect(formatCurrency(0, 'KRW')).toBe('₩0');
  });

  it('should format KRW with string input', () => {
    expect(formatCurrency('1000', 'KRW')).toBe('₩1,000');
    expect(formatCurrency('1234567', 'KRW')).toBe('₩1,234,567');
  });

  it('should format USD correctly with 2 decimals', () => {
    expect(formatCurrency(10.5, 'USD')).toBe('US$10.50');
    expect(formatCurrency(100, 'USD')).toBe('US$100.00');
    expect(formatCurrency(1234.56, 'USD')).toBe('US$1,234.56');
  });

  it('should format USD with string input', () => {
    expect(formatCurrency('10.5', 'USD')).toBe('US$10.50');
    expect(formatCurrency('1234.56', 'USD')).toBe('US$1,234.56');
  });

  it('should format EUR correctly', () => {
    expect(formatCurrency(10.5, 'EUR')).toBe('€10.50');
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
  });

  it('should format JPY correctly', () => {
    expect(formatCurrency(1000, 'JPY')).toBe('JP¥1,000.00');
    expect(formatCurrency(10000, 'JPY')).toBe('JP¥10,000.00');
  });

  it('should handle decimal values correctly', () => {
    expect(formatCurrency(0.1, 'USD')).toBe('US$0.10');
    expect(formatCurrency(0.01, 'USD')).toBe('US$0.01');
  });

  it('should handle large numbers', () => {
    expect(formatCurrency(1000000000, 'KRW')).toBe('₩1,000,000,000');
    expect(formatCurrency(1000000000, 'USD')).toBe('US$1,000,000,000.00');
  });
});

describe('formatAmount', () => {
  it('should format numbers with commas', () => {
    expect(formatAmount(1000)).toBe('1,000');
    expect(formatAmount(1000000)).toBe('1,000,000');
    expect(formatAmount(0)).toBe('0');
  });

  it('should format string numbers', () => {
    expect(formatAmount('1000')).toBe('1,000');
    expect(formatAmount('1234567')).toBe('1,234,567');
  });

  it('should handle decimal values', () => {
    expect(formatAmount(10.5)).toBe('10.5');
    expect(formatAmount(1234.56)).toBe('1,234.56');
    expect(formatAmount(0.01)).toBe('0.01');
  });

  it('should handle string decimal values', () => {
    expect(formatAmount('10.5')).toBe('10.5');
    expect(formatAmount('1234.56')).toBe('1,234.56');
  });

  it('should limit to 2 decimal places', () => {
    expect(formatAmount(10.5555)).toBe('10.56');
    expect(formatAmount(1234.999)).toBe('1,235');
  });

  it('should handle large numbers', () => {
    expect(formatAmount(1000000000)).toBe('1,000,000,000');
    expect(formatAmount(9999999999)).toBe('9,999,999,999');
  });

  it('should handle negative numbers', () => {
    expect(formatAmount(-1000)).toBe('-1,000');
    expect(formatAmount(-1234.56)).toBe('-1,234.56');
  });
});

