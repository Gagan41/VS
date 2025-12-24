import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

        await prisma.video.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Video deleted successfully' })
    } catch (error) {
        console.error('Error deleting video:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
