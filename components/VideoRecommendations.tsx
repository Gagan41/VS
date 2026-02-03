'use client'

import { useEffect, useState } from 'react'
import RecommendationCard from './RecommendationCard'
import ShortsRow from './ShortsRow'
import ContinueWatchingSection from './ContinueWatchingSection'

interface Video {
    id: string
    title: string
    thumbnailUrl: string | null
    accessType: string
    videoType: string
    durationSeconds: number | null
    createdAt: string
    viewCount?: number
}

interface VideoRecommendationsProps {
    currentVideoId: string
}

export default function VideoRecommendations({ currentVideoId }: VideoRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/videos/${currentVideoId}/recommendations`)
                if (!response.ok) throw new Error('Failed to fetch recommendations')
                const data = await response.json()
                setRecommendations(data.recommendations || [])
            } catch (err) {
                console.error('Error fetching recommendations:', err)
                setError('Could not load recommendations')
            } finally {
                setLoading(false)
            }
        }

        if (currentVideoId) {
            fetchRecommendations()
        }
    }, [currentVideoId])

    if (error) return null

    // Separate shorts from regular videos
    const shorts = recommendations.filter(v => v.videoType === 'SHORT')
    const regularVideos = recommendations.filter(v => v.videoType !== 'SHORT')

    return (
        <div className="flex flex-col gap-4">
            {/* Continue Watching Section */}
            <ContinueWatchingSection currentVideoId={currentVideoId} />

            <div className="hidden lg:block">
                <h2 className="text-base font-black text-gray-900 dark:text-white px-2 uppercase tracking-tight">
                    Recommended
                </h2>
            </div>

            <div className="lg:hidden">
                <h2 className="text-lg font-black text-gray-900 dark:text-white px-2 border-b border-gray-200 dark:border-white/10 pb-3 uppercase tracking-tight">
                    Up next
                </h2>
            </div>

            {/* Shorts Section */}
            {shorts.length > 0 && (
                <div className="border-b border-gray-100 pb-4">
                    <ShortsRow shorts={shorts} />
                </div>
            )}

            {/* Regular Video Recommendations */}
            <div className="flex flex-col gap-0">
                {loading ? (
                    // Skeleton Loaders
                    Array.from({ length: 8 }).map((_, i) => (
                        <RecommendationCard key={`skeleton-${i}`} isLoading />
                    ))
                ) : regularVideos.length > 0 ? (
                    regularVideos.map((video, index) => (
                        <RecommendationCard
                            key={video.id}
                            video={video}
                            isUpNext={index === 0 && shorts.length === 0}
                        />
                    ))
                ) : (
                    <div className="px-4 py-8 text-center">
                        <p className="text-gray-600 dark:text-gray-500 text-sm">
                            No recommendations available
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
