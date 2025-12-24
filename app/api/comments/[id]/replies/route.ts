import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: commentId } = await params

        const replies = await prisma.commentReply.findMany({
            where: { commentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(Array.isArray(replies) ? replies : [])
    } catch (error) {
        console.error('Error fetching replies:', error)
        return NextResponse.json(
            { error: 'Failed to fetch replies' },
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
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = session.user as any
        const { id: commentId } = await params
        const { content, parentId } = await request.json()

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Reply content is required' },
                { status: 400 }
            )
        }

        const reply = await prisma.commentReply.create({
            data: {
                content: content.trim(),
                userId: user.id,
                commentId,
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        return NextResponse.json(reply)
    } catch (error) {
        console.error('Error creating reply:', error)
        return NextResponse.json(
            { error: 'Failed to create reply' },
            { status: 500 }
        )
    }
}
