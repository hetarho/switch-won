import { Header } from '@/widgets/header'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header isAuthenticated={false} />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  )
}

