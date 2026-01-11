import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        const body = await request.json()
        const { experimentId, variant, action, videoId } = body

        if (!experimentId || !variant || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // For now, we logging these to the console and in a future step 
        // we can create an 'AnalyticsEvent' model in Prisma if needed.
        // Given we already have VideoInteraction for ML, we'll leverage that for 'watch' and 'click'
        console.log(`[ANALYTICS] Experiment: ${experimentId}, Variant: ${variant}, Action: ${action}, User: ${user?.id || 'GUEST'}, Video: ${videoId || 'N/A'}`)

        // If it's a click or watch, let's treat it as a subtle interaction for the ML model too
        if (user && videoId && (action === 'click' || action === 'watch')) {
            await (prisma as any).videoInteraction.upsert({
                where: {
                    userId_videoId: {
                        userId: user.id,
                        videoId: videoId
                    }
                },
                update: {
                    viewed: true,
                    // Slightly increase score for clicks
                    score: { increment: 1 }
                },
                create: {
                    userId: user.id,
                    videoId: videoId,
                    viewed: true,
                    score: 1
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error tracking analytics:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
