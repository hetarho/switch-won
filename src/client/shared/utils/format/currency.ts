export function formatCurrency(
  amount: string | number,
  currency: string
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  const formatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  });

  return formatter.format(numAmount);
}

export function formatAmount(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
}
