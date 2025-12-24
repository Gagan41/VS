'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function ManageShortsPage() {
    const [shorts, setShorts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchShorts()
    }, [])

    const fetchShorts = async () => {
        try {
            const response = await fetch('/api/videos?type=SHORT')
            const data = await response.json()
            setShorts(data)
        } catch (error) {
            console.error('Error fetching shorts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this short?')) return

        try {
            const response = await fetch(`/api/videos/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast.success('Short deleted successfully')
                fetchShorts()
            } else {
                toast.error('Failed to delete short')
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Manage Shorts</h1>
                        <p className="text-gray-300">Edit or delete your shorts/reels</p>
                    </div>
                    <Link
                        href="/admin/shorts/new"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                    >
                        Upload New Short
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : shorts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg mb-4">No shorts uploaded yet</p>
                        <Link
                            href="/admin/shorts/new"
                            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
                        >
                            Upload Your First Short
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {shorts.map((short: any) => (
                            <div key={short.id} className="glass rounded-2xl overflow-hidden group">
                                <div className="aspect-[9/16] bg-gray-800 relative">
                                    {short.thumbnailUrl && (
                                        <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover" />
                                    )}
                                    {short.accessType === 'PREMIUM' && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded">
                                            PREMIUM
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold mb-1 line-clamp-2">{short.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{short.description}</p>
                                    <button
                                        onClick={() => handleDelete(short.id)}
                                        className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
