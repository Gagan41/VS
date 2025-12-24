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
        const { id: videoId } = await params

        // Get like/dislike counts
        const likes = await prisma.like.count({
            where: { videoId, isLike: true }
        })

        const dislikes = await prisma.like.count({
            where: { videoId, isLike: false }
        })

        // Get user's like status if authenticated
        let userLikeStatus: 'like' | 'dislike' | null = null
        if (session?.user) {
            const user = session.user as any
            const userLike = await prisma.like.findUnique({
                where: {
                    userId_videoId: {
                        userId: user.id,
                        videoId
                    }
                }
            })
            if (userLike) {
                userLikeStatus = userLike.isLike ? 'like' : 'dislike'
            }
        }

        return NextResponse.json({
            likes,
            dislikes,
            userLikeStatus
        })
    } catch (error) {
        console.error('Error fetching likes:', error)
        return NextResponse.json(
            { error: 'Failed to fetch likes' },
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
        const { id: videoId } = await params
        const { isLike } = await request.json()

        // Check if user already liked/disliked this video
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_videoId: {
                    userId: user.id,
                    videoId
                }
            }
        })

        if (existingLike) {
            // If clicking the same button, remove the like/dislike
            if (existingLike.isLike === isLike) {
                await prisma.like.delete({
                    where: {
                        userId_videoId: {
                            userId: user.id,
                            videoId
                        }
                    }
                })
            } else {
                // If clicking the opposite button, update
                await prisma.like.update({
                    where: {
                        userId_videoId: {
                            userId: user.id,
                            videoId
                        }
                    },
                    data: { isLike }
                })
            }
        } else {
            // Create new like/dislike
            await prisma.like.create({
                data: {
                    userId: user.id,
                    videoId,
                    isLike
                }
            })
        }

        // Get updated counts
        const likes = await prisma.like.count({
            where: { videoId, isLike: true }
        })

        const dislikes = await prisma.like.count({
            where: { videoId, isLike: false }
        })

        // Get updated user status
        const updatedLike = await prisma.like.findUnique({
            where: {
                userId_videoId: {
                    userId: user.id,
                    videoId
                }
            }
        })

        const userLikeStatus = updatedLike
            ? (updatedLike.isLike ? 'like' : 'dislike')
            : null

        return NextResponse.json({
            likes,
            dislikes,
            userLikeStatus
        })
    } catch (error) {
        console.error('Error toggling like:', error)
        return NextResponse.json(
            { error: 'Failed to toggle like' },
            { status: 500 }
        )
    }
}
