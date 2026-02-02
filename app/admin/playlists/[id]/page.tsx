'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TrashIcon, PlusIcon, ArrowLeftIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import SearchInput from '@/components/SearchInput'

interface PlaylistVideo {
    id: string
    order: number
    video: {
        id: string
        title: string
        description: string
        thumbnailUrl: string | null
        videoType: string
        accessType: string
    }
}

interface Playlist {
    id: string
    title: string
    description: string
    thumbnailUrl: string | null
    videos?: PlaylistVideo[]
}

export default function PlaylistEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const [playlist, setPlaylist] = useState<Playlist | null>(null)
    const [allVideos, setAllVideos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedPlaylist, setEditedPlaylist] = useState({ title: '', description: '', thumbnailUrl: '' })
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (id) {
            fetchPlaylist()
            fetchAllVideos()
        }
    }, [id])

    const fetchPlaylist = async () => {
        try {
            const response = await fetch(`/api/admin/playlists/${id}`)
            const data = await response.json()
            setPlaylist(data)
            setEditedPlaylist({
                title: data.title || '',
                description: data.description || '',
                thumbnailUrl: data.thumbnailUrl || ''
            })
        } catch (error) {
            console.error('Error fetching playlist:', error)
            toast.error('Failed to load playlist')
        } finally {
            setLoading(false)
        }
    }

    const fetchAllVideos = async () => {
        try {
            const response = await fetch('/api/videos')
            const data = await response.json()
            setAllVideos(data)
        } catch (error) {
            console.error('Error fetching videos:', error)
        }
    }

    const handleAddVideo = async (videoId: string) => {
        try {
            const response = await fetch(`/api/admin/playlists/${id}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to add video')
            }

            toast.success('Video added to playlist')
            fetchPlaylist()
            setShowAddModal(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to add video')
        }
    }

    const handleRemoveVideo = async (videoId: string) => {
        if (!confirm('Remove this video from the playlist?')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/playlists/${id}/videos?videoId=${videoId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to remove video')
            }

            toast.success('Video removed from playlist')
            fetchPlaylist()
        } catch (error) {
            toast.error('Failed to remove video')
        }
    }

    const handleSavePlaylist = async () => {
        if (!editedPlaylist.title || !editedPlaylist.description) {
            toast.error('Title and description are required')
            return
        }

        setSaving(true)
        try {
            const response = await fetch(`/api/admin/playlists/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedPlaylist)
            })

            if (!response.ok) {
                throw new Error('Failed to update playlist')
            }

            const updated = await response.json()
            setPlaylist(updated)
            setIsEditing(false)
            toast.success('Playlist updated successfully!')
        } catch (error) {
            toast.error('Failed to update playlist')
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEdit = () => {
        setEditedPlaylist({
            title: playlist?.title || '',
            description: playlist?.description || '',
            thumbnailUrl: playlist?.thumbnailUrl || ''
        })
        setIsEditing(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!playlist) {
        return (
            <div className="min-h-screen bg-white">
                <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
                    <p className="text-black text-xl mb-4 font-bold">Playlist not found</p>
                    <Link href="/admin/playlists" className="text-primary hover:underline font-bold">
                        Go back to playlists
                    </Link>
                </div>
            </div>
        )
    }

    const availableVideos = allVideos.filter(
        video => !(playlist.videos || []).some(pv => pv.video.id === video.id)
    )

    const filteredAvailableVideos = availableVideos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto py-8">
                <Link
                    href="/admin/playlists"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-bold"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Playlists
                </Link>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-black mb-2 text-sm font-bold">Title</label>
                                        <input
                                            type="text"
                                            value={editedPlaylist.title}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-black mb-2 text-sm font-bold">Description</label>
                                        <textarea
                                            value={editedPlaylist.description}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-black mb-2 text-sm font-bold">Thumbnail URL</label>
                                        <input
                                            type="url"
                                            value={editedPlaylist.thumbnailUrl}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, thumbnailUrl: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-4xl font-black text-black mb-2">{playlist.title}</h1>
                                    <p className="text-gray-600 text-lg font-medium">{playlist.description}</p>
                                    {playlist.thumbnailUrl && (
                                        <p className="text-gray-500 text-sm mt-3 font-medium flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                            Thumbnail: {playlist.thumbnailUrl}
                                        </p>
                                    )}
                                    <p className="text-primary font-bold mt-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                        {playlist.videos?.length || 0} videos
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 ml-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSavePlaylist}
                                        disabled={saving}
                                        className="px-6 py-3 bg-black text-white font-black rounded-xl hover:bg-gray-800 transition-all shadow-lg uppercase tracking-wider text-sm disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="px-6 py-3 bg-white border-2 border-black text-black font-black rounded-xl hover:bg-gray-50 transition-all uppercase tracking-wider text-sm disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-3 bg-white border-2 border-black text-black font-black rounded-xl hover:bg-gray-50 transition-all shadow-sm uppercase tracking-wider text-sm flex items-center gap-2"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                        Edit Info
                                    </button>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-6 py-3 bg-black text-white font-black rounded-xl hover:bg-gray-800 transition-all shadow-lg uppercase tracking-wider text-sm flex items-center gap-2"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        Add Video
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {
                    (playlist.videos || []).length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
                            <p className="text-gray-500 text-lg mb-4 font-bold">No videos in this playlist yet</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-block px-8 py-3 bg-black text-white font-black rounded-xl hover:bg-gray-800 transition shadow-lg uppercase tracking-wider text-sm"
                            >
                                Add Your First Video
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(playlist.videos || []).map((playlistVideo, index) => (
                                <div
                                    key={playlistVideo.id}
                                    className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-6 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-black font-black shadow-[0_8px_20px_-4px_rgba(37,99,235,0.6)]">
                                        {index + 1}
                                    </div>

                                    <div className="flex-shrink-0 w-40 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                        {playlistVideo.video.thumbnailUrl ? (
                                            <img
                                                src={playlistVideo.video.thumbnailUrl}
                                                alt={playlistVideo.video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-black font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                            {playlistVideo.video.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-1 font-medium">
                                            {playlistVideo.video.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded uppercase tracking-wider ${playlistVideo.video.accessType === 'PREMIUM'
                                                ? 'bg-black text-white'
                                                : 'bg-green-100 text-green-700 border border-green-200'
                                                }`}>
                                                {playlistVideo.video.accessType}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-gray-100 px-2.5 py-0.5 rounded">
                                                {playlistVideo.video.videoType}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveVideo(playlistVideo.video.id)}
                                        className="flex-shrink-0 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                }

                {/* Add Video Modal */}
                {
                    showAddModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                                <h2 className="text-3xl font-black text-black mb-6">Add Video to Playlist</h2>

                                <div className="mb-8">
                                    <SearchInput
                                        value={searchTerm}
                                        onSearch={setSearchTerm}
                                        placeholder="Search videos by title or description..."
                                        className="max-w-none"
                                        delay={0}
                                    />
                                </div>

                                {availableVideos.length === 0 ? (
                                    <p className="text-gray-500 text-center py-12 font-bold text-lg">
                                        All videos have been added to this playlist
                                    </p>
                                ) : filteredAvailableVideos.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 font-bold text-lg mb-2">No videos found matching "{searchTerm}"</p>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="text-primary font-bold hover:underline"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {filteredAvailableVideos.map((video) => (
                                            <div
                                                key={video.id}
                                                className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group"
                                                onClick={() => handleAddVideo(video.id)}
                                            >
                                                <div className="aspect-video bg-gray-200 rounded-xl mb-4 overflow-hidden border border-gray-100">
                                                    {video.thumbnailUrl ? (
                                                        <img
                                                            src={video.thumbnailUrl}
                                                            alt={video.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-black font-bold line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                                    {video.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm line-clamp-2 font-medium">
                                                    {video.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setSearchTerm('')
                                    }}
                                    className="w-full py-4 px-4 bg-white border-2 border-black text-black font-black rounded-xl hover:bg-gray-50 transition-all uppercase tracking-wider text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                }
            </main>
        </div>
    )
}
