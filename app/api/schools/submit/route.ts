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
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string || null
    const website = formData.get('website') as string || null
    const email = formData.get('email') as string || null
    const contacts = formData.get('contacts') as string || null
    const logoFile = formData.get('logo') as File | null

    // Validate required fields
    if (!submittedByName || !submittedByEmail || !name) {
      return NextResponse.json(
        { message: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = slugify(name)
    let slug = baseSlug
    let counter = 1

    while (await prisma.author.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Handle logo upload
    let logoPath = null
    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filename = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'schools')

      try {
        await mkdir(uploadDir, { recursive: true })
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)
        logoPath = `/uploads/schools/${filename}`
      } catch (error) {
        console.error('Error saving logo:', error)
        // Continue without logo if upload fails
      }
    }

    // Create school/author
    // Note: The Author model doesn't have submittedByName/submittedByEmail fields
    // Schools are created directly without moderation status
    const school = await prisma.author.create({
      data: {
        name,
        slug,
        bio,
        logo: logoPath,
        website,
        email,
        contacts,
      },
    })

    return NextResponse.json({
      message: 'Школа успешно добавлена',
      schoolId: school.id,
      slug: school.slug
    })
  } catch (error) {
    console.error('Error submitting school:', error)
    const errorMessage = error instanceof Error ? error.message : 'Ошибка при добавлении школы'
    return NextResponse.json(
      { message: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    )
  }
}
