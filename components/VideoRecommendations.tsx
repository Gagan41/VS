'use client'

import { useEffect, useState } from 'react'
import RecommendationCard from './RecommendationCard'
import ContinueWatchingSection from './ContinueWatchingSection'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface Video {
    id: string
    title: string
    thumbnailUrl: string | null
    accessType: string
    videoType: string
    createdAt: string
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

    return (
        <div className="flex flex-col gap-4">
            <ContinueWatchingSection currentVideoId={currentVideoId} />

            <h2 className="text-lg font-black text-white px-2 flex items-center gap-2 uppercase tracking-tighter">
                <SparklesIcon className="w-5 h-5 text-purple-500" />
                Recommended for you
            </h2>

            <div className="flex flex-col gap-2">
                {loading ? (
                    // Skeleton Loaders
                    Array.from({ length: 6 }).map((_, i) => (
                        <RecommendationCard key={`skeleton-${i}`} isLoading />
                    ))
                ) : recommendations.length > 0 ? (
                    recommendations.map((video, index) => (
                        <RecommendationCard
                            key={video.id}
                            video={video}
                            isUpNext={index === 0}
                        />
                    ))
                ) : (
                    <p className="text-gray-500 text-sm px-2 italic">
                        No similar videos found
                    </p>
                )}
            </div>
        </div>
    )
}
