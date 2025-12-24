import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // 'LONG' or 'SHORT'
        const accessType = searchParams.get('accessType') // 'FREE' or 'PREMIUM'
        const user = session.user as any

        const where: any = {}
        if (type) {
            where.videoType = type
        }
        if (accessType) {
            where.accessType = accessType
        }

        // If user is not premium, they can only see free shorts in shorts feed
        // But they can see all videos in the home feed (they'll get trailers for premium)
        if (type === 'SHORT' && user.subscriptionStatus !== 'ACTIVE') {
            where.accessType = 'FREE'
        }

        const videos = await prisma.video.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                description: true,
                videoType: true,
                accessType: true,
                videoUrl: true,
                thumbnailUrl: true,
                trailerDurationSeconds: true,
                createdAt: true,
            },
        })

        return NextResponse.json(videos)
    } catch (error) {
        console.error('Error fetching videos:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, videoType, accessType, videoUrl, thumbnailUrl, trailerDurationSeconds } = body

        if (!title || !videoType || !accessType || !videoUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const video = await prisma.video.create({
            data: {
                title,
                description: description || '',
                videoType,
                accessType,
                videoUrl,
                thumbnailUrl,
                trailerDurationSeconds: accessType === 'PREMIUM' ? (trailerDurationSeconds || 30) : null,
                createdById: (session.user as any).id,
            },
        })

        return NextResponse.json(video, { status: 201 })
    } catch (error) {
        console.error('Error creating video:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
