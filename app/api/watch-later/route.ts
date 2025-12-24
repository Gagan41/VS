import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = session.user as any

        const watchLater = await prisma.watchLater.findMany({
            where: { userId: user.id },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        videoType: true,
                        accessType: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { addedAt: 'desc' }
        })

        return NextResponse.json(watchLater)
    } catch (error) {
        console.error('Error fetching watch later:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = session.user as any
        const { videoId } = await request.json()

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
        }

        const watchLater = await prisma.watchLater.upsert({
            where: {
                userId_videoId: {
                    userId: user.id,
                    videoId
                }
            },
            create: {
                userId: user.id,
                videoId
            },
            update: {} // No update needed if it exists
        })

        return NextResponse.json(watchLater, { status: 201 })
    } catch (error) {
        console.error('Error adding to watch later:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
