import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.startsWith('video/') && type === 'videos') {
            // Some URLs might not provide content-type correctly, but we should be careful
            console.warn('Warning: Content type might not be a video:', contentType)
        }

        const buffer = Buffer.from(await response.arrayBuffer())

        // Extract filename from URL or generate one
        let filename = url.split('/').pop()?.split('?')[0] || `remote_${Date.now()}.mp4`
        if (!filename.includes('.')) filename += '.mp4'
        filename = `${Date.now()}_${filename.replace(/\s/g, '_')}`

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', type)
        await mkdir(uploadDir, { recursive: true })

        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, buffer)

        const fileUrl = `/uploads/${type}/${filename}`

        return NextResponse.json({ url: fileUrl, filename }, { status: 201 })
    } catch (error: any) {
        console.error('Error in remote upload:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
