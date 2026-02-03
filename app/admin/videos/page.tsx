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
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            <main className="max-w-7xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div>
                        <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Manage Videos</h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Edit or delete your long-form videos</p>
                    </div>
                    <Link
                        href="/admin/videos/new"
                        className="px-6 py-3 bg-primary text-black font-black rounded-lg hover:bg-primary/90 transition-all shadow-lg uppercase tracking-wider text-sm"
                    >
                        Upload New Video
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-white/10">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4 font-bold">No videos uploaded yet</p>
                        <Link
                            href="/admin/videos/new"
                            className="inline-block px-8 py-3 bg-primary text-black font-black rounded-lg hover:bg-primary/90 transition shadow-lg uppercase tracking-wider text-sm"
                        >
                            Upload Your First Video
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Access</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Created</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {videos.map((video: any) => (
                                    <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-16 bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden flex-shrink-0 border border-gray-200 dark:border-zinc-700">
                                                    {video.thumbnailUrl && (
                                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-black dark:text-white font-bold">{video.title}</p>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 font-medium">{video.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${video.accessType === 'PREMIUM'
                                                ? 'bg-primary text-black'
                                                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                                }`}>
                                                {video.accessType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/videos/${video.id}/edit`}
                                                    className="p-2 text-primary hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(video.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
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
