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
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
      },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error rejecting review:', error)
    return NextResponse.json(
      { message: 'Error rejecting review' },
      { status: 500 }
    )
  }
}





