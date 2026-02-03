'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import VideoCard from '@/components/VideoCard'
import SearchInput from '@/components/SearchInput'

function HomeContent() {
    const { data: session } = useSession()
    const user = session?.user as any
    const searchParams = useSearchParams()
    const playlistId = searchParams.get('playlistId')

    const [videos, setVideos] = useState<any[]>([])
    const [playlistName, setPlaylistName] = useState('')
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchVideos()
    }, [playlistId, searchQuery])

    const fetchVideos = async () => {
        setLoading(true)
        try {
            let url = `/api/videos?type=LONG${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`
            if (playlistId) {
                const playlistRes = await fetch(`/api/admin/playlists/${playlistId}`)
                const playlistData = await playlistRes.json()
                if (!playlistData.error) {
                    setPlaylistName(playlistData.title)
                    let filteredVideos = playlistData.videos.map((pv: any) => pv.video)
                    if (searchQuery) {
                        const lowQ = searchQuery.toLowerCase()
                        filteredVideos = filteredVideos.filter((v: any) =>
                            v.title.toLowerCase().includes(lowQ) ||
                            v.description?.toLowerCase().includes(lowQ)
                        )
                    }
                    setVideos(filteredVideos)
                    setLoading(false)
                    return
                }
            } else {
                setPlaylistName('')
            }

            const response = await fetch(url)
            const data = await response.json()
            setVideos(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 bg-white dark:bg-transparent">
            <main className="max-w-7xl mx-auto pb-20">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-black dark:text-white/70">
                                {playlistName ? 'Featured Collection' : 'Personalized Stream'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                            {playlistName || (user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Discover High-Fidelity Content')}
                        </h1>
                        <p className="text-gray-700 dark:text-gray-400 text-lg font-medium max-w-xl">
                            {playlistName
                                ? `Now streaming: "${playlistName}". Handpicked selection for our library.`
                                : "The absolute best in long-form entertainment and professional insights, curated specifically for you."}
                        </p>
                    </div>

                    <div className="w-full md:w-auto">
                        <SearchInput
                            onSearch={setSearchQuery}
                            placeholder="Search library..."
                            className="w-full md:min-w-[400px]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4 animate-pulse">
                                <div className="aspect-video bg-gray-200 dark:bg-zinc-800 rounded-2xl"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-full w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-full w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-gray-200 dark:border-white/10 p-8 shadow-md transition-colors duration-300">
                        <div className="text-center py-32">
                            <p className="text-gray-300 dark:text-zinc-700 font-black text-3xl uppercase tracking-widest mb-4">No Signal Detected</p>
                            <p className="text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-widest text-xs">Awaiting new data transmissions.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {videos.map((video: any) => (
                            <VideoCard key={video.id} video={video} playlistId={playlistId} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-gray-200 dark:border-zinc-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    )
}
