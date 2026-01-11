'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { PlayIcon } from '@heroicons/react/24/solid'
import { getVariant, trackExperimentEvent } from '@/lib/ab-testing'
import { useSession } from 'next-auth/react'
import { formatDuration } from '@/lib/time'

interface RecommendationCardProps {
    video?: {
        id: string
        title: string
        thumbnailUrl: string | null
        accessType: string
        videoType: string
        durationSeconds: number | null
        createdAt: string
    }
    isUpNext?: boolean
    isLoading?: boolean
    progress?: number // Percentage 0-100
}

export default function RecommendationCard({ video, isUpNext, isLoading, progress }: RecommendationCardProps) {
    const { data: session } = useSession()
    const userId = (session?.user as any)?.id

    // A/B Test Variants
    const thumbVariant = getVariant('thumbnail_size', userId)
    const layoutVariant = getVariant('card_layout', userId)

    useEffect(() => {
        if (video && !isLoading) {
            trackExperimentEvent({
                experimentId: 'thumbnail_size',
                variant: thumbVariant,
                action: 'impression',
                userId,
                videoId: video.id
            })
            trackExperimentEvent({
                experimentId: 'card_layout',
                variant: layoutVariant,
                action: 'impression',
                userId,
                videoId: video.id
            })
        }
    }, [video?.id, isLoading])

    if (isLoading) {
        return (
            <div className="flex gap-3 animate-pulse">
                <div className="w-40 h-24 bg-white/10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                    <div className="h-3 bg-white/5 rounded w-1/2 mt-4" />
                </div>
            </div>
        )
    }

    if (!video) return null

    const thumbSizes = {
        control: 'w-40 h-24',
        variant_a: 'w-32 h-20',
        variant_b: 'w-48 h-28'
    }

    const layouts = {
        control: 'flex gap-3',
        variant_a: 'flex flex-col gap-2',
        variant_b: 'flex gap-3' // Same as control for now
    }

    return (
        <Link
            href={`/video/${video.id}`}
            onClick={() => {
                trackExperimentEvent({
                    experimentId: 'thumbnail_size',
                    variant: thumbVariant,
                    action: 'click',
                    userId,
                    videoId: video.id
                })
            }}
            className={`group p-2 rounded-2xl hover:bg-white/5 transition-all duration-300 active:scale-[0.98] ${layouts[layoutVariant]}`}
        >
            {/* Thumbnail Container */}
            <div className={`relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-800 ${thumbSizes[thumbVariant]}`}>
                {video.thumbnailUrl ? (
                    <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                        <PlayIcon className="w-8 h-8 text-white/20" />
                    </div>
                )}

                {/* Duration Overlay */}
                {(video.durationSeconds !== null && video.durationSeconds !== undefined) && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-white rounded-md border border-white/10">
                        {formatDuration(video.durationSeconds)}
                    </div>
                )}

                {/* Progress Bar */}
                {progress !== undefined && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                        <div
                            className="h-full bg-purple-500 transition-all duration-1000"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Info Container */}
            <div className="flex-1 min-w-0 py-0.5">
                {isUpNext && (
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 block">
                        Up Next
                    </span>
                )}
                <h3 className="text-white text-sm font-bold line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                    {video.title}
                </h3>
                <div className="mt-1 flex flex-col gap-0.5">
                    <p className="text-gray-400 text-[11px] font-medium truncate">
                        Kushal Stream
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${video.accessType === 'PREMIUM'
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                            }`}>
                            {video.accessType}
                        </span>
                        <span className="text-gray-500 text-[10px]">•</span>
                        <span className="text-gray-500 text-[10px]">
                            {new Date(video.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
