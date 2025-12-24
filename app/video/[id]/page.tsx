'use client'

import { useEffect, useState, useRef } from 'react'
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
    const { data: session, status: sessionStatus } = useSession()
    const [video, setVideo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [playerError, setPlayerError] = useState<string | null>(null)
    const [watchStartTime, setWatchStartTime] = useState(Date.now())
    const [isPlaying, setIsPlaying] = useState(false)
    const [isTrailerEnded, setIsTrailerEnded] = useState(false)
    const [isWatchLater, setIsWatchLater] = useState(false)
    const [togglingWatchLater, setTogglingWatchLater] = useState(false)
    const [trailerStartTime, setTrailerStartTime] = useState<number | null>(null)

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url?.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const videoRef = useRef<HTMLVideoElement>(null)
    const playerRef = useRef<any>(null)
    const user = session?.user as any
    const isPremium = user?.subscriptionStatus?.toUpperCase() === 'ACTIVE' || user?.role === 'ADMIN'

    // Explicitly check for FREE access type to avoid undefined issues
    const canWatchFull = video?.accessType === 'FREE' || isPremium

    // Debugging logs for access control
    useEffect(() => {
        if (video) {
            console.log('--- Video Access Check ---')
            console.log('Title:', video.title)
            console.log('Access Type:', video.accessType)
            console.log('User Role:', user?.role)
            console.log('Subscription:', user?.subscriptionStatus)
            console.log('isPremium:', isPremium)
            console.log('canWatchFull:', canWatchFull)
            console.log('--------------------------')
        }
    }, [video, user, isPremium, canWatchFull])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only seek if we are in the full native player and it's playing
            if (!videoRef.current || !isPlaying || !canWatchFull) return

            if (e.key === 'ArrowLeft') {
                videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
                toast.success('-5s', { id: 'seek', duration: 1000, icon: '⏪' })
            } else if (e.key === 'ArrowRight') {
                videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5)
                toast.success('+5s', { id: 'seek', duration: 1000, icon: '⏩' })
            } else if (e.key === ' ') {
                // If the user isn't typing in a comment or something
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    e.preventDefault()
                    if (videoRef.current.paused) videoRef.current.play()
                    else videoRef.current.pause()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isPlaying, canWatchFull])

    useEffect(() => {
        if (id) {
            fetchVideo()
            checkWatchLaterStatus()
            // Reset player states for new video
            setIsPlaying(false)
            setIsTrailerEnded(false)
            setPlayerError(null)
            setTrailerStartTime(null)
        }
    }, [id])

    // Timer-based trailer enforcement for YouTube videos
    useEffect(() => {
        if (!canWatchFull && isPlaying && !isTrailerEnded && trailerStartTime !== null) {
            const limit = (video?.trailerDurationSeconds || 30) * 1000
            const checkInterval = setInterval(() => {
                const elapsed = Date.now() - trailerStartTime
                if (elapsed >= limit) {
                    setIsTrailerEnded(true)
                    toast.error('Preview ended', { id: 'trailer-end', icon: '🔒' })
                    clearInterval(checkInterval)
                }
            }, 500)

            return () => clearInterval(checkInterval)
        }
    }, [canWatchFull, isPlaying, isTrailerEnded, trailerStartTime, video?.trailerDurationSeconds])

    // Force exit fullscreen when trailer ends
    useEffect(() => {
        if (isTrailerEnded && document.fullscreenElement) {
            document.exitFullscreen().catch((err) => {
                console.error('Failed to exit fullscreen:', err)
            })
        }
    }, [isTrailerEnded])

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

    if (loading || sessionStatus === 'loading') {
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
                        <div className="aspect-video bg-black relative group overflow-hidden">
                            {(() => {
                                const youtubeId = getYouTubeId(video.videoUrl)
                                const isLocal = video.videoUrl.startsWith('/uploads')

                                return (
                                    <>
                                        {/* 1. Playback Layer */}
                                        {isPlaying && (
                                            <div className={`w-full h-full transition-opacity duration-700 ${isTrailerEnded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                                {(() => {
                                                    // A. Trailer Mode
                                                    if (!canWatchFull) {
                                                        if (youtubeId) {
                                                            return (
                                                                <div className="w-full h-full relative">
                                                                    {!isTrailerEnded && (
                                                                        <iframe
                                                                            key={`trailer-yt-${video.id}`}
                                                                            width="100%"
                                                                            height="100%"
                                                                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1&disablekb=1`}
                                                                            title={video.title}
                                                                            frameBorder="0"
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            allowFullScreen
                                                                            className="w-full h-full"
                                                                            onLoad={() => {
                                                                                if (!trailerStartTime) {
                                                                                    setTrailerStartTime(Date.now())
                                                                                }
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <div className="absolute top-4 left-4 bg-purple-600/90 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/20 z-10">
                                                                        Preview Mode - {video.trailerDurationSeconds || 30}s
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        // Local Trailer (Use native for reliability)
                                                        return (
                                                            <div className="w-full h-full relative">
                                                                {!isTrailerEnded && (
                                                                    <video
                                                                        key={`trailer-local-${video.id}`}
                                                                        ref={videoRef}
                                                                        src={video.videoUrl}
                                                                        controls
                                                                        autoPlay
                                                                        playsInline
                                                                        controlsList="nodownload"
                                                                        onContextMenu={(e) => e.preventDefault()}
                                                                        onTimeUpdate={(e: any) => {
                                                                            const limit = video.trailerDurationSeconds || 30
                                                                            if (e.target.currentTime >= limit) {
                                                                                e.target.pause()
                                                                                setIsTrailerEnded(true)
                                                                                toast.error('Preview ended', { id: 'trailer-end', icon: '🔒' })
                                                                            }
                                                                        }}
                                                                        className="w-full h-full bg-black object-contain"
                                                                        onError={() => setPlayerError('The trailer video file could not be played.')}
                                                                    />
                                                                )}
                                                                <div className="absolute top-4 left-4 bg-purple-600/90 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg border border-white/20 z-10">
                                                                    Preview Mode - {video.trailerDurationSeconds || 30}s
                                                                </div>
                                                            </div>
                                                        )
                                                    }

                                                    // B. Full Video - YouTube
                                                    if (youtubeId) {
                                                        return (
                                                            <iframe
                                                                key={`full-yt-${video.id}`}
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

                                                    // C. Full Video - Local
                                                    if (isLocal) {
                                                        return (
                                                            <div className="w-full h-full relative" onDoubleClick={(e) => {
                                                                if (!videoRef.current) return
                                                                const rect = e.currentTarget.getBoundingClientRect()
                                                                const x = e.clientX - rect.left
                                                                if (x < rect.width / 2) {
                                                                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
                                                                    toast.success('-5s', { id: 'seek', duration: 1000, icon: '⏪' })
                                                                } else {
                                                                    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5)
                                                                    toast.success('+5s', { id: 'seek', duration: 1000, icon: '⏩' })
                                                                }
                                                            }}>
                                                                <video
                                                                    key={`full-local-${video.id}`}
                                                                    ref={videoRef}
                                                                    src={video.videoUrl}
                                                                    controls
                                                                    autoPlay
                                                                    playsInline
                                                                    controlsList="nodownload"
                                                                    onContextMenu={(e) => e.preventDefault()}
                                                                    className="w-full h-full bg-black object-contain"
                                                                    onError={() => setPlayerError('The local video file could not be played.')}
                                                                />
                                                            </div>
                                                        )
                                                    }

                                                    // D. Fallback
                                                    return (
                                                        <ReactPlayer
                                                            url={video.videoUrl}
                                                            width="100%"
                                                            height="100%"
                                                            controls
                                                            playing
                                                            playsinline
                                                            onError={(e: any) => setPlayerError('This format is not supported.')}
                                                        />
                                                    )
                                                })()}
                                            </div>
                                        )}

                                        {/* 2. Overlay Layer (Play Button / Trailer Ended) */}
                                        {(!isPlaying || isTrailerEnded) && (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center bg-cover bg-center cursor-pointer z-10 transition-all duration-500"
                                                style={{
                                                    backgroundImage: `url(${video.thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '/placeholder-thumbnail.jpg')})`
                                                }}
                                                onClick={() => {
                                                    if (isTrailerEnded) return
                                                    setIsPlaying(true)
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-colors" />

                                                {isTrailerEnded ? (
                                                    <div className="relative z-20 text-center p-8 bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-sm mx-4 transform animate-in fade-in zoom-in duration-300">
                                                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Access Restricted</h3>
                                                        <p className="text-gray-300 text-sm mb-8 leading-relaxed font-medium">
                                                            {session
                                                                ? "Your preview has ended. This premium title requires an active subscription to view in full."
                                                                : "Your preview has ended. Sign in and upgrade to Premium to continue watching this exclusive content."
                                                            }
                                                        </p>
                                                        <div className="flex flex-col gap-3">
                                                            <Link
                                                                href="/pricing"
                                                                className="block w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-purple-500/25"
                                                            >
                                                                Unlock Full Video
                                                            </Link>
                                                            {!session && (
                                                                <Link
                                                                    href="/auth/login"
                                                                    className="block w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/10"
                                                                >
                                                                    Sign In
                                                                </Link>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setIsTrailerEnded(false)
                                                                setIsPlaying(true)
                                                                setTrailerStartTime(Date.now())
                                                                // Reset local video player if applicable
                                                                if (videoRef.current) {
                                                                    videoRef.current.currentTime = 0
                                                                    videoRef.current.play().catch(() => { })
                                                                }
                                                            }}
                                                            className="mt-4 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-white transition"
                                                        >
                                                            Watch Preview Again
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="relative z-20 w-24 h-24 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/30 hover:scale-110 active:scale-95 transition-all duration-300 shadow-2xl"
                                                    >
                                                        <div className="w-0 h-0 border-t-[18px] border-t-transparent border-l-[30px] border-l-white border-b-[18px] border-b-transparent ml-2 shadow-sm" />
                                                    </button>
                                                )}

                                                {!isTrailerEnded && (
                                                    <div className="absolute bottom-8 left-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 text-center">
                                                        <h2 className="text-white text-2xl font-black drop-shadow-2xl line-clamp-1 uppercase tracking-wider">{video.title}</h2>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 3. Error Layer */}
                                        {playerError && (
                                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 text-white p-8 text-center backdrop-blur-lg">
                                                <div className="text-red-500 mb-6 bg-red-500/10 p-4 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                                    </svg>
                                                </div>
                                                <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Playback Failure</h2>
                                                <p className="text-gray-400 text-sm mb-8 max-w-sm font-medium leading-relaxed">{playerError}</p>
                                                <button
                                                    onClick={() => {
                                                        setPlayerError(null)
                                                        setIsPlaying(false)
                                                        setIsTrailerEnded(false)
                                                    }}
                                                    className="px-10 py-4 bg-white text-black rounded-2xl font-black hover:bg-gray-200 active:scale-95 transition-all shadow-xl"
                                                >
                                                    RETRIEVE STREAM
                                                </button>
                                            </div>
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
