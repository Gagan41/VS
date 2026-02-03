import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const { pathname } = request.nextUrl

    // Protect authenticated routes
    const protectedRoutes = ['/home', '/shorts', '/video', '/profile', '/admin']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Redirect authenticated users away from auth pages and the landing page
    const authRoutes = ['/auth/login', '/auth/register']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    const isLandingPage = pathname === '/'

    if ((isAuthRoute || isLandingPage) && token) {
        return NextResponse.redirect(new URL('/home', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/home/:path*', '/shorts/:path*', '/video/:path*', '/profile/:path*', '/admin/:path*'],
}
