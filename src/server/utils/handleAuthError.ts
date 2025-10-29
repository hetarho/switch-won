'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * 인증 에러 처리 유틸리티
 * API 응답에서 인증 에러를 감지하고 쿠키를 삭제한 후 로그인 페이지로 리다이렉트합니다.
 * 
 * @returns 인증 에러인 경우 redirect를 호출하여 함수 실행이 중단됩니다.
 */
export async function handleAuthError(response: Response, errorData?: { code?: string; message?: string }): Promise<void> {
  // HTTP 401 상태 코드 또는 UNAUTHORIZED 에러 코드 감지
  const isAuthError = 
    response.status === 401 || 
    errorData?.code === 'UNAUTHORIZED' ||
    errorData?.message?.toLowerCase().includes('unauthorized');

  if (isAuthError) {
    // 쿠키 삭제
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    
    // 로그인 페이지로 리다이렉트 (이 함수는 반환되지 않음)
    redirect('/login');
  }
}

