import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const submittedByName = formData.get('submittedByName') as string
    const submittedByEmail = formData.get('submittedByEmail') as string
    const title = formData.get('title') as string
    const authorId = formData.get('authorId') as string || null
    const link = formData.get('link') as string
    const description = formData.get('description') as string || null
    const contacts = formData.get('contacts') as string || null
    const pros = formData.get('pros') as string || null
    const cons = formData.get('cons') as string || null
    const priceStr = formData.get('price') as string
    const price = priceStr && priceStr !== '' ? parseFloat(priceStr) : null
    const imageFile = formData.get('image') as File | null
    const categoryId = formData.get('categoryId') as string || null

    // Validate required fields
    if (!submittedByName || !submittedByEmail || !title || !link) {
      return NextResponse.json(
        { message: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    // Validate that authorId is provided
    if (!authorId) {
      return NextResponse.json(
        { message: 'Необходимо выбрать школу' },
        { status: 400 }
      )
    }

    // Validate categoryId if provided
    let validCategoryId = null
    if (categoryId && categoryId !== '' && categoryId !== 'null' && categoryId !== 'undefined') {
      try {
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        })
        if (category) {
          validCategoryId = categoryId
        }
      } catch (error) {
        console.error('Error validating category:', error)
        // Continue without category if validation fails
      }
    }

    // Handle image upload
    let imagePath = null
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'courses')
      
      try {
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

    // Find author
    const author = await prisma.author.findUnique({
      where: { id: authorId },
    })

    if (!author) {
      return NextResponse.json(
        { message: 'Выбранная школа не найдена' },
        { status: 400 }
      )
    }

    // Create course with PENDING status
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        link,
        description,
        contacts,
        pros,
        cons,
        price,
        image: imagePath,
        submittedByName,
        submittedByEmail,
        status: 'PENDING',
        authorId: author.id,
        categoryId: validCategoryId,
      },
    })

    return NextResponse.json({ 
      message: 'Курс успешно отправлен на модерацию',
      courseId: course.id 
    })
  } catch (error) {
    console.error('Error submitting course:', error)
    const errorMessage = error instanceof Error ? error.message : 'Ошибка при отправке курса'
    return NextResponse.json(
      { message: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    )
  }
}
