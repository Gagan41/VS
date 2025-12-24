import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        // Check if user is admin
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30d'

        // Calculate date range
        const now = new Date()
        let startDate = new Date()

        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7)
                break
            case '30d':
                startDate.setDate(now.getDate() - 30)
                break
            case '90d':
                startDate.setDate(now.getDate() - 90)
                break
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1)
                break
            default:
                startDate.setDate(now.getDate() - 30)
        }

        // Get views grouped by date
        const views = await prisma.view.findMany({
            where: {
                viewedAt: {
                    gte: startDate
                }
            },
            select: {
                viewedAt: true
            }
        })

        // Group views by date
        const viewsByDate: { [key: string]: number } = {}
        views.forEach(view => {
            const date = view.viewedAt.toISOString().split('T')[0]
            viewsByDate[date] = (viewsByDate[date] || 0) + 1
        })

        // Convert to array format for charts
        const dailyViews = Object.entries(viewsByDate).map(([date, count]) => ({
            date,
            views: count
        })).sort((a, b) => a.date.localeCompare(b.date))

        // Get top videos by view count
        const topVideos = await prisma.video.findMany({
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                _count: {
                    select: {
                        views: true
                    }
                }
            },
            orderBy: {
                views: {
                    _count: 'desc'
                }
            },
            take: 10
        })

        // Format top videos
        const formattedTopVideos = topVideos.map(video => ({
            id: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            views: video._count.views
        }))

        // Get total views
        const totalViews = await prisma.view.count()

        return NextResponse.json({
            dailyViews,
            topVideos: formattedTopVideos,
            totalViews,
            period
        })
    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        )
    }
}
