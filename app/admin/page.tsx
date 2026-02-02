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
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            <main className="max-w-7xl mx-auto pb-20">
                {/* Header Section */}
                <div className="mb-12 border-b border-gray-100 pb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">
                            Control Center
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-black leading-tight mb-3">Admin Dashboard</h1>
                    <p className="text-gray-700 text-lg font-medium">Manage your content, monitor analytics, and control your platform</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide mb-2">Total Videos</p>
                                <p className="text-4xl font-black text-black">{stats.totalVideos}</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                <FilmIcon className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide mb-2">Total Shorts</p>
                                <p className="text-4xl font-black text-black">{stats.totalShorts}</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                <VideoCameraIcon className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide mb-2">Total Content</p>
                                <p className="text-4xl font-black text-black">{stats.totalVideos + stats.totalShorts}</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                <PlusIcon className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                        <span className="w-1 h-6 bg-primary rounded-full"></span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            href="/admin/videos/new"
                            className="bg-gray-50 rounded-2xl border border-gray-100 p-8 hover:border-primary/40 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-primary rounded-2xl group-hover:scale-110 transition-all shadow-[0_10px_25px_-5px_rgba(37,99,235,0.6)] text-black">
                                    <FilmIcon className="w-10 h-10 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-2 group-hover:text-primary transition-all">Upload Long Video</h3>
                                    <p className="text-gray-600 font-medium">Add a new full-length video to your library</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/shorts/new"
                            className="bg-gray-50 rounded-2xl border border-gray-100 p-8 hover:border-primary/40 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-primary rounded-2xl group-hover:scale-110 transition-all shadow-[0_10px_25px_-5px_rgba(37,99,235,0.6)] text-black">
                                    <VideoCameraIcon className="w-10 h-10 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-2 group-hover:text-primary transition-all">Upload Short</h3>
                                    <p className="text-gray-600 font-medium">Add a new short-form video or reel</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/videos"
                            className="bg-gray-50 rounded-2xl border border-gray-100 p-8 hover:border-primary/40 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-white rounded-2xl group-hover:scale-110 transition-all border border-gray-100 shadow-sm">
                                    <FilmIcon className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-2 group-hover:text-primary transition-all">Manage Videos</h3>
                                    <p className="text-gray-600 font-medium">Edit or delete existing long-form videos</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/shorts"
                            className="bg-gray-50 rounded-2xl border border-gray-100 p-8 hover:border-primary/40 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-white rounded-2xl group-hover:scale-110 transition-all border border-gray-100 shadow-sm">
                                    <VideoCameraIcon className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-2 group-hover:text-primary transition-all">Manage Shorts</h3>
                                    <p className="text-gray-600 font-medium">Edit or delete existing short videos</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/playlists"
                            className="bg-gray-50 rounded-2xl border border-gray-100 p-8 hover:border-primary/40 hover:shadow-lg transition-all group md:col-span-2"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-white rounded-2xl group-hover:scale-110 transition-all border border-gray-100 shadow-sm">
                                    <QueueListIcon className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black mb-2 group-hover:text-primary transition-all">Manage Playlists</h3>
                                    <p className="text-gray-600 font-medium">Create, organize, and manage video playlists</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Analytics Section */}
                <div>
                    <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                        <span className="w-1 h-6 bg-primary rounded-full"></span>
                        Analytics Overview
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ViewAnalyticsChart />
                        <TopVideosTable />
                    </div>
                </div>
            </main>
        </div>
    )
}
