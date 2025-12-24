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

        const formData = await request.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string || 'videos' // 'videos' or 'thumbnails'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = Date.now() + '_' + file.name.replace(/\s/g, '_')

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', type)
        await mkdir(uploadDir, { recursive: true })

        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, buffer)

        const fileUrl = `/uploads/${type}/${filename}`

        return NextResponse.json({ url: fileUrl }, { status: 201 })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
