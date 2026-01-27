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

    const [videos, setVideos] = useState([])
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
                // ... same as before but maybe search within playlist if possible, 
                // but for now we'll stick to general search or just playlist content
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
            setVideos(data)
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900 p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto pb-20">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
                                {playlistName ? 'Featured Collection' : 'Personalized Stream'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                            {playlistName || (user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Discover High-Fidelity Content')}
                        </h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl">
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
                                <div className="aspect-video bg-white/5 rounded-2xl"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-white/5 rounded-full w-3/4"></div>
                                    <div className="h-3 bg-white/5 rounded-full w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-40 glass rounded-3xl border border-white/5">
                        <p className="text-white/20 font-black text-3xl uppercase tracking-widest mb-4">No Signal Detected</p>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Awaiting new data transmissions.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {videos.map((video: any) => (
                            <VideoCard key={video.id} video={video} />
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
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    )
}
