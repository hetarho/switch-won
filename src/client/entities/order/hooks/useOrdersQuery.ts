import { useQuery } from "@tanstack/react-query";
import { getOrdersAction } from "@app/actions/order/getOrders";

export function useOrdersQuery(offset: number = 0, limit: number = 10) {
  return useQuery({
    queryKey: ["orders", offset, limit],
    queryFn: () => getOrdersAction(offset, limit),
    staleTime: 30 * 1000, // 30초
    retry: 3,
  });
}
