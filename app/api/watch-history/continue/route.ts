import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ videos: [] })
        }

        const userId = (session.user as any).id
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // Fetch watch history for videos watched in the last 30 days
        // @ts-ignore
        const continueWatching = await prisma.watchHistory.findMany({
            where: {
                userId,
                lastWatchedAt: { gte: thirtyDaysAgo },
                totalWatchTimeSeconds: { gt: 10 }, // Watched more than 10 seconds
            },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        accessType: true,
                        videoType: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { lastWatchedAt: 'desc' },
            take: 10
        })

        // Filter and limit to 3 videos for the recommendations panel
        const result = continueWatching.slice(0, 3).map((entry: any) => ({
            ...entry.video,
            totalWatchTimeSeconds: entry.totalWatchTimeSeconds
        }))

        return NextResponse.json({ videos: result })
    } catch (error) {
        console.error('Error fetching continue watching:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
