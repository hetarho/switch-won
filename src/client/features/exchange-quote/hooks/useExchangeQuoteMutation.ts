import { useMutation } from '@tanstack/react-query';
import { getQuoteAction, GetQuoteInput } from '@app/actions/order/getQuote';

export function useExchangeQuoteMutation() {
  return useMutation({
    mutationFn: (input: GetQuoteInput) => getQuoteAction(input),
  });
}
