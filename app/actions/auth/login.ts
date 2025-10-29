"use server";

import { cookies } from "next/headers";
import { ApiError } from "@/shared/types";

interface LoginInput {
  email: string;
}

interface LoginOutput {
  memberId: number;
}

export async function loginAction(input: LoginInput): Promise<LoginOutput> {
  // 외부 API 호출
  const response = await fetch(
    `${process.env.API_BASE_URL}/auth/login?email=${input.email}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // 응답을 한 번만 읽기
  const responseData = await response.json();

  if (!response.ok) {
    // 에러 응답 처리
    const errorCode = responseData.code || 'BAD_REQUEST';
    const errorMessage = responseData.message || "로그인에 실패했습니다.";
    throw new ApiError(errorCode, errorMessage, responseData.data || null);
  }

  // ApiResponse 포맷: { code, message, data }
  const { memberId, token } = responseData.data;

  // HTTP-only cookie에 토큰 저장
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: "/",
  });

  return { memberId };
}
