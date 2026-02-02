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
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                    <div>
                        <h1 className="text-4xl font-bold text-black mb-2">Manage Videos</h1>
                        <p className="text-gray-600 font-medium">Edit or delete your long-form videos</p>
                    </div>
                    <Link
                        href="/admin/videos/new"
                        className="px-6 py-3 bg-black text-white font-black rounded-lg hover:bg-gray-800 transition-all shadow-lg uppercase tracking-wider text-sm"
                    >
                        Upload New Video
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-lg mb-4 font-bold">No videos uploaded yet</p>
                        <Link
                            href="/admin/videos/new"
                            className="inline-block px-8 py-3 bg-black text-white font-black rounded-lg hover:bg-gray-800 transition shadow-lg uppercase tracking-wider text-sm"
                        >
                            Upload Your First Video
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Access</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Created</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {videos.map((video: any) => (
                                    <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {video.thumbnailUrl && (
                                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-black font-bold">{video.title}</p>
                                                    <p className="text-gray-600 text-sm line-clamp-1 font-medium">{video.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${video.accessType === 'PREMIUM'
                                                ? 'bg-black text-white'
                                                : 'bg-green-100 text-green-700 border border-green-200'
                                                }`}>
                                                {video.accessType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm font-medium">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/videos/${video.id}/edit`}
                                                    className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(video.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
