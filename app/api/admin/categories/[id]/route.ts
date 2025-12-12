import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    const existingCategory = await prisma.category.findUnique({ 
      where: { id: params.id } 
    })

    if (!existingCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    // Generate slug if name changed
    let slug = existingCategory.slug
    if (name !== existingCategory.name) {
      const baseSlug = slugify(name)
      slug = baseSlug
      let counter = 1
      
      while (await prisma.category.findFirst({ 
        where: { 
          slug,
          id: { not: params.id }
        } 
      })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description: description || null,
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { message: 'Error updating category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if category has published courses
    const courseCount = await prisma.course.count({
      where: {
        categoryId: params.id,
        status: 'APPROVED',
      },
    })

    if (courseCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category with published courses' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { message: 'Error deleting category' },
      { status: 500 }
    )
  }
}





