import { cookies } from 'next/headers';
import { Header } from '@/widgets/header'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  const isAuthenticated = !!token;
  
  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  )
}

