import { getExchangeRatesAction } from '@app/actions/exchange-rate/getExchangeRates';
import { useQuery } from '@tanstack/react-query';

export function useExchangeRatesQuery() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => getExchangeRatesAction(),
    staleTime: 60 * 1000, // 1분
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
    refetchOnWindowFocus: true,
    retry: 3,
  });
}
