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
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-3xl mx-auto py-8 text-black dark:text-white">
                <div className="mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
                    <h1 className="text-4xl font-black mb-2">Edit Video</h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Update video details and metadata</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-2xl p-8 space-y-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">Description</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">Thumbnail</label>
                        <div className="space-y-4">
                            <input
                                type="url"
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Thumbnail URL"
                            />
                            <div className="space-y-3 p-4 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">Or upload new thumbnail file:</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-700 text-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-black hover:file:bg-primary/90"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">Access Type *</label>
                        <select
                            value={formData.accessType}
                            onChange={(e) => setFormData({ ...formData, accessType: e.target.value as 'FREE' | 'PREMIUM' })}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                        >
                            <option value="FREE" className="bg-white dark:bg-zinc-800 text-black dark:text-white">Free</option>
                            <option value="PREMIUM" className="bg-white dark:bg-zinc-800 text-black dark:text-white">Premium</option>
                        </select>
                    </div>

                    {formData.accessType === 'PREMIUM' && (
                        <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl">
                            <label className="block text-sm font-bold text-black mb-2">Trailer Duration (seconds)</label>
                            <input
                                type="number"
                                min="10"
                                max="120"
                                value={formData.trailerDurationSeconds}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value)
                                    setFormData({ ...formData, trailerDurationSeconds: isNaN(val) ? 0 : val })
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3.5 px-6 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 uppercase tracking-wider text-sm disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white font-black rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all uppercase tracking-wider text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
