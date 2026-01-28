'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ManageVideosPage() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/videos?type=LONG')
            const data = await response.json()
            setVideos(data)
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return

        try {
            const response = await fetch(`/api/videos/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Video deleted successfully')
                fetchVideos()
            } else {
                toast.error('Failed to delete video')
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Manage Videos</h1>
                        <p className="text-gray-300">Edit or delete your long-form videos</p>
                    </div>
                    <Link
                        href="/admin/videos/new"
                        className="px-6 py-3 gradient-primary text-white font-semibold rounded-lg hover:shadow-glow-primary transition-all"
                    >
                        Upload New Video
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg mb-4">No videos uploaded yet</p>
                        <Link
                            href="/admin/videos/new"
                            className="inline-block px-6 py-3 gradient-primary text-white font-semibold rounded-lg hover:shadow-glow-primary transition-all"
                        >
                            Upload Your First Video
                        </Link>
                    </div>
                ) : (
                    <div className="glass-surface rounded-2xl overflow-hidden border border-primary/20">
                        <table className="w-full">
                            <thead className="bg-deep/30">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Access</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Created</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                {videos.map((video: any) => (
                                    <tr key={video.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                    {video.thumbnailUrl && (
                                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">{video.title}</p>
                                                    <p className="text-gray-400 text-sm line-clamp-1">{video.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${video.accessType === 'PREMIUM'
                                                ? 'gradient-primary text-white'
                                                : 'bg-green-600 text-white'
                                                }`}>
                                                {video.accessType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-sm">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/videos/${video.id}/edit`}
                                                    className="p-2 text-primary hover:text-primary-300 hover:bg-primary/10 rounded-lg transition-all"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(video.id)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    )
}
