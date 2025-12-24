import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: playlistId } = await params
        const { videoId } = await request.json()

        if (!videoId) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            )
        }

        // Check if video already in playlist
        const existing = await prisma.playlistVideo.findUnique({
            where: {
                playlistId_videoId: {
                    playlistId,
                    videoId
                }
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Video already in playlist' },
                { status: 400 }
            )
        }

        // Get current max order
        const maxOrder = await prisma.playlistVideo.findFirst({
            where: { playlistId },
            orderBy: { order: 'desc' },
            select: { order: true }
        })

        const newOrder = (maxOrder?.order ?? -1) + 1

        const playlistVideo = await prisma.playlistVideo.create({
            data: {
                playlistId,
                videoId,
                order: newOrder
            },
            include: {
                video: true
            }
        })

        return NextResponse.json(playlistVideo)
    } catch (error) {
        console.error('Error adding video to playlist:', error)
        return NextResponse.json(
            { error: 'Failed to add video to playlist' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: playlistId } = await params
        const { searchParams } = new URL(request.url)
        const videoId = searchParams.get('videoId')

        if (!videoId) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            )
        }

        await prisma.playlistVideo.delete({
            where: {
                playlistId_videoId: {
                    playlistId,
                    videoId
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error removing video from playlist:', error)
        return NextResponse.json(
            { error: 'Failed to remove video from playlist' },
            { status: 500 }
        )
    }
}
