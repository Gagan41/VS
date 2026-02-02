'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDownIcon, ChevronUpIcon, PlayIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { formatDuration } from '@/lib/utils'

interface PlaylistVideo {
    id: string
    title: string
    thumbnailUrl: string | null
    videoType: 'LONG' | 'SHORT'
    accessType: 'FREE' | 'PREMIUM'
    durationSeconds: number | null
    order: number
}

interface PlaylistQueueProps {
    playlistId: string
    currentVideoId: string
}

export default function PlaylistQueue({ playlistId, currentVideoId }: PlaylistQueueProps) {
    const [videos, setVideos] = useState<PlaylistVideo[]>([])
    const [loading, setLoading] = useState(true)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [playlistTitle, setPlaylistTitle] = useState('Playlist')

    useEffect(() => {
        fetchPlaylistVideos()
    }, [playlistId])

    const fetchPlaylistVideos = async () => {
        try {
            const response = await fetch(`/api/playlists/${playlistId}`)
            if (!response.ok) throw new Error('Failed to fetch playlist')
            const data = await response.json()
            setPlaylistTitle(data.title || 'Playlist')

            // Sort by order and format the data
            const sortedVideos = data.videos?.map((pv: any) => ({
                id: pv.video.id,
                title: pv.video.title,
                thumbnailUrl: pv.video.thumbnailUrl,
                videoType: pv.video.videoType,
                accessType: pv.video.accessType,
                durationSeconds: null, // Not available in schema
                order: pv.order
            })).sort((a: any, b: any) => a.order - b.order) || []

            setVideos(sortedVideos)
        } catch (error) {
            console.error('Error fetching playlist:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()

        if (draggedIndex === null || draggedIndex === index) return

        const newVideos = [...videos]
        const draggedVideo = newVideos[draggedIndex]

        // Remove from old position
        newVideos.splice(draggedIndex, 1)
        // Insert at new position
        newVideos.splice(index, 0, draggedVideo)

        setVideos(newVideos)
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
        // Here you could save the new order to the backend if needed
        // updatePlaylistOrder(videos)
    }

    const currentIndex = videos.findIndex(v => v.id === currentVideoId)
    const nextVideo = currentIndex >= 0 && currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null

    if (loading) {
        return (
            <div className="mb-6 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
                    <div className="h-20 bg-gray-100 rounded" />
                </div>
            </div>
        )
    }

    if (!videos.length) return null

    return (
        <div className="mb-6 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-md">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bars3Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-black font-black uppercase tracking-tight text-sm">{playlistTitle}</h3>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                            {currentIndex + 1} / {videos.length} videos
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    {isCollapsed ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                    ) : (
                        <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Playlist Videos */}
            {!isCollapsed && (
                <div className="border-t border-gray-200">
                    {/* Next Video Highlight */}
                    {nextVideo && (
                        <div className="p-4 bg-primary/5 border-b border-gray-200">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                                Up Next
                            </p>
                            <Link
                                href={`/video/${nextVideo.id}?playlist=${playlistId}`}
                                className="group flex gap-3 hover:bg-gray-100 p-2 rounded-xl transition-all"
                            >
                                <div className="relative w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                                    {nextVideo.thumbnailUrl ? (
                                        <Image
                                            src={nextVideo.thumbnailUrl}
                                            alt={nextVideo.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="160px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PlayIcon className="w-8 h-8 text-white/20" />
                                        </div>
                                    )}
                                    {nextVideo.durationSeconds && (
                                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-bold text-white rounded">
                                            {formatDuration(nextVideo.durationSeconds)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-black text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                        {nextVideo.title}
                                    </h4>
                                    <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${nextVideo.accessType === 'PREMIUM'
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                        }`}>
                                        {nextVideo.accessType}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* All Videos - Draggable List */}
                    <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent p-4 space-y-2">
                        {videos.map((video, index) => (
                            <div
                                key={video.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`group flex gap-3 p-2 rounded-xl transition-all cursor-move border-2 ${video.id === currentVideoId
                                    ? 'bg-primary/5 border-primary shadow-sm'
                                    : 'hover:bg-gray-100 border-transparent'
                                    } ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                            >
                                {/* Drag Handle */}
                                <div className="flex items-center text-gray-500 group-hover:text-primary transition-colors">
                                    <Bars3Icon className="w-4 h-4" />
                                </div>

                                {/* Order Number */}
                                <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">
                                    {index + 1}
                                </div>

                                {/* Thumbnail */}
                                <Link
                                    href={`/video/${video.id}?playlist=${playlistId}`}
                                    className="relative w-32 h-18 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800"
                                >
                                    {video.thumbnailUrl ? (
                                        <Image
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="128px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PlayIcon className="w-6 h-6 text-white/20" />
                                        </div>
                                    )}
                                    {video.durationSeconds && (
                                        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-[9px] font-bold text-white rounded">
                                            {formatDuration(video.durationSeconds)}
                                        </div>
                                    )}
                                    {video.id === currentVideoId && (
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                            <PlayIcon className="w-8 h-8 text-primary" />
                                        </div>
                                    )}
                                </Link>

                                {/* Video Info */}
                                <Link
                                    href={`/video/${video.id}?playlist=${playlistId}`}
                                    className="flex-1 min-w-0"
                                >
                                    <h4 className={`text-sm font-bold line-clamp-2 transition-colors ${video.id === currentVideoId
                                        ? 'text-primary'
                                        : 'text-black group-hover:text-primary'
                                        }`}>
                                        {video.title}
                                    </h4>
                                    <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${video.accessType === 'PREMIUM'
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                        }`}>
                                        {video.accessType}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
