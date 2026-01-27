import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { url, type = 'videos' } = await request.json()

        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
        }

        // Fetch the remote file
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch from URL: ${response.statusText}`)
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        const resourceType = type === 'videos' ? 'video' : 'image'

        // Upload to Cloudinary instead of local FS
        const result = await uploadToCloudinary(buffer, type, resourceType)

        return NextResponse.json({
            url: result.url,
            publicId: result.publicId
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error in remote upload:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
