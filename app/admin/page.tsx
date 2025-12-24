'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusIcon, FilmIcon, VideoCameraIcon, QueueListIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import ViewAnalyticsChart from '@/components/ViewAnalyticsChart'
import TopVideosTable from '@/components/TopVideosTable'

export default function AdminPage() {
    const [stats, setStats] = useState({
        totalVideos: 0,
        totalShorts: 0,
        totalUsers: 0,
    })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const videosRes = await fetch('/api/videos?type=LONG')
            const videos = await videosRes.json()

            const shortsRes = await fetch('/api/videos?type=SHORT')
            const shorts = await shortsRes.json()

            setStats({
                totalVideos: videos.length,
                totalShorts: shorts.length,
                totalUsers: 0, // Would need separate API
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 sm:p-6 lg:p-8">

            <main className="max-w-7xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-300">Manage your content and platform</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Videos</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.totalVideos}</p>
                            </div>
                            <FilmIcon className="w-12 h-12 text-purple-400" />
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Shorts</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.totalShorts}</p>
                            </div>
                            <VideoCameraIcon className="w-12 h-12 text-blue-400" />
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Content</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.totalVideos + stats.totalShorts}</p>
                            </div>
                            <PlusIcon className="w-12 h-12 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        href="/admin/videos/new"
                        className="glass rounded-2xl p-8 hover:bg-white/20 transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-600 rounded-full group-hover:scale-110 transition">
                                <FilmIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Upload Long Video</h3>
                                <p className="text-gray-400">Add a new full-length video</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/shorts/new"
                        className="glass rounded-2xl p-8 hover:bg-white/20 transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-600 rounded-full group-hover:scale-110 transition">
                                <VideoCameraIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Upload Short</h3>
                                <p className="text-gray-400">Add a new short/reel</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/videos"
                        className="glass rounded-2xl p-8 hover:bg-white/20 transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-green-600 rounded-full group-hover:scale-110 transition">
                                <FilmIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Manage Videos</h3>
                                <p className="text-gray-400">Edit or delete existing videos</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/shorts"
                        className="glass rounded-2xl p-8 hover:bg-white/20 transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-orange-600 rounded-full group-hover:scale-110 transition">
                                <VideoCameraIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Manage Shorts</h3>
                                <p className="text-gray-400">Edit or delete existing shorts</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/playlists"
                        className="glass rounded-2xl p-8 hover:bg-white/20 transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-pink-600 rounded-full group-hover:scale-110 transition">
                                <QueueListIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Manage Playlists</h3>
                                <p className="text-gray-400">Create and organize playlists</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Analytics Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ViewAnalyticsChart />
                    <TopVideosTable />
                </div>
            </main>
        </div>
    )
}
