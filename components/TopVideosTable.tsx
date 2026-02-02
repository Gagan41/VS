'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EyeIcon } from '@heroicons/react/24/outline'

interface TopVideo {
    id: string
    title: string
    thumbnailUrl: string | null
    views: number
}

export default function TopVideosTable() {
    const [topVideos, setTopVideos] = useState<TopVideo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTopVideos()
    }, [])

    const fetchTopVideos = async () => {
        try {
            const response = await fetch('/api/admin/analytics?period=30d')
            const data = await response.json()

            if (data.error) {
                console.error('Top videos error:', data.error)
                return
            }

            setTopVideos(Array.isArray(data.topVideos) ? data.topVideos : [])
        } catch (error) {
            console.error('Error fetching top videos:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatViews = (count: number | undefined | null): string => {
        const num = count || 0
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M'
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K'
        }
        return num.toString()
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-black mb-6">Top Videos</h2>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : topVideos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-medium">
                    No video data available
                </div>
            ) : (
                <div className="space-y-3">
                    {topVideos.map((video, index) => (
                        <Link
                            key={video.id}
                            href={`/video/${video.id}`}
                            className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group border border-transparent hover:border-gray-200"
                        >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-black font-black shadow-[0_4px_12px_-2px_rgba(37,99,235,0.6)]">
                                {index + 1}
                            </div>

                            <div className="flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-gray-200">
                                {video.thumbnailUrl ? (
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-black font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                    {video.title}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                                <EyeIcon className="w-5 h-5" />
                                <span className="font-bold">{formatViews(video.views)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
