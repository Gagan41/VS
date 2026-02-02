import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: videoId } = await params
        const session = await getServerSession(authOptions)
        const userId = (session?.user as any)?.id

        // Get current video info
        const currentVideo = await prisma.video.findUnique({
            where: { id: videoId },
            select: { id: true, videoType: true, accessType: true }
        })

        if (!currentVideo) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Get user's watch history for personalized recommendations
        let watchedVideoIds: string[] = []
        if (userId) {
            const watchHistory = await prisma.watchHistory.findMany({
                where: { userId },
                select: { videoId: true },
                orderBy: { lastWatchedAt: 'desc' },
                take: 10
            })
            watchedVideoIds = watchHistory.map(w => w.videoId)
        }

        // Get videos similar to current video (same type and access)
        const similarVideos = await prisma.video.findMany({
            where: {
                id: { not: videoId },
                videoType: currentVideo.videoType,
                accessType: currentVideo.accessType
            },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                accessType: true,
                videoType: true,
                createdAt: true,
                views: {
                    select: { id: true }
                }
            },
            take: 8,
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Get mixed content (different types)
        const mixedVideos = await prisma.video.findMany({
            where: {
                id: {
                    notIn: [videoId, ...similarVideos.map(v => v.id)]
                }
            },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                accessType: true,
                videoType: true,
                createdAt: true,
                views: {
                    select: { id: true }
                }
            },
            take: 7,
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Combine and add view counts
        const allRecommendations = [...similarVideos, ...mixedVideos].map(video => ({
            id: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            accessType: video.accessType,
            videoType: video.videoType,
            durationSeconds: null, // Not available in schema, set to null
            createdAt: video.createdAt.toISOString(),
            viewCount: video.views.length
        }))

        // Prioritize unwatched videos if user is logged in
        let orderedRecommendations = allRecommendations
        if (userId && watchedVideoIds.length > 0) {
            const unwatched = allRecommendations.filter(v => !watchedVideoIds.includes(v.id))
            const watched = allRecommendations.filter(v => watchedVideoIds.includes(v.id))
            orderedRecommendations = [...unwatched, ...watched]
        }

        // Return top 15 recommendations
        const result = orderedRecommendations.slice(0, 15)

        return NextResponse.json({ recommendations: result })
    } catch (error) {
        console.error('Error in recommendations API:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
