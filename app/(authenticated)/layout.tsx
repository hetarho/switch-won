import { Header } from '@/widgets/header'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header isAuthenticated={true} />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  )
}

