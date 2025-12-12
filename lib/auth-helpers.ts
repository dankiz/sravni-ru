import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      redirect('/admin/login')
    }
    
    return session
  } catch (error) {
    redirect('/admin/login')
  }
}
