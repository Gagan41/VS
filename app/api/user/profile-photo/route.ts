import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Get current user to see if we need to delete old photo
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (dbUser?.image && dbUser.image.startsWith('/uploads/profile/')) {
            const oldFilePath = path.join(process.cwd(), 'public', dbUser.image)
            if (existsSync(oldFilePath)) {
                await unlink(oldFilePath).catch(err => console.error('Failed to delete old photo:', err))
            }
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${user.id}_${Date.now()}.jpg`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile')

        await mkdir(uploadDir, { recursive: true })
        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, buffer)

        const fileUrl = `/uploads/profile/${filename}`

        await prisma.user.update({
            where: { id: user.id },
            data: { image: fileUrl }
        })

        return NextResponse.json({ url: fileUrl })
    } catch (error) {
        console.error('Error uploading profile photo:', error)
        return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (dbUser?.image && dbUser.image.startsWith('/uploads/profile/')) {
            const filePath = path.join(process.cwd(), 'public', dbUser.image)
            if (existsSync(filePath)) {
                await unlink(filePath).catch(err => console.error('Failed to delete photo from disk:', err))
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { image: null }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting profile photo:', error)
        return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
    }
}
