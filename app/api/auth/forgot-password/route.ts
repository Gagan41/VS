import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

        // Save token to user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        })

        // Send email
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

        await resend.emails.send({
            from: 'Kushal Stream <onboarding@resend.dev>', // Update this with your verified domain
            to: email,
            subject: 'Reset your password',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset Your Password</h2>
                    <p>You requested a password reset for your Kushal Stream account.</p>
                    <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                        Reset Password
                    </a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        })

        return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })

    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        )
    }
}
