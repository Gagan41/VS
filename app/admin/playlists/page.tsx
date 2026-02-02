'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Playlist {
    id: string
    title: string
    description: string
    thumbnailUrl: string | null
    createdAt: string
    _count?: {
        videos: number
    }
}

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newPlaylist, setNewPlaylist] = useState({
        title: '',
        description: '',
        thumbnailUrl: ''
    })
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchPlaylists()
    }, [])

    const fetchPlaylists = async () => {
        try {
            const response = await fetch('/api/admin/playlists')
            const data = await response.json()
            if (Array.isArray(data)) {
                setPlaylists(data)
            } else {
                console.error('Invalid playlists data:', data)
                setPlaylists([])
                if (data.error) {
                    toast.error(data.error)
                }
            }
        } catch (error) {
            console.error('Error fetching playlists:', error)
            toast.error('Failed to load playlists')
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newPlaylist.title || !newPlaylist.description) {
            toast.error('Title and description are required')
            return
        }

        setCreating(true)
        try {
            const response = await fetch('/api/admin/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlaylist)
            })

            if (!response.ok) {
                throw new Error('Failed to create playlist')
            }

            const playlist = await response.json()
            setPlaylists([playlist, ...playlists])
            setNewPlaylist({ title: '', description: '', thumbnailUrl: '' })
            setShowCreateModal(false)
            toast.success('Playlist created successfully!')
        } catch (error) {
            toast.error('Failed to create playlist')
        } finally {
            setCreating(false)
        }
    }

    const handleDeletePlaylist = async (id: string) => {
        if (!confirm('Are you sure you want to delete this playlist?')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/playlists/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete playlist')
            }

            setPlaylists(playlists.filter(p => p.id !== id))
            toast.success('Playlist deleted successfully')
        } catch (error) {
            toast.error('Failed to delete playlist')
        }
    }

    return (
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            <main className="max-w-7xl mx-auto pt-6 pb-8">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                    <div>
                        <h1 className="text-4xl font-bold text-black mb-2">Manage Playlists</h1>
                        <p className="text-gray-600 font-medium">Create and organize video playlists</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-black text-white font-black rounded-lg hover:bg-gray-800 transition-all shadow-lg uppercase tracking-wider text-sm flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Playlist
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : playlists.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-lg mb-4 font-bold">No playlists created yet</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-block px-8 py-3 bg-black text-white font-black rounded-lg hover:bg-gray-800 transition shadow-lg uppercase tracking-wider text-sm"
                        >
                            Create Your First Playlist
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {playlists.map((playlist) => (
                            <div key={playlist.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                    {playlist.thumbnailUrl ? (
                                        <img
                                            src={playlist.thumbnailUrl}
                                            alt={playlist.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-full">
                                        {playlist._count?.videos || 0} videos
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-black font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                        {playlist.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 font-medium">
                                        {playlist.description}
                                    </p>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/playlists/${playlist.id}`}
                                            className="flex-1 py-2.5 px-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg text-center flex items-center justify-center gap-2"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePlaylist(playlist.id)}
                                            className="py-2.5 px-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2 shadow-md shadow-red-200"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Playlist Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <h2 className="text-2xl font-bold text-black mb-6">Create New Playlist</h2>
                            <form onSubmit={handleCreatePlaylist}>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-black mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={newPlaylist.title}
                                        onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-black mb-2">Description</label>
                                    <textarea
                                        value={newPlaylist.description}
                                        onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-black mb-2">Thumbnail URL (optional)</label>
                                    <input
                                        type="url"
                                        value={newPlaylist.thumbnailUrl}
                                        onChange={(e) => setNewPlaylist({ ...newPlaylist, thumbnailUrl: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 py-3 px-4 bg-black text-white font-black rounded-xl hover:bg-gray-800 transition shadow-lg uppercase tracking-wider text-sm disabled:opacity-50"
                                    >
                                        {creating ? 'Creating...' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-3 bg-white border-2 border-black text-black font-bold rounded-xl hover:bg-gray-50 transition-all font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
