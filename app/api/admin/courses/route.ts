import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string || null
    const link = formData.get('link') as string
    const imageFile = formData.get('image') as File | null
    const priceStr = formData.get('price') as string
    const price = priceStr && priceStr !== '' ? parseFloat(priceStr) : null
    const pricePerLessonStr = formData.get('pricePerLesson') as string
    const pricePerLesson = pricePerLessonStr && pricePerLessonStr !== '' ? parseFloat(pricePerLessonStr) : null
    const pricePerMonthStr = formData.get('pricePerMonth') as string
    const pricePerMonth = pricePerMonthStr && pricePerMonthStr !== '' ? parseFloat(pricePerMonthStr) : null
    const priceOneTimeStr = formData.get('priceOneTime') as string
    const priceOneTime = priceOneTimeStr && priceOneTimeStr !== '' ? parseFloat(priceOneTimeStr) : null
    const priceTypeStr = formData.get('priceType') as string || null
    const priceType = priceTypeStr && ['PER_LESSON', 'PER_MONTH', 'ONE_TIME'].includes(priceTypeStr) 
      ? priceTypeStr as 'PER_LESSON' | 'PER_MONTH' | 'ONE_TIME'
      : null
    const duration = formData.get('duration') as string || null
    const contacts = formData.get('contacts') as string || null
    const pros = formData.get('pros') as string || null
    const cons = formData.get('cons') as string || null
    const authorId = formData.get('authorId') as string
    const categoryId = formData.get('categoryId') as string || null
    const status = formData.get('status') as string || 'PENDING'
    const tagIdsStr = formData.get('tagIds') as string
    const tagIds = tagIdsStr ? JSON.parse(tagIdsStr) : []

    if (!title || !link || !authorId) {
      return NextResponse.json(
        { message: 'Title, link and author are required' },
        { status: 400 }
      )
    }

    // Handle image upload
    let imagePath = null
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'courses')
        
        await mkdir(uploadDir, { recursive: true })
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)
        imagePath = `/uploads/courses/${filename}`
      } catch (error) {
        console.error('Error saving image:', error)
        // Continue without image if upload fails
      }
    }

    // Generate unique slug
    const baseSlug = slugify(title)
    let slug = baseSlug
    let counter = 1

    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description: description || null,
        link,
        image: imagePath,
        price: price || null,
        pricePerLesson: pricePerLesson || null,
        pricePerMonth: pricePerMonth || null,
        priceOneTime: priceOneTime || null,
        priceType: priceType || null,
        duration: duration || null,
        contacts: contacts || null,
        pros: pros || null,
        cons: cons || null,
        authorId,
        categoryId: categoryId || null,
        status: status || 'PENDING',
        publishedAt: status === 'APPROVED' ? new Date() : null,
        tags: {
          create: (tagIds || []).map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { message: 'Error creating course' },
      { status: 500 }
    )
  }
}



