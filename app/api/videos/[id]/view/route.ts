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

        const viewCount = await prisma.view.count({
            where: { videoId }
        })

        return NextResponse.json({ viewCount })
    } catch (error) {
        console.error('Error fetching view count:', error)
        return NextResponse.json(
            { error: 'Failed to fetch view count' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id: videoId } = await params
        const user = session?.user as any

        if (user) {
            const existingView = await prisma.view.findFirst({
                where: {
                    userId: user.id,
                    videoId
                }
            })

            if (!existingView) {
                await prisma.view.create({
                    data: {
                        videoId,
                        userId: user.id
                    }
                })
            }
        } else {
            // Create a view record for anonymous users
            await prisma.view.create({
                data: {
                    videoId,
                    userId: null
                }
            })
        }

        // Get updated view count
        const viewCount = await prisma.view.count({
            where: { videoId }
        })

        return NextResponse.json({ viewCount })
    } catch (error) {
        console.error('Error recording view:', error)
        return NextResponse.json(
            { error: 'Failed to record view' },
            { status: 500 }
        )
    }
}
