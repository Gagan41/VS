'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any
import Link from 'next/link'
import toast from 'react-hot-toast'
import LikeDislikeButton from '@/components/LikeDislikeButton'
import ViewsDisplay from '@/components/ViewsDisplay'
import CommentSection from '@/components/CommentSection'
import VideoProtection from '@/components/VideoProtection'
import { BookmarkIcon as BookmarkIconOutline } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'

export default function VideoPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [video, setVideo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [playerError, setPlayerError] = useState<string | null>(null)
    const [watchStartTime, setWatchStartTime] = useState(Date.now())
    const [isPlaying, setIsPlaying] = useState(false)
    const [isWatchLater, setIsWatchLater] = useState(false)
    const [togglingWatchLater, setTogglingWatchLater] = useState(false)

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url?.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const user = session?.user as any
    const isPremium = user?.subscriptionStatus === 'ACTIVE'
    const canWatchFull = video?.accessType === 'FREE' || isPremium

    useEffect(() => {
        if (id) {
            fetchVideo()
            checkWatchLaterStatus()
        }
    }, [id])

    useEffect(() => {
        // Track watch time when component unmounts
        return () => {
            if (video) {
                trackWatchTime()
            }
        }
    }, [video])

    const fetchVideo = async () => {
        try {
            const response = await fetch(`/api/videos/${id}`)
            if (!response.ok) {
                if (response.status === 404) {
                    setVideo(null)
                    return
                }
                throw new Error('Failed to fetch video')
            }
            const data = await response.json()
            setVideo(data)
        } catch (error) {
            console.error('Error fetching video:', error)
            toast.error('Failed to load video')
        } finally {
            setLoading(false)
        }
    }

    const checkWatchLaterStatus = async () => {
        if (!session) return
        try {
            const response = await fetch(`/api/watch-later/${id}`)
            if (response.ok) {
                const data = await response.json()
                setIsWatchLater(data.exists)
            }
        } catch (error) {
            console.error('Error checking watch later status:', error)
        }
    }

    const toggleWatchLater = async () => {
        if (!session) {
            toast.error('Please sign in to save videos')
            return
        }

        setTogglingWatchLater(true)
        try {
            const method = isWatchLater ? 'DELETE' : 'POST'
            const response = await fetch(`/api/watch-later${method === 'DELETE' ? `/${id}` : ''}`, {
                method,
                ...(method === 'POST' ? {
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId: id })
                } : {})
            })

            if (!response.ok) throw new Error('Action failed')

            setIsWatchLater(!isWatchLater)
            toast.success(isWatchLater ? 'Removed from Watch Later' : 'Added to Watch Later')
        } catch (error) {
            console.error('Error toggling watch later:', error)
            toast.error('Failed to update Watch Later')
        } finally {
            setTogglingWatchLater(false)
        }
    }

    const trackWatchTime = async () => {
        const watchDuration = Math.floor((Date.now() - watchStartTime) / 1000)
        if (watchDuration > 5) { // Only track if watched for more than 5 seconds
            try {
                await fetch('/api/watch-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        videoId: id,
                        watchTimeSeconds: watchDuration,
                    }),
                })
            } catch (error) {
                console.error('Error tracking watch time:', error)
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!video) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-white text-xl mb-4">Video not found</p>
                <Link href="/home" className="text-purple-400 hover:text-purple-300">
                    Go back home
                </Link>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-6xl mx-auto py-8">
                <div className="glass rounded-2xl overflow-hidden">
                    {/* Video Player */}
                    <VideoProtection videoId={video.id}>
                        <div className="aspect-video bg-black relative group">
                            {(() => {
                                const youtubeId = getYouTubeId(video.videoUrl)

                                if (youtubeId) {
                                    if (!isPlaying) {
                                        return (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center bg-cover bg-center cursor-pointer"
                                                style={{ backgroundImage: `url(${video.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`})` }}
                                                onClick={() => setIsPlaying(true)}
                                            >
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                                <button
                                                    className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 group-hover:scale-110 transition-transform"
                                                >
                                                    <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                                                </button>
                                            </div>
                                        )
                                    }

                                    return (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`}
                                            title={video.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        />
                                    )
                                }

                                // Regular video logic
                                return (
                                    <>
                                        {playerError && (
                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center">
                                                <div className="text-red-500 mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                                    </svg>
                                                </div>
                                                <p className="text-lg font-bold mb-2">Video Playback Error</p>
                                                <p className="text-gray-400 text-sm mb-4">{playerError}</p>
                                                <button
                                                    onClick={() => {
                                                        setPlayerError(null)
                                                        setIsPlaying(true)
                                                    }}
                                                    className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        )}
                                        {!canWatchFull ? (
                                            // Trailer Player
                                            <>
                                                <ReactPlayer
                                                    url={video.videoUrl}
                                                    width="100%"
                                                    height="100%"
                                                    controls
                                                    playing
                                                    config={{
                                                        file: {
                                                            attributes: {
                                                                controlsList: 'nodownload',
                                                                disablePictureInPicture: true,
                                                                poster: video.thumbnailUrl || '/default-thumbnail.png'
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium border border-purple-500/50 backdrop-blur-sm">
                                                    Trailer Preview
                                                </div>
                                            </>
                                        ) : (
                                            // Full Video Player
                                            <ReactPlayer
                                                url={video.videoUrl}
                                                width="100%"
                                                height="100%"
                                                controls
                                                playing={false}
                                                config={{
                                                    file: {
                                                        attributes: {
                                                            controlsList: 'nodownload',
                                                            disablePictureInPicture: true,
                                                        }
                                                    }
                                                }}
                                                onError={(e: any) => {
                                                    console.error('ReactPlayer Error:', e)
                                                    setPlayerError('This video format may not be supported or the file is missing.')
                                                }}
                                            />
                                        )}
                                    </>
                                )
                            })()}
                        </div>
                    </VideoProtection>

                    {/* Video Info */}
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white mb-2">{video.title}</h1>
                                <div className="flex items-center gap-4 mb-3">
                                    <ViewsDisplay videoId={video.id} />
                                    {video.accessType === 'PREMIUM' && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full">
                                            PREMIUM
                                        </span>
                                    )}
                                    {video.accessType === 'FREE' && (
                                        <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                                            FREE
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <LikeDislikeButton videoId={video.id} />
                                    <button
                                        onClick={toggleWatchLater}
                                        disabled={togglingWatchLater}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${isWatchLater
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                            }`}
                                    >
                                        {isWatchLater ? (
                                            <BookmarkIconSolid className="w-5 h-5 text-white" />
                                        ) : (
                                            <BookmarkIconOutline className="w-5 h-5" />
                                        )}
                                        <span className="font-semibold text-sm">
                                            {isWatchLater ? 'Saved' : 'Watch Later'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6">{video.description}</p>

                        {/* Premium Content Warning */}
                        {!canWatchFull && (
                            <div className="glass rounded-lg p-6 border-2 border-purple-500 mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    🔒 Premium Content
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    This is a premium video. You're currently watching the trailer (first {video.trailerDurationSeconds} seconds).
                                    Upgrade to Premium to watch the full video!
                                </p>
                                <Link
                                    href="/pricing"
                                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                                >
                                    Upgrade to Premium
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-8">
                    <CommentSection videoId={video.id} />
                </div>
            </main>
        </div>
    )
}
