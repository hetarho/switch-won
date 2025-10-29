import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/widgets/header";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    redirect("/login");
  }

  return (
    <>
      <Header isAuthenticated={true} />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  );
}
