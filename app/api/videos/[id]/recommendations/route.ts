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

        // 1. Get current video info
        const currentVideo = await prisma.video.findUnique({
            where: { id: videoId },
            select: { id: true, videoType: true, accessType: true }
        })

        if (!currentVideo) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // @ts-ignore - Handle possible initial TS lag after refresh
        const mlRecs = await prisma.videoSimilarity.findMany({
            where: {
                videoId: videoId,
                algorithm: 'collaborative'
            },
            orderBy: { score: 'desc' },
            take: 6,
            include: {
                similarVideo: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        accessType: true,
                        videoType: true,
                        // @ts-ignore
                        durationSeconds: true,
                        createdAt: true
                    }
                }
            }
        })

        const mlVideos = mlRecs.map((r: any) => r.similarVideo)

        // 3. Personalized Recommendations (Based on user interests)
        let personalizedVideos: any[] = []
        if (userId) {
            // Find videos liked/watched by the user that they haven't seen yet (or recently)
            // @ts-ignore
            const interactions = await prisma.videoInteraction.findMany({
                where: { userId, score: { gt: 5 } }, // Highly rated by user
                select: { videoId: true },
                take: 10
            })

            const likedIds = interactions.map((i: any) => i.videoId)

            if (likedIds.length > 0) {
                personalizedVideos = await prisma.video.findMany({
                    where: {
                        id: {
                            notIn: [videoId, ...likedIds], // Not current, not already liked
                        },
                        // Similar to what they like
                        // @ts-ignore
                        similarFrom: {
                            some: {
                                videoId: { in: likedIds }
                            }
                        }
                    },
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        accessType: true,
                        videoType: true,
                        // @ts-ignore
                        durationSeconds: true,
                        createdAt: true
                    },
                    take: 4
                })
            }
        }

        // 4. Content-Based Fallback (Same type/access)
        const contentBased = await prisma.video.findMany({
            where: {
                id: { notIn: [videoId, ...mlVideos.map((v: any) => v.id), ...personalizedVideos.map((v: any) => v.id)] },
                videoType: currentVideo.videoType,
                accessType: currentVideo.accessType
            },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                accessType: true,
                videoType: true,
                // @ts-ignore
                durationSeconds: true,
                createdAt: true
            },
            take: 12
        })

        // 5. Merge and Deduplicate
        const combined = [
            ...mlVideos,
            ...personalizedVideos,
            ...contentBased
        ]

        // Shifting/Shuffling slightly for variety
        const unique = Array.from(new Map(combined.map((v: any) => [v.id, v])).values())
        const result = unique.slice(0, 15)

        return NextResponse.json({ recommendations: result })
    } catch (error) {
        console.error('Error in hybrid recommendations API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
