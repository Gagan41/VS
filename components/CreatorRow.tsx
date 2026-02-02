'use client'

import Image from 'next/image'

interface CreatorRowProps {
    channelName: string
    channelAvatar?: string | null
    viewCount?: number
    uploadDate: string
    showAvatar?: boolean
}

export default function CreatorRow({
    channelName,
    channelAvatar,
    viewCount,
    uploadDate,
    showAvatar = true
}: CreatorRowProps) {
    const formatViews = (views: number): string => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`
        }
        return views.toString()
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
        return `${Math.floor(diffDays / 365)} years ago`
    }

    return (
        <div className="flex items-center gap-2 text-xs text-gray-400">
            {showAvatar && (
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-surface-700 flex-shrink-0">
                    {channelAvatar ? (
                        <Image
                            src={channelAvatar}
                            alt={channelName}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-secondary-600">
                            <span className="text-white text-[10px] font-bold">
                                {channelName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
            )}
            <div className="flex flex-col min-w-0 flex-1">
                <p className="font-medium truncate text-gray-300 hover:text-white transition-colors">
                    {channelName}
                </p>
                <div className="flex items-center gap-1">
                    {viewCount !== undefined && (
                        <>
                            <span>{formatViews(viewCount)} views</span>
                            <span>•</span>
                        </>
                    )}
                    <span>{formatDate(uploadDate)}</span>
                </div>
            </div>
        </div>
    )
}
