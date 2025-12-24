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
        const user = session?.user as any

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: playlistId } = await params

        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            include: {
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

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('Error fetching playlist:', error)
        return NextResponse.json(
            { error: 'Failed to fetch playlist' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: playlistId } = await params
        const { title, description, thumbnailUrl } = await request.json()

        const playlist = await prisma.playlist.update({
            where: { id: playlistId },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(thumbnailUrl !== undefined && { thumbnailUrl })
            }
        })

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('Error updating playlist:', error)
        return NextResponse.json(
            { error: 'Failed to update playlist' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: playlistId } = await params
        const { title, description, thumbnailUrl } = await request.json()

        const playlist = await prisma.playlist.update({
            where: { id: playlistId },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(thumbnailUrl !== undefined && { thumbnailUrl })
            }
        })

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('Error updating playlist:', error)
        return NextResponse.json(
            { error: 'Failed to update playlist' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id: playlistId } = await params

        await prisma.playlist.delete({
            where: { id: playlistId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting playlist:', error)
        return NextResponse.json(
            { error: 'Failed to delete playlist' },
            { status: 500 }
        )
    }
}
