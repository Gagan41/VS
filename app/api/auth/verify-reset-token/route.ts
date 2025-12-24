import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { resetToken: token }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 400 }
            )
        }

        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return NextResponse.json(
                { error: 'Token has expired' },
                { status: 400 }
            )
        }

        return NextResponse.json({ valid: true })

    } catch (error) {
        console.error('Verify token error:', error)
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
