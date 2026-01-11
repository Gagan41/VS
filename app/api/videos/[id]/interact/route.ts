import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { calculateInteractionScore } from '@/lib/ml-utils'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: videoId } = await params
        const body = await request.json()
        const { type, value } = body // e.g., type: 'watched', value: true

        // 1. Get existing interaction or create new one
        const interaction = await prisma.videoInteraction.findUnique({
            where: {
                userId_videoId: {
                    userId: user.id,
                    videoId: videoId
                }
            }
        })

        const data: any = {
            userId: user.id,
            videoId: videoId
        }

        if (type) {
            data[type] = value
        }

        // 2. Recalculate score based on all signals
        const updatedSignals = {
            viewed: interaction?.viewed || (type === 'viewed' ? value : false),
            liked: interaction?.liked || (type === 'liked' ? value : false),
            watched: interaction?.watched || (type === 'watched' ? value : false),
            completed: interaction?.completed || (type === 'completed' ? value : false),
            disliked: interaction?.disliked || (type === 'disliked' ? value : false),
            skipped: interaction?.skipped || (type === 'skipped' ? value : false),
            // Override with new value if provided
            ...(type && { [type]: value })
        }

        const newScore = calculateInteractionScore(updatedSignals)

        // 3. Upsert interaction
        const updatedInteraction = await prisma.videoInteraction.upsert({
            where: {
                userId_videoId: {
                    userId: user.id,
                    videoId: videoId
                }
            },
            update: {
                ...updatedSignals,
                score: newScore
            },
            create: {
                ...updatedSignals,
                score: newScore,
                userId: user.id,
                videoId: videoId
            }
        })

        return NextResponse.json(updatedInteraction)
    } catch (error) {
        console.error('Error tracking interaction:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
