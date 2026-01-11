import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { cosineSimilarity } from '@/lib/ml-utils'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Fetch all interactions
        const interactions = await (prisma as any).videoInteraction.findMany({
            select: {
                videoId: true,
                userId: true,
                score: true
            }
        })

        if (interactions.length === 0) {
            return NextResponse.json({ message: 'No interactions to train on' })
        }

        // 2. Build Video-User Matrix
        // videoId -> { userId -> score }
        const videoMatrix: Record<string, Record<string, number>> = {}
        const videoIds: string[] = []

            (interactions as any[]).forEach((inter: any) => {
                if (!videoMatrix[inter.videoId]) {
                    videoMatrix[inter.videoId] = {}
                    videoIds.push(inter.videoId)
                }
                videoMatrix[inter.videoId][inter.userId] = inter.score
            })

        // 3. Compute Similarities for all pairs
        const similarities: any[] = []

        for (let i = 0; i < videoIds.length; i++) {
            for (let j = i + 1; j < videoIds.length; j++) {
                const vidA = videoIds[i]
                const vidB = videoIds[j]

                const score = cosineSimilarity(videoMatrix[vidA], videoMatrix[vidB])

                if (score > 0.1) { // Threshold for relevance
                    similarities.push({
                        videoId: vidA,
                        similarVideoId: vidB,
                        score,
                        algorithm: 'collaborative'
                    })
                    // Add symmetric entry
                    similarities.push({
                        videoId: vidB,
                        similarVideoId: vidA,
                        score,
                        algorithm: 'collaborative'
                    })
                }
            }
        }

        // 4. Batch update similarities in DB
        // Clear old collaborative similarities first
        await (prisma as any).videoSimilarity.deleteMany({
            where: { algorithm: 'collaborative' }
        })

        // Use transaction for bulk create
        if (similarities.length > 0) {
            // Split into chunks to avoid potential DB limits
            const chunkSize = 100
            for (let i = 0; i < similarities.length; i += chunkSize) {
                const chunk = similarities.slice(i, i + chunkSize)
                await (prisma as any).videoSimilarity.createMany({
                    data: chunk
                })
            }
        }

        return NextResponse.json({
            message: 'Model trained successfully',
            interactionsCount: interactions.length,
            similaritiesCount: similarities.length
        })
    } catch (error) {
        console.error('Error training ML model:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
