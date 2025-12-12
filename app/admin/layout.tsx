import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-900">
      {session && <AdminNav />}
      <div className={`container mx-auto px-4 ${session ? 'py-8' : ''}`}>
        {children}
      </div>
    </div>
  )
}