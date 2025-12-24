'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function EditVideoPage() {
    const router = useRouter()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnailUrl: '',
        accessType: 'FREE',
        trailerDurationSeconds: 30,
    })

    useEffect(() => {
        if (id) {
            fetchVideo()
        }
    }, [id])

    const fetchVideo = async () => {
        try {
            const response = await fetch(`/api/videos/${id}`)
            if (!response.ok) throw new Error('Failed to fetch video')
            const data = await response.json()
            setFormData({
                title: data.title,
                description: data.description || '',
                thumbnailUrl: data.thumbnailUrl || '',
                accessType: data.accessType,
                trailerDurationSeconds: data.trailerDurationSeconds || 30,
            })
        } catch (error) {
            console.error('Error fetching video:', error)
            toast.error('Failed to load video details')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            let finalThumbnailUrl = formData.thumbnailUrl

            if (thumbnailFile) {
                const thumbFormData = new FormData()
                thumbFormData.append('file', thumbnailFile)
                thumbFormData.append('type', 'thumbnails')

                const thumbResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: thumbFormData,
                })

                if (thumbResponse.ok) {
                    const thumbData = await thumbResponse.json()
                    finalThumbnailUrl = thumbData.url
                }
            }

            const response = await fetch(`/api/videos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    thumbnailUrl: finalThumbnailUrl,
                }),
            })

            if (!response.ok) throw new Error('Failed to update video')

            toast.success('Video updated successfully!')
            router.push('/admin/videos')
        } catch (error) {
            console.error('Error updating video:', error)
            toast.error('Failed to update video')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-3xl mx-auto py-8 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Edit Video</h1>
                    <p className="text-gray-300">Update video details and metadata</p>
                </div>

                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Thumbnail</label>
                        <div className="space-y-3">
                            <input
                                type="url"
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Thumbnail URL"
                            />
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400">Or upload new thumbnail file:</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Access Type *</label>
                        <select
                            value={formData.accessType}
                            onChange={(e) => setFormData({ ...formData, accessType: e.target.value as 'FREE' | 'PREMIUM' })}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="FREE" className="bg-gray-800">Free</option>
                            <option value="PREMIUM" className="bg-gray-800">Premium</option>
                        </select>
                    </div>

                    {formData.accessType === 'PREMIUM' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Trailer Duration (seconds)</label>
                            <input
                                type="number"
                                min="10"
                                max="120"
                                value={formData.trailerDurationSeconds}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value)
                                    setFormData({ ...formData, trailerDurationSeconds: isNaN(val) ? 0 : val })
                                }}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
