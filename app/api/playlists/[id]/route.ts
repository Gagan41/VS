import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any
        const { id: playlistId } = await params

        // Fetch playlist with videos
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                videos: {
                    include: {
                        video: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                thumbnailUrl: true,
                                videoType: true,
                                accessType: true
                            }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!playlist) {
            return NextResponse.json(
                { error: 'Playlist not found' },
                { status: 404 }
            )
        }

        // Check if user can access this playlist
        // Allow if: admin playlist, or user's own playlist, or authenticated user viewing any playlist
        const isAdminPlaylist = playlist.createdBy.role === 'ADMIN'
        const isOwnPlaylist = user && playlist.createdById === user.id
        const isAuthenticated = !!user

        if (!isAdminPlaylist && !isOwnPlaylist && !isAuthenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('Error fetching playlist:', error)
        return NextResponse.json(
            { error: 'Failed to fetch playlist' },
            { status: 500 }
        )
    }
}
