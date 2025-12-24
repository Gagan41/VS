'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TrashIcon, PlayIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface WatchLaterItem {
    id: string
    videoId: string
    addedAt: string
    video: {
        id: string
        title: string
        description: string
        thumbnailUrl: string | null
        videoType: string
        accessType: string
    }
}

export default function WatchLaterPage() {
    const { data: session } = useSession()
    const [items, setItems] = useState<WatchLaterItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session) {
            fetchWatchLater()
        }
    }, [session])

    const fetchWatchLater = async () => {
        try {
            const response = await fetch('/api/watch-later')
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setItems(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching watch later:', error)
            toast.error('Failed to load Watch Later list')
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (videoId: string) => {
        try {
            const response = await fetch(`/api/watch-later/${videoId}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to remove')

            setItems(items.filter(item => item.video.id !== videoId))
            toast.success('Removed from Watch Later')
        } catch (error) {
            console.error('Error removing from watch later:', error)
            toast.error('Failed to remove video')
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Watch Later</h1>
                        <p className="text-gray-300">Videos you've saved to watch later</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-gray-400 text-lg mb-4">Your Watch Later list is empty</p>
                        <Link
                            href="/home"
                            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                        >
                            Explore Videos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="glass rounded-2xl overflow-hidden group border border-white/5 hover:border-purple-500/50 transition-colors">
                                <div className="aspect-video bg-gray-800 relative">
                                    {item.video.thumbnailUrl ? (
                                        <img
                                            src={item.video.thumbnailUrl}
                                            alt={item.video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <PlayIcon className="w-12 h-12 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Link
                                            href={`/video/${item.video.id}`}
                                            className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform"
                                        >
                                            <PlayIcon className="w-6 h-6 fill-current" />
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(item.video.id)}
                                            className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"
                                        >
                                            <TrashIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                    {item.video.accessType === 'PREMIUM' && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded">
                                            PREMIUM
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                                        {item.video.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-2">
                                        {item.video.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
