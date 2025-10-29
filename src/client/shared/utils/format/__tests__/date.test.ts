import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, formatDateTime, formatRelativeTime } from '../date';

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const dateStr = '2025-01-15';
    const result = formatDate(dateStr);
    expect(result).toContain('2025');
    expect(result).toContain('1월');
    expect(result).toContain('15');
  });

  it('should format Date object correctly', () => {
    const date = new Date('2025-01-15');
    const result = formatDate(date);
    expect(result).toContain('2025');
    expect(result).toContain('1월');
    expect(result).toContain('15');
  });

  it('should format different dates', () => {
    const date1 = '2025-12-31';
    const result1 = formatDate(date1);
    expect(result1).toContain('2025');
    expect(result1).toContain('12월');
    expect(result1).toContain('31');
  });
});

describe('formatDateTime', () => {
  it('should format date and time string correctly', () => {
    const dateStr = '2025-01-15T14:30:00';
    const result = formatDateTime(dateStr);
    expect(result).toContain('2025');
    expect(result).toContain('1월');
    expect(result).toContain('15');
    expect(result).toContain('오후');
    expect(result).toContain('02:30');
  });

  it('should format Date object with time', () => {
    const date = new Date('2025-01-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('2025');
    expect(result).toContain('오후');
    expect(result).toContain('02:30');
  });

  it('should format morning time correctly', () => {
    const date = new Date('2025-01-15T09:05:00');
    const result = formatDateTime(date);
    expect(result).toContain('오전');
    expect(result).toContain('09:05');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "방금 전" for recent time', () => {
    const now = new Date('2025-01-15T12:00:00');
    vi.setSystemTime(now);

    const recent = new Date('2025-01-15T12:00:30');
    expect(formatRelativeTime(recent)).toBe('방금 전');
  });

  it('should return "X분 전" for minutes ago', () => {
    const now = new Date('2025-01-15T12:00:00');
    vi.setSystemTime(now);

    const fiveMinutesAgo = new Date('2025-01-15T11:55:00');
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5분 전');

    const thirtyMinutesAgo = new Date('2025-01-15T11:30:00');
    expect(formatRelativeTime(thirtyMinutesAgo)).toBe('30분 전');
  });

  it('should return "X시간 전" for hours ago', () => {
    const now = new Date('2025-01-15T12:00:00');
    vi.setSystemTime(now);

    const oneHourAgo = new Date('2025-01-15T11:00:00');
    expect(formatRelativeTime(oneHourAgo)).toBe('1시간 전');

    const fiveHoursAgo = new Date('2025-01-15T07:00:00');
    expect(formatRelativeTime(fiveHoursAgo)).toBe('5시간 전');
  });

  it('should return "X일 전" for days ago', () => {
    const now = new Date('2025-01-15T12:00:00');
    vi.setSystemTime(now);

    const oneDayAgo = new Date('2025-01-14T12:00:00');
    expect(formatRelativeTime(oneDayAgo)).toBe('1일 전');

    const sevenDaysAgo = new Date('2025-01-08T12:00:00');
    expect(formatRelativeTime(sevenDaysAgo)).toBe('7일 전');
  });

  it('should handle string input', () => {
    const now = new Date('2025-01-15T12:00:00');
    vi.setSystemTime(now);

    const dateStr = '2025-01-15T11:00:00';
    expect(formatRelativeTime(dateStr)).toBe('1시간 전');
  });

  it('should handle edge cases', () => {
    const now = new Date('2025-01-15T12:00:00');
    vi.setSystemTime(now);

    // exactly 1 minute
    const oneMinuteAgo = new Date('2025-01-15T11:59:00');
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1분 전');

    // exactly 1 hour
    const oneHourAgo = new Date('2025-01-15T11:00:00');
    expect(formatRelativeTime(oneHourAgo)).toBe('1시간 전');

    // exactly 1 day
    const oneDayAgo = new Date('2025-01-14T12:00:00');
    expect(formatRelativeTime(oneDayAgo)).toBe('1일 전');
  });
});
