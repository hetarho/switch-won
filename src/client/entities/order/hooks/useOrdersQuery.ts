import { useQuery } from "@tanstack/react-query";
import { getOrdersAction } from "@app/actions/order/getOrders";

export function useOrdersQuery() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrdersAction(),
    staleTime: 30 * 1000, // 30초
    retry: 3,
  });
}
