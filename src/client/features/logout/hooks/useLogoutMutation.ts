import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@app/actions/auth/logout';

export function useLogoutMutation() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      router.push('/login');
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error.message);
    },
  });
}

