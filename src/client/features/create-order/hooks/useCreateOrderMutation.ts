import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrderAction, CreateOrderInput } from "@app/actions/order/createOrder";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrderAction(input),
    onSuccess: () => {
      // 환전 성공 후 지갑 잔액 자동 갱신
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

