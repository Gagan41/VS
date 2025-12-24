'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function NewVideoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [inputType, setInputType] = useState<'URL' | 'FILE'>('URL')
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        accessType: 'FREE',
        trailerDurationSeconds: 30,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let finalVideoUrl = formData.videoUrl

            if (inputType === 'FILE' && videoFile) {
                const uploadFormData = new FormData()
                uploadFormData.append('file', videoFile)
                uploadFormData.append('type', 'videos')

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                })

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload video file')
                }

                const uploadData = await uploadResponse.json()
                finalVideoUrl = uploadData.url
            }

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

            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    videoUrl: finalVideoUrl,
                    thumbnailUrl: finalThumbnailUrl,
                    videoType: 'LONG',
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create video')
            }

            toast.success('Video uploaded successfully!')
            router.push('/admin/videos')
        } catch (error) {
            console.error('Error creating video:', error)
            toast.error('Failed to upload video')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-3xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Upload New Video</h1>
                    <p className="text-gray-300">Add a new long-form video to your platform</p>
                </div>

                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter video title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter video description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Video Source *
                        </label>
                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setInputType('URL')}
                                className={`px-4 py-2 rounded-lg transition ${inputType === 'URL' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                            >
                                Video URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('FILE')}
                                className={`px-4 py-2 rounded-lg transition ${inputType === 'FILE' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                            >
                                Upload File
                            </button>
                        </div>

                        {inputType === 'URL' ? (
                            <>
                                <input
                                    key="url-input"
                                    type="url"
                                    required={inputType === 'URL'}
                                    value={formData.videoUrl}
                                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://youtube.com/watch?v=... or direct video URL"
                                />
                                <p className="text-sm text-gray-400 mt-1">
                                    YouTube unlisted URL, external URL, or direct video file URL
                                </p>
                            </>
                        ) : (
                            <>
                                <input
                                    key="file-input"
                                    type="file"
                                    accept="video/*"
                                    required={inputType === 'FILE'}
                                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                />
                                <p className="text-sm text-gray-400 mt-1">
                                    Upload a video file from your device (max 100MB recommended)
                                </p>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Thumbnail (URL or Upload File)
                        </label>
                        <div className="space-y-3">
                            <input
                                type="url"
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="https://example.com/thumbnail.jpg"
                            />
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400">Or upload a thumbnail file:</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                />
                                {thumbnailFile && (
                                    <p className="text-xs text-green-400 font-semibold">
                                        Selected: {thumbnailFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            Access Type *
                        </label>
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
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                                Trailer Duration (seconds)
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="120"
                                value={formData.trailerDurationSeconds}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value)
                                    setFormData({ ...formData, trailerDurationSeconds: isNaN(val) ? 0 : val })
                                }}
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-sm text-gray-400 mt-1">
                                Free users will see the first {formData.trailerDurationSeconds} seconds as a trailer
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Uploading...' : 'Upload Video'}
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
