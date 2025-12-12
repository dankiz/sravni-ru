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
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string || null
    const contacts = formData.get('contacts') as string || null
    const website = formData.get('website') as string || null
    const email = formData.get('email') as string || null
    const legalInfo = formData.get('legalInfo') as string || null
    const logoFile = formData.get('logo') as File | null

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    // Handle logo upload
    let logoPath = null
    if (logoFile && logoFile.size > 0) {
      try {
        const bytes = await logoFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const filename = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'authors')

        await mkdir(uploadDir, { recursive: true })
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)
        logoPath = `/uploads/authors/${filename}`
      } catch (error) {
        console.error('Error saving logo:', error)
        // Continue without logo if upload fails
      }
    }

    // Generate unique slug
    const baseSlug = slugify(name)
    let slug = baseSlug
    let counter = 1
    
    while (await prisma.author.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const author = await prisma.author.create({
      data: {
        name,
        slug,
        bio: bio || null,
        contacts: contacts || null,
        website: website || null,
        email: email || null,
        legalInfo: legalInfo || null,
        logo: logoPath,
      },
    })

    return NextResponse.json({ author })
  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json(
      { message: 'Error creating author' },
      { status: 500 }
    )
  }
}




