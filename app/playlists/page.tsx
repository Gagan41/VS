'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayIcon, ListVideo, SparklesIcon, UserCircleIcon, LayoutList, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'
import SearchInput from '@/components/SearchInput'

export default function PlaylistsPage() {
    const { data: session } = useSession()
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchPlaylists()
    }, [searchQuery])

    const fetchPlaylists = async () => {
        setLoading(true)
        try {
            const url = `/api/playlists${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`
            const response = await fetch(url)
            const data = await response.json()
            setPlaylists(data)
        } catch (error) {
            console.error('Error fetching playlists:', error)
        } finally {
            setLoading(false)
        }
    }

    const adminPlaylists = playlists.filter((p: any) => p.createdBy?.role === 'ADMIN')
    const userPlaylists = playlists.filter((p: any) => p.createdBy?.role !== 'ADMIN')

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto pb-20 space-y-10">

                {/* Header with Search */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-600/20 text-primary-400 rounded-2xl">
                                <SparklesIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white">Playlists</h1>
                                <p className="text-gray-400">Curated video collections</p>
                            </div>
                        </div>
                        <div className="w-full md:w-96">
                            <SearchInput
                                onSearch={setSearchQuery}
                                placeholder="Search playlists..."
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-video bg-white/5 rounded-2xl"></div>
                                <div className="h-4 bg-white/5 rounded-full w-3/4 mx-2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Search Results / Combined View */}
                        {searchQuery ? (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-gradient-purple rounded-full"></div>
                                    <h2 className="text-2xl font-bold text-white">Search Results</h2>
                                    <span className="px-3 py-1 bg-primary-700/20 text-primary-400 text-xs font-bold rounded-full">
                                        {playlists.length}
                                    </span>
                                </div>

                                {playlists.length === 0 ? (
                                    <div className="text-center py-20 glass-strong rounded-3xl border border-white/5">
                                        <LayoutList className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                                            No playlists match "{searchQuery}"
                                        </p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-smooth"
                                        >
                                            Clear Search
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {playlists.map((playlist: any) => (
                                            <PlaylistCard key={playlist.id} playlist={playlist} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        ) : (
                            <>
                                {/* Featured Collections */}
                                {adminPlaylists.length > 0 && (
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-gradient-purple rounded-full"></div>
                                            <h2 className="text-2xl font-bold text-white">Featured Collections</h2>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {adminPlaylists.map((playlist: any) => (
                                                <PlaylistCard key={playlist.id} playlist={playlist} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* My Playlists */}
                                {userPlaylists.length > 0 && (
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                                            <h2 className="text-2xl font-bold text-white">My Playlists</h2>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {userPlaylists.map((playlist: any) => (
                                                <PlaylistCard key={playlist.id} playlist={playlist} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {playlists.length === 0 && (
                                    <div className="text-center py-20 glass-strong rounded-3xl border border-white/5">
                                        <LayoutList className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No playlists available</p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

function PlaylistCard({ playlist }: { playlist: any }) {
    return (
        <Link
            href={`/home?playlistId=${playlist.id}`}
            className="group relative glass rounded-2xl overflow-hidden border border-white/5 hover:border-primary-600/30 hover:shadow-purple-glow/20 transition-all duration-300 hover:scale-[1.02] block"
        >
            <div className="aspect-video bg-gray-900 relative overflow-hidden">
                {playlist.thumbnailUrl ? (
                    <Image
                        src={playlist.thumbnailUrl}
                        alt={playlist.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-950 to-gray-900">
                        <ListVideo className="w-12 h-12 text-primary-800/50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-4 bg-primary-600/20 rounded-full border border-primary-500/30 backdrop-blur-sm">
                        <PlayIcon className="w-8 h-8 text-primary-400 fill-primary-400" />
                    </div>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg backdrop-blur-md border border-white/10">
                    {playlist._count?.videos || 0} Videos
                </div>
            </div>
            <div className="p-5">
                <h3 className="text-white font-bold text-base line-clamp-1 mb-1 group-hover:text-primary-400 transition-colors">{playlist.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 text-no-overflow">{playlist.description || 'No description'}</p>
            </div>
        </Link>
    )
}
