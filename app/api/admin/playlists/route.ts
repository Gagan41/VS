import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const playlists = await prisma.playlist.findMany({
            include: {
                _count: {
                    select: {
                        videos: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(playlists)
    } catch (error) {
        console.error('Error fetching playlists:', error)
        return NextResponse.json(
            { error: 'Failed to fetch playlists' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { title, description, thumbnailUrl } = await request.json()

        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            )
        }

        const playlist = await prisma.playlist.create({
            data: {
                title,
                description,
                thumbnailUrl: thumbnailUrl || null,
                createdById: user.id
            }
        })

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('Error creating playlist:', error)
        return NextResponse.json(
            { error: 'Failed to create playlist' },
            { status: 500 }
        )
    }
}
