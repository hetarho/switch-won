import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  const pathname = request.nextUrl.pathname;

  // 로그인 페이지 경로
  const isLoginPath = pathname === "/login";

  // 로그인 페이지는 먼저 처리
  if (isLoginPath) {
    // 로그인된 상태에서 로그인 페이지 접근 시도
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // 로그인하지 않은 상태면 통과
    return NextResponse.next();
  }

  const protectedPaths = ["/", "/history"];
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // 보호된 페이지 접근 시도
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    // 원래 접근하려던 페이지를 쿼리 파라미터로 저장
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/history", "/login"],
};
