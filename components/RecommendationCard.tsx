'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { PlayIcon, EllipsisVerticalIcon } from '@heroicons/react/24/solid'
import DurationBadge from './DurationBadge'
import CreatorRow from './CreatorRow'

interface RecommendationCardProps {
    video?: {
        id: string
        title: string
        thumbnailUrl: string | null
        accessType: string
        videoType: string
        durationSeconds: number | null
        createdAt: string
        viewCount?: number
    }
    isUpNext?: boolean
    isLoading?: boolean
    progress?: number
}

export default function RecommendationCard({
    video,
    isUpNext,
    isLoading,
    progress
}: RecommendationCardProps) {
    const [showMenu, setShowMenu] = useState(false)

    if (isLoading) {
        return (
            <div className="flex gap-2 p-2 animate-pulse">
                {/* Desktop and Mobile skeleton */}
                <div className="w-40 lg:w-44 aspect-video bg-white/5 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1 min-w-0">
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-4/5" />
                    <div className="h-3 bg-white/5 rounded w-1/2 mt-2" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
            </div>
        )
    }

    if (!video) return null

    return (
        <Link
            href={`/video/${video.id}`}
            className="group flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-all duration-200 relative
                       active:scale-[0.98] lg:hover:scale-[1.01] lg:hover:shadow-lg lg:hover:shadow-primary-500/10"
        >
            {/* Thumbnail */}
            <div className="relative w-40 lg:w-44 aspect-video rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                {video.thumbnailUrl ? (
                    <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 1024px) 160px, 176px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/40 to-primary-800/40">
                        <PlayIcon className="w-10 h-10 text-white/20" />
                    </div>
                )}

                {/* Duration Badge */}
                {video.durationSeconds !== null && video.durationSeconds !== undefined && (
                    <DurationBadge durationSeconds={video.durationSeconds} />
                )}

                {/* Progress Bar */}
                {progress !== undefined && progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                            className="h-full bg-red-600 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                    </div>
                )}

                {/* Hover Gradient Border Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-primary-500/30 to-transparent"
                        style={{ maskComposite: 'exclude', WebkitMaskComposite: 'xor' }} />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-0.5 pr-6 lg:pr-8">
                {isUpNext && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1 h-1 rounded-full bg-primary-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                            Up Next
                        </span>
                    </div>
                )}

                {/* Title - 2 line clamp */}
                <h3 className="text-white text-sm lg:text-[15px] font-semibold line-clamp-2 leading-tight 
                               mb-1.5 group-hover:text-primary-300 transition-colors">
                    {video.title}
                </h3>

                {/* Creator Info */}
                <CreatorRow
                    channelName="Kushal Stream"
                    channelAvatar={null}
                    viewCount={video.viewCount}
                    uploadDate={video.createdAt}
                    showAvatar={false}
                />

                {/* Access Type Badge (mobile only, subtle) */}
                <div className="flex items-center gap-1.5 mt-1.5 lg:hidden">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${video.accessType === 'PREMIUM'
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                        {video.accessType}
                    </span>
                </div>
            </div>

            {/* Three Dot Menu */}
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 
                           hover:bg-white/10 active:bg-white/20 transition-all z-10"
                aria-label="More options"
            >
                <EllipsisVerticalIcon className="w-4 h-4 text-white" />
            </button>

            {/* Simple Menu Dropdown */}
            {showMenu && (
                <div
                    className="absolute top-10 right-2 bg-surface-800 border border-white/10 rounded-lg 
                               shadow-xl py-1 z-20 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                >
                    <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors">
                        Add to queue
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors">
                        Save to playlist
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors">
                        Not interested
                    </button>
                </div>
            )}
        </Link>
    )
}
