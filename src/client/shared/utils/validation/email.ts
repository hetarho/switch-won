export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email) {
    return { isValid: false, message: '이메일을 입력해주세요.' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, message: '유효한 이메일 주소를 입력해주세요.' };
  }
  
  return { isValid: true };
}

