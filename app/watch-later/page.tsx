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
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            <main className="max-w-7xl mx-auto pt-6 pb-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Watch Later</h1>
                        <p className="text-gray-600 dark:text-gray-400">Videos you've saved to watch later</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4 font-medium">Your Watch Later list is empty</p>
                        <Link
                            href="/home"
                            className="inline-block px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition shadow-lg"
                        >
                            Explore Videos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-blue-50 dark:bg-zinc-900/50 rounded-2xl overflow-hidden group border border-gray-100 dark:border-white/10 hover:shadow-xl transition-all">
                                <div className="aspect-video bg-gray-100 relative">
                                    {item.video.thumbnailUrl ? (
                                        <img
                                            src={item.video.thumbnailUrl}
                                            alt={item.video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <PlayIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Link
                                            href={`/video/${item.video.id}`}
                                            className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                                        >
                                            <PlayIcon className="w-6 h-6 fill-current" />
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(item.video.id)}
                                            className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                                        >
                                            <TrashIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                    {item.video.accessType === 'PREMIUM' && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded shadow-md">
                                            PREMIUM
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-black dark:text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                        {item.video.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 font-medium">
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
