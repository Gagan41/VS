'use client'

import { useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'
import SearchInput from '@/components/SearchInput'

export default function FreePage() {
    const [videos, setVideos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchVideos()
    }, [searchQuery])

    const fetchVideos = async () => {
        setLoading(true)
        try {
            const url = `/api/videos?accessType=FREE${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`
            const response = await fetch(url)
            const data = await response.json()
            setVideos(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching free videos:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 bg-white dark:bg-transparent">
            <main className="max-w-7xl mx-auto pb-20">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-10">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white leading-tight">Free Videos</h1>
                        <p className="text-gray-700 dark:text-gray-400 text-lg font-medium">Enjoy our collection of free content, open for everyone.</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <SearchInput
                            onSearch={setSearchQuery}
                            placeholder="Search free videos..."
                            className="w-full md:min-w-[400px]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-video bg-gray-200 rounded-lg"></div>
                                <div className="mt-3 h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 text-lg">No free videos available yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map((video: any) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
