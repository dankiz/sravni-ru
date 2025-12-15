import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const { categoryIds } = await request.json()

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { message: 'categoryIds must be an array' },
        { status: 400 }
      )
    }

    // Update order for each category
    const updatePromises = categoryIds.map((id: string, index: number) =>
      prisma.category.update({
        where: { id },
        data: { order: index },
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: 'Category order updated successfully',
    })
  } catch (error) {
    console.error('Error updating category order:', error)
    return NextResponse.json(
      { message: 'Failed to update category order' },
      { status: 500 }
    )
  }
}
