'use client'

import { useEffect, useState } from 'react'
import RecommendationCard from './RecommendationCard'
import { ClockIcon } from '@heroicons/react/24/outline'

interface Video {
    id: string
    title: string
    thumbnailUrl: string | null
    accessType: string
    videoType: string
    createdAt: string
    durationSeconds: number | null
    totalWatchTimeSeconds: number
}

interface ContinueWatchingSectionProps {
    currentVideoId: string
}

export default function ContinueWatchingSection({ currentVideoId }: ContinueWatchingSectionProps) {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContinueWatching = async () => {
            try {
                const response = await fetch('/api/watch-history/continue')
                const data = await response.json()
                // Filter out current video
                const filtered = (data.videos || []).filter((v: Video) => v.id !== currentVideoId)
                setVideos(filtered)
            } catch (err) {
                console.error('Error fetching continue watching:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchContinueWatching()
    }, [currentVideoId])

    if (!loading && videos.length === 0) return null

    return (
        <section className="mb-8 p-1">
            <h2 className="text-lg font-black text-gray-900 dark:text-white px-2 mb-4 flex items-center gap-2 uppercase tracking-tighter">
                <ClockIcon className="w-5 h-5 text-purple-500" />
                Continue Watching
            </h2>

            <div className="flex flex-col gap-2">
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <RecommendationCard key={`cw-skeleton-${i}`} isLoading />
                    ))
                ) : (
                    videos.map(video => {
                        // Use real duration if available, else fallback to 900s
                        const duration = video.durationSeconds || 900
                        const progress = (video.totalWatchTimeSeconds / duration) * 100

                        return (
                            <RecommendationCard
                                key={`cw-${video.id}`}
                                video={video}
                                progress={Math.min(99, Math.max(1, progress))} // Show at least a sliver
                            />
                        )
                    })
                )}
            </div>
        </section>
    )
}
