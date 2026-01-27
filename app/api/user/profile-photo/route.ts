import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

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

        // Validate image type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only JPG, PNG and WEBP are allowed.'
            }, { status: 400 })
        }

        // Get current user to delete old photo from Cloudinary
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (dbUser?.image) {
            const publicId = extractPublicId(dbUser.image)
            if (publicId) {
                await deleteFromCloudinary(publicId, 'image').catch(err =>
                    console.error('Failed to delete old Cloudinary photo:', err)
                )
            }
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await uploadToCloudinary(buffer, 'profiles', 'image')

        await prisma.user.update({
            where: { id: user.id },
            data: { image: result.url }
        })

        return NextResponse.json({ url: result.url })
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

        if (dbUser?.image) {
            const publicId = extractPublicId(dbUser.image)
            if (publicId) {
                await deleteFromCloudinary(publicId, 'image').catch(err =>
                    console.error('Failed to delete Cloudinary photo:', err)
                )
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
