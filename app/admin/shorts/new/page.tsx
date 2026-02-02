'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function NewShortPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [inputType, setInputType] = useState<'URL' | 'FILE' | 'REMOTE'>('URL')
    const [remoteUrl, setRemoteUrl] = useState('')
    const [isImporting, setIsImporting] = useState(false)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        accessType: 'FREE',
    })

    const handleRemoteImport = async () => {
        if (!remoteUrl) {
            toast.error('Please enter a link')
            return
        }

        setIsImporting(true)
        const loadingToast = toast.loading('Importing short to server...')
        try {
            const response = await fetch('/api/upload/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: remoteUrl, type: 'videos' })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to import')
            }

            const data = await response.json()
            setFormData({ ...formData, videoUrl: data.url })
            toast.success('Import successful!', { id: loadingToast })
            setInputType('URL')
        } catch (error: any) {
            console.error('Remote import failed:', error)
            toast.error(`Import failed: ${error.message}`, { id: loadingToast })
        } finally {
            setIsImporting(false)
        }
    }

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

                if (!uploadResponse.ok) throw new Error('Upload failed')
                const uploadData = await uploadResponse.json()
                finalVideoUrl = uploadData.url
            }

            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    videoUrl: finalVideoUrl,
                    videoType: 'SHORT',
                }),
            })

            if (!response.ok) throw new Error('Failed to create short')

            toast.success('Short uploaded successfully!')
            router.push('/admin/shorts')
        } catch (error: any) {
            console.error('Error creating short:', error)
            toast.error(error.message || 'Failed to upload short')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-3xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-black mb-2">Upload New Short</h1>
                    <p className="text-gray-600">Add a new short/reel to your platform</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-8 space-y-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-bold text-black mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Enter short title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Enter short description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2">
                            Video Source *
                        </label>
                        <div className="flex flex-wrap gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setInputType('URL')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${inputType === 'URL' ? 'bg-black text-white' : 'bg-white text-black border-2 border-black hover:bg-gray-50'}`}
                            >
                                External Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('REMOTE')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${inputType === 'REMOTE' ? 'bg-black text-white' : 'bg-white text-black border-2 border-black hover:bg-gray-50'}`}
                            >
                                Import from Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('FILE')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${inputType === 'FILE' ? 'bg-black text-white' : 'bg-white text-black border-2 border-black hover:bg-gray-50'}`}
                            >
                                Upload File
                            </button>
                        </div>

                        {inputType === 'URL' ? (
                            <input
                                key="url-input"
                                type="url"
                                required={inputType === 'URL'}
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="https://youtube.com/shorts/... or direct URL"
                            />
                        ) : inputType === 'REMOTE' ? (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={remoteUrl}
                                        onChange={(e) => setRemoteUrl(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-200 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="Paste a direct video link (MP4, etc.)"
                                    />
                                    <button
                                        type="button"
                                        disabled={isImporting}
                                        onClick={handleRemoteImport}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                        Import
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <input
                                key="file-input"
                                type="file"
                                accept="video/*"
                                required={inputType === 'FILE'}
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-black file:text-white"
                            />
                        )}
                        {formData.videoUrl.startsWith('/uploads') && (
                            <p className="mt-2 text-xs text-green-400">Target path: {formData.videoUrl}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2">
                            Thumbnail URL
                        </label>
                        <input
                            type="url"
                            value={formData.thumbnailUrl}
                            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="https://example.com/thumbnail.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2">
                            Access Type *
                        </label>
                        <select
                            value={formData.accessType}
                            onChange={(e) => setFormData({ ...formData, accessType: e.target.value as 'FREE' | 'PREMIUM' })}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                            <option value="FREE" className="bg-white text-black">Free</option>
                            <option value="PREMIUM" className="bg-white text-black">Premium</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading || isImporting}
                            className="flex-1 py-3 px-4 bg-black text-white font-black rounded-lg hover:bg-gray-800 transition shadow-lg uppercase tracking-wider text-sm disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Upload Short'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-white border-2 border-black text-black font-bold rounded-lg hover:bg-gray-50 transition-all font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
