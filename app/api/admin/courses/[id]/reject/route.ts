import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
      },
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error rejecting course:', error)
    return NextResponse.json(
      { message: 'Error rejecting course' },
      { status: 500 }
    )
  }
}





