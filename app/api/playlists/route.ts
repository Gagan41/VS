import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user as any

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')

        const where: any = {
            OR: [
                { createdBy: { role: 'ADMIN' } },
                { createdById: user.id }
            ]
        }

        if (q) {
            where.AND = [
                {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } }
                    ]
                }
            ]
        }

        const playlists = await prisma.playlist.findMany({
            where,
            include: {
                createdBy: {
                    select: {
                        role: true
                    }
                },
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
