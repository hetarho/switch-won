import { useQuery } from '@tanstack/react-query';
import { getOrdersAction } from '@app/actions/order/getOrders';

export function useExchangeOrdersQuery() {
  return useQuery({
    queryKey: ['exchange-orders'],
    queryFn: () => getOrdersAction(),
    staleTime: 30 * 1000, // 30초
    retry: 3,
  });
}

