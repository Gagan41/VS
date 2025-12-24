'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlayIcon, ListVideo, SparklesIcon, UserCircleIcon, LayoutList } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function PlaylistsPage() {
    const { data: session } = useSession()
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPlaylists()
    }, [])

    const fetchPlaylists = async () => {
        try {
            const response = await fetch('/api/playlists')
            const data = await response.json()
            setPlaylists(data)
        } catch (error) {
            console.error('Error fetching playlists:', error)
        } finally {
            setLoading(false)
        }
    }

    const adminPlaylists = playlists.filter((p: any) => p.createdBy.role === 'ADMIN')

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <main className="max-w-7xl mx-auto py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-video bg-white/5 rounded-[2rem]"></div>
                                <div className="h-4 bg-white/5 rounded-full w-3/4 mx-2"></div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto py-8 space-y-16">

                {/* Admin Collections */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="p-3 bg-purple-600/20 text-purple-500 rounded-2xl">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white">Featured Collections</h2>
                            <p className="text-gray-400 font-medium">Handpicked streams by the administration</p>
                        </div>
                    </div>

                    {adminPlaylists.length === 0 ? (
                        <div className="text-center py-20 glass rounded-[3rem] border border-white/5">
                            <LayoutList className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No featured collections available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {adminPlaylists.map((playlist: any) => (
                                <PlaylistCard key={playlist.id} playlist={playlist} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

function PlaylistCard({ playlist }: { playlist: any }) {
    return (
        <Link
            href={`/home?playlistId=${playlist.id}`}
            className="group relative glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all hover:scale-[1.02] block"
        >
            <div className="aspect-video bg-gray-900 relative overflow-hidden">
                {playlist.thumbnailUrl ? (
                    <img src={playlist.thumbnailUrl} alt={playlist.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <ListVideo className="w-12 h-12 text-gray-800" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="p-4 bg-white/10 rounded-full border border-white/20">
                        <PlayIcon className="w-8 h-8 text-white fill-white" />
                    </div>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white text-[10px] font-black uppercase tracking-widest rounded-xl backdrop-blur-md border border-white/10">
                    {playlist._count?.videos || 0} Entries
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-white font-bold text-lg line-clamp-1 mb-1">{playlist.title}</h3>
                <p className="text-gray-500 text-sm font-medium line-clamp-1">{playlist.description}</p>
            </div>
        </Link>
    )
}
