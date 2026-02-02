'use client'

import { useState, useEffect } from 'react'
import { EyeIcon } from '@heroicons/react/24/outline'

interface ViewsDisplayProps {
    videoId: string
}

export default function ViewsDisplay({ videoId }: ViewsDisplayProps) {
    const [viewCount, setViewCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [viewRecorded, setViewRecorded] = useState(false)

    useEffect(() => {
        if (!viewRecorded) {
            recordViewAndFetch()
        }
    }, [videoId, viewRecorded])

    const recordViewAndFetch = async () => {
        try {
            // Record view and get updated count in one call
            const response = await fetch(`/api/videos/${videoId}/view`, {
                method: 'POST'
            })

            if (response.ok) {
                const data = await response.json()
                if (typeof data.viewCount === 'number') {
                    setViewCount(data.viewCount)
                }
            }
            setViewRecorded(true)
        } catch (error) {
            console.error('Error recording view:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatViews = (count: number | undefined | null): string => {
        const num = count || 0
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M'
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K'
        }
        return num.toString()
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-gray-400">
                <EyeIcon className="w-5 h-5" />
                <span className="text-sm">Loading...</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 text-gray-600">
            <EyeIcon className="w-5 h-5" />
            <span className="text-sm font-bold">
                {formatViews(viewCount)} {viewCount === 1 ? 'view' : 'views'}
            </span>
        </div>
    )
}
