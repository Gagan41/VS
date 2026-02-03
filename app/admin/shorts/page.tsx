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
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            <main className="max-w-7xl mx-auto pt-6 pb-8">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div>
                        <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Manage Shorts</h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Edit or delete your shorts/reels</p>
                    </div>
                    <Link
                        href="/admin/shorts/new"
                        className="px-6 py-3 bg-primary text-black font-black rounded-lg hover:bg-primary/90 transition shadow-lg uppercase tracking-wider text-sm"
                    >
                        Upload New Short
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : shorts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-white/10">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4 font-bold">No shorts uploaded yet</p>
                        <Link
                            href="/admin/shorts/new"
                            className="inline-block px-8 py-3 bg-primary text-black font-black rounded-lg hover:bg-primary/90 transition shadow-lg uppercase tracking-wider text-sm"
                        >
                            Upload Your First Short
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {shorts.map((short: any) => (
                            <div key={short.id} className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-[9/16] bg-gray-100 dark:bg-zinc-800 relative overflow-hidden">
                                    {short.thumbnailUrl && (
                                        <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover" />
                                    )}
                                    {short.accessType === 'PREMIUM' && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-black text-xs font-black rounded shadow-lg uppercase italic">
                                            PREMIUM
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-black dark:text-white font-bold mb-1 line-clamp-2 group-hover:text-primary transition-colors">{short.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 font-medium">{short.description}</p>
                                    <button
                                        onClick={() => handleDelete(short.id)}
                                        className="w-full py-2.5 px-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-red-200"
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
