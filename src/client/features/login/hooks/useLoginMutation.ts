import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginAction } from '@app/actions/auth/login';

export function useLoginMutation() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (email: string) => loginAction({ email }),
    onSuccess: (data) => {
      // memberId를 활용하여 필요한 경우 사용자 정보 저장
      console.log('Logged in with memberId:', data.memberId);
      router.push('/');
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });
}

