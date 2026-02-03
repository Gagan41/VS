import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = session.user as any
        const { id: replyId } = await params

        // Check if reply exists and belongs to user
        const reply = await prisma.commentReply.findUnique({
            where: { id: replyId }
        })

        if (!reply) {
            return NextResponse.json(
                { error: 'Reply not found' },
                { status: 404 }
            )
        }

        if (reply.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        // Delete reply (nested replies will cascade delete)
        await prisma.commentReply.delete({
            where: { id: replyId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting reply:', error)
        return NextResponse.json(
            { error: 'Failed to delete reply' },
            { status: 500 }
        )
    }
}
