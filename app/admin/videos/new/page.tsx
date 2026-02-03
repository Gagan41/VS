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
        <div className="p-4 sm:p-6 lg:p-8 bg-transparent">
            <main className="max-w-3xl mx-auto py-6">
                <div className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">Upload New Video</h1>
                    <p className="text-gray-600 dark:text-gray-400">Add a new long-form video to your platform</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-6 md:p-8 space-y-5 border border-gray-200 dark:border-white/10 shadow-sm">
                    {/* Title Field */}
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">
                            Video Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Enter a descriptive video title"
                        />
                    </div>

                    {/* Description Field */}
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                            placeholder="What is this video about?"
                        />
                    </div>

                    {/* Video Source Section */}
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-3">
                            Video Source *
                        </label>

                        {/* Source Type Toggle */}
                        <div className="flex gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setInputType('URL')}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all shadow-sm ${inputType === 'URL'
                                    ? 'bg-primary text-black'
                                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                External Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('FILE')}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all shadow-sm ${inputType === 'FILE'
                                    ? 'bg-primary text-black'
                                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                Local Upload
                            </button>
                        </div>

                        {/* URL Input */}
                        {inputType === 'URL' ? (
                            <div className="space-y-2">
                                <input
                                    key="url-input"
                                    type="url"
                                    required={inputType === 'URL'}
                                    value={formData.videoUrl}
                                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                />
                                <p className="text-xs text-gray-400 flex items-start gap-2">
                                    <svg className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span>Paste a YouTube, Vimeo, or any other direct video URL</span>
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        key="file-input"
                                        type="file"
                                        accept="video/*"
                                        required={inputType === 'FILE'}
                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90 cursor-pointer"
                                    />
                                </div>
                                {videoFile && (
                                    <p className="text-xs text-primary-400 font-semibold flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {videoFile.name}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400">
                                    Upload from your computer (MP4, MOV, AVI, MKV - Max 200MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Section */}
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-3">
                            Thumbnail
                        </label>
                        <div className="space-y-3">
                            <input
                                type="url"
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                placeholder="https://example.com/thumbnail.jpg (optional)"
                            />
                            <div className="relative">
                                <p className="text-xs text-gray-400 mb-2">Or upload an image file:</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90 cursor-pointer"
                                />
                                {thumbnailFile && (
                                    <p className="text-xs text-primary-400 font-semibold mt-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {thumbnailFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Access Type Field...
*/}
                    <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">
                            Access Type *
                        </label>
                        <select
                            value={formData.accessType}
                            onChange={(e) => setFormData({ ...formData, accessType: e.target.value as 'FREE' | 'PREMIUM' })}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                        >
                            <option value="FREE" className="bg-white dark:bg-zinc-800 text-black dark:text-white">Free (Available to all users)</option>
                            <option value="PREMIUM" className="bg-white dark:bg-zinc-800 text-black dark:text-white">Premium (Subscription required)</option>
                        </select>
                    </div>

                    {/* Trailer Duration (Premium only) */}
                    {formData.accessType === 'PREMIUM' && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                            <label className="block text-sm font-bold text-primary mb-2">
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
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                                Free users will see the first {formData.trailerDurationSeconds} seconds as a preview
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 px-6 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </span>
                            ) : (
                                'Upload Video'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3.5 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
