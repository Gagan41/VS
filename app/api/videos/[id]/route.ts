import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        // Allow public access for viewing videos (trailers for free users)
        const video = await prisma.video.findUnique({
            where: { id },
        })

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        return NextResponse.json(video)
    } catch (error) {
        console.error('Error fetching video:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Cleanup Cloudinary assets if URLs are being updated
        const existingVideo = await prisma.video.findUnique({ where: { id } })
        if (existingVideo) {
            // Cleanup Old Video
            if (body.videoUrl && body.videoUrl !== existingVideo.videoUrl) {
                const publicId = extractPublicId(existingVideo.videoUrl)
                if (publicId) await deleteFromCloudinary(publicId, 'video').catch(() => { })
            }
            // Cleanup Old Thumbnail
            if (body.thumbnailUrl && body.thumbnailUrl !== existingVideo.thumbnailUrl) {
                const publicId = extractPublicId(existingVideo.thumbnailUrl || '')
                if (publicId) await deleteFromCloudinary(publicId, 'image').catch(() => { })
            }
        }

        const video = await prisma.video.update({
            where: { id },
            data: body,
        })

        return NextResponse.json(video)
    } catch (error) {
        console.error('Error updating video:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const video = await prisma.video.findUnique({ where: { id } })
        if (video) {
            // Delete Video from Cloudinary
            const videoPublicId = extractPublicId(video.videoUrl)
            if (videoPublicId) await deleteFromCloudinary(videoPublicId, 'video').catch(() => { })

            // Delete Thumbnail from Cloudinary
            const thumbPublicId = extractPublicId(video.thumbnailUrl || '')
            if (thumbPublicId) await deleteFromCloudinary(thumbPublicId, 'image').catch(() => { })
        }

        await prisma.video.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Video deleted successfully' })
    } catch (error) {
        console.error('Error deleting video:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
