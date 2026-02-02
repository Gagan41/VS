'use client'

import { useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'

export default function ShortsPage() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/videos?type=SHORT')
            const data = await response.json()
            setVideos(data)
        } catch (error) {
            console.error('Error fetching shorts:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
            <div className="mb-12 border-b border-gray-200 pb-10">
                <h1 className="text-5xl font-black text-black mb-3">Shorts</h1>
                <p className="text-gray-700 text-lg font-medium">Quick bursts of entertainment and professional insights.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[9/16] bg-gray-100 rounded-2xl"></div>
                            <div className="mt-4 space-y-2">
                                <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : videos.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl border border-gray-200 p-8 shadow-md text-center py-32">
                    <p className="text-gray-300 font-black text-3xl uppercase tracking-widest mb-4">No Shorts Detected</p>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Check back soon for new quick content.</p>
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
