import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = session.user as any
        const { id: videoId } = await params

        const watchLater = await prisma.watchLater.findUnique({
            where: {
                userId_videoId: {
                    userId: user.id,
                    videoId
                }
            }
        })

        return NextResponse.json({ exists: !!watchLater })
    } catch (error) {
        console.error('Error checking watch later:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = session.user as any
        const { id: videoId } = await params

        await prisma.watchLater.delete({
            where: {
                userId_videoId: {
                    userId: user.id,
                    videoId
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error removing from watch later:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
