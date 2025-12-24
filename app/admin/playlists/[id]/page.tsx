'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TrashIcon, PlusIcon, ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        )
    }

    if (!playlist) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
                <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
                    <p className="text-white text-xl mb-4">Playlist not found</p>
                    <Link href="/admin/playlists" className="text-purple-400 hover:text-purple-300">
                        Go back to playlists
                    </Link>
                </div>
            </div>
        )
    }

    const availableVideos = allVideos.filter(
        video => !(playlist.videos || []).some(pv => pv.video.id === video.id)
    )

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto py-8">
                <Link
                    href="/admin/playlists"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Playlists
                </Link>

                <div className="glass rounded-2xl p-6 mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm font-semibold">Title</label>
                                        <input
                                            type="text"
                                            value={editedPlaylist.title}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm font-semibold">Description</label>
                                        <textarea
                                            value={editedPlaylist.description}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2 text-sm font-semibold">Thumbnail URL</label>
                                        <input
                                            type="url"
                                            value={editedPlaylist.thumbnailUrl}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, thumbnailUrl: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2">{playlist.title}</h1>
                                    <p className="text-gray-300">{playlist.description}</p>
                                    {playlist.thumbnailUrl && (
                                        <p className="text-gray-400 text-sm mt-2 line-clamp-1">Thumbnail: {playlist.thumbnailUrl}</p>
                                    )}
                                    <p className="text-gray-400 mt-2">{playlist.videos?.length || 0} videos</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 ml-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSavePlaylist}
                                        disabled={saving}
                                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                        Edit Info
                                    </button>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2"
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
                        <div className="text-center py-20 glass rounded-2xl">
                            <p className="text-gray-400 text-lg mb-4">No videos in this playlist yet</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                            >
                                Add Your First Video
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(playlist.videos || []).map((playlistVideo, index) => (
                                <div
                                    key={playlistVideo.id}
                                    className="glass rounded-2xl p-4 flex items-center gap-4"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                                        {index + 1}
                                    </div>

                                    <div className="flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-gray-800">
                                        {playlistVideo.video.thumbnailUrl ? (
                                            <img
                                                src={playlistVideo.video.thumbnailUrl}
                                                alt={playlistVideo.video.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold text-lg line-clamp-1">
                                            {playlistVideo.video.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-1">
                                            {playlistVideo.video.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${playlistVideo.video.accessType === 'PREMIUM'
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-green-500 text-white'
                                                }`}>
                                                {playlistVideo.video.accessType}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {playlistVideo.video.videoType}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveVideo(playlistVideo.video.id)}
                                        className="flex-shrink-0 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                            <div className="glass rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                                <h2 className="text-2xl font-bold text-white mb-4">Add Video to Playlist</h2>

                                {availableVideos.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">
                                        All videos have been added to this playlist
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {availableVideos.map((video) => (
                                            <div
                                                key={video.id}
                                                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition cursor-pointer"
                                                onClick={() => handleAddVideo(video.id)}
                                            >
                                                <div className="aspect-video bg-gray-800 rounded-lg mb-3 overflow-hidden">
                                                    {video.thumbnailUrl ? (
                                                        <img
                                                            src={video.thumbnailUrl}
                                                            alt={video.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-white font-semibold line-clamp-1 mb-1">
                                                    {video.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm line-clamp-2">
                                                    {video.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
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
