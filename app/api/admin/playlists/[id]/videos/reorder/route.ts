import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: playlistId } = await params

    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { videoIds } = body

        if (!Array.isArray(videoIds)) {
            return NextResponse.json({ error: 'Invalid videoIds' }, { status: 400 })
        }

        // Perform bulk update of 'order' sequence
        // We use a transaction to ensure all updates succeed or fail together
        await prisma.$transaction(
            videoIds.map((videoId: string, index: number) =>
                prisma.playlistVideo.update({
                    where: {
                        playlistId_videoId: {
                            playlistId,
                            videoId
                        }
                    },
                    data: { order: index }
                })
            )
        )

        return NextResponse.json({ success: true, count: videoIds.length })
    } catch (error) {
        console.error(`Error reordering playlist ${playlistId}:`, error)
        return NextResponse.json({ error: 'Internal server error during reorder' }, { status: 500 })
    }
}
