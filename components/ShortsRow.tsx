'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PlayIcon } from '@heroicons/react/24/solid'
import DurationBadge from './DurationBadge'

interface Short {
    id: string
    title: string
    thumbnailUrl: string | null
    durationSeconds: number | null
    viewCount?: number
}

interface ShortsRowProps {
    shorts: Short[]
}

export default function ShortsRow({ shorts }: ShortsRowProps) {
    if (!shorts || shorts.length === 0) return null

    const formatViews = (views: number): string => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`
        }
        return views.toString()
    }

    return (
        <div className="w-full">
            <h3 className="text-sm font-bold text-black mb-3 px-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 4.5V19.5L17 12L10 4.5Z" />
                </svg>
                Shorts
            </h3>

            {/* Mobile: Horizontal Scroll */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-2 px-2">
                <div className="flex gap-3 pb-2">
                    {shorts.map((short) => (
                        <Link
                            key={short.id}
                            href={`/video/${short.id}`}
                            className="group flex-shrink-0 w-[140px]"
                        >
                            {/* Vertical Thumbnail (9:16) */}
                            <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-200 mb-2">
                                {short.thumbnailUrl ? (
                                    <Image
                                        src={short.thumbnailUrl}
                                        alt={short.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        sizes="140px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <PlayIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}

                                {short.durationSeconds && <DurationBadge durationSeconds={short.durationSeconds} />}

                                {short.viewCount !== undefined && (
                                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-bold text-white rounded">
                                        {formatViews(short.viewCount)} views
                                    </div>
                                )}
                            </div>

                            <h4 className="text-black text-xs font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                {short.title}
                            </h4>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Desktop: Vertical Mini Group */}
            <div className="hidden lg:grid grid-cols-2 gap-2">
                {shorts.slice(0, 4).map((short) => (
                    <Link
                        key={short.id}
                        href={`/video/${short.id}`}
                        className="group"
                    >
                        <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-200 mb-1.5">
                            {short.thumbnailUrl ? (
                                <Image
                                    src={short.thumbnailUrl}
                                    alt={short.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    sizes="(min-width: 1024px) 180px, 140px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <PlayIcon className="w-8 h-8 text-gray-400" />
                                </div>
                            )}

                            {short.durationSeconds && <DurationBadge durationSeconds={short.durationSeconds} />}
                        </div>

                        <h4 className="text-black text-[11px] font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {short.title}
                        </h4>
                    </Link>
                ))}
            </div>
        </div>
    )
}
