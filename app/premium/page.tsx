'use client'

import { useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'

export default function PremiumPage() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/videos?accessType=PREMIUM')
            const data = await response.json()
            setVideos(data)
        } catch (error) {
            console.error('Error fetching premium videos:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Premium Content</h1>
                <p className="text-gray-300">Exclusive videos for our premium members</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-video bg-gray-800 rounded-lg"></div>
                            <div className="mt-3 h-4 bg-gray-800 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400 text-lg">No premium videos available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video: any) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            )}
        </main>
    )
}
