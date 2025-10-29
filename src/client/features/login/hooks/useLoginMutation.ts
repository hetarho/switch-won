import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '@app/actions/auth/login';

export function useLoginMutation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: (email: string) => loginAction({ email }),
    onSuccess: (data) => {
      // memberId를 활용하여 필요한 경우 사용자 정보 저장
      console.log('Logged in with memberId:', data.memberId);
      // 원래 접근하려던 페이지로 리다이렉트
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });
}
