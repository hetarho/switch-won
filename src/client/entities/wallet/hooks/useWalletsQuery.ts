import { getWalletsAction } from '@app/actions/wallet/getWallets';
import { useQuery } from '@tanstack/react-query';

export function useWalletsQuery() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => getWalletsAction(),
    staleTime: 30 * 1000, // 30초
    retry: 3,
  });
}
