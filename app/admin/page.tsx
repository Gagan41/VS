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
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto pb-20">
                {/* Header Section */}
                <div className="mb-12 border-b border-primary/10 pb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-primary"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">
                            Control Center
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">Admin Dashboard</h1>
                    <p className="text-gray-300 text-lg font-medium">Manage your content, monitor analytics, and control your platform</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-surface rounded-2xl border border-primary/20 p-6 hover:border-primary/30 transition-smooth shadow-deep">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-400 text-sm font-semibold uppercase tracking-wide mb-2">Total Videos</p>
                                <p className="text-4xl font-black text-white">{stats.totalVideos}</p>
                            </div>
                            <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30">
                                <FilmIcon className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-surface rounded-2xl border border-primary/20 p-6 hover:border-primary/30 transition-smooth shadow-deep">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-400 text-sm font-semibold uppercase tracking-wide mb-2">Total Shorts</p>
                                <p className="text-4xl font-black text-white">{stats.totalShorts}</p>
                            </div>
                            <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30">
                                <VideoCameraIcon className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-surface rounded-2xl border border-primary/20 p-6 hover:border-primary/30 transition-smooth shadow-deep">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-400 text-sm font-semibold uppercase tracking-wide mb-2">Total Content</p>
                                <p className="text-4xl font-black text-white">{stats.totalVideos + stats.totalShorts}</p>
                            </div>
                            <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30">
                                <PlusIcon className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-1 h-6 bg-primary rounded-full"></span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            href="/admin/videos/new"
                            className="glass-surface rounded-2xl border border-primary/20 p-8 hover:border-primary/40 hover:shadow-glow-primary transition-smooth group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 gradient-primary rounded-2xl group-hover:scale-110 transition-smooth shadow-glow-primary">
                                    <FilmIcon className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-smooth">Upload Long Video</h3>
                                    <p className="text-gray-400 font-medium">Add a new full-length video to your library</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/shorts/new"
                            className="glass-surface rounded-2xl border border-primary/20 p-8 hover:border-primary/40 hover:shadow-glow-primary transition-smooth group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 gradient-primary rounded-2xl group-hover:scale-110 transition-smooth shadow-glow-primary">
                                    <VideoCameraIcon className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-smooth">Upload Short</h3>
                                    <p className="text-gray-400 font-medium">Add a new short-form video or reel</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/videos"
                            className="glass-surface rounded-2xl border border-primary/20 p-8 hover:border-primary/40 hover:shadow-glow-primary transition-smooth group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 gradient-surface rounded-2xl group-hover:scale-110 transition-smooth border border-primary/20">
                                    <FilmIcon className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-smooth">Manage Videos</h3>
                                    <p className="text-gray-400 font-medium">Edit or delete existing long-form videos</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/shorts"
                            className="glass-surface rounded-2xl border border-primary/20 p-8 hover:border-primary/40 hover:shadow-glow-primary transition-smooth group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 gradient-surface rounded-2xl group-hover:scale-110 transition-smooth border border-primary/20">
                                    <VideoCameraIcon className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-smooth">Manage Shorts</h3>
                                    <p className="text-gray-400 font-medium">Edit or delete existing short videos</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/admin/playlists"
                            className="glass-surface rounded-2xl border border-primary/20 p-8 hover:border-primary/40 hover:shadow-glow-primary transition-smooth group md:col-span-2"
                        >
                            <div className="flex items-center gap-6">
                                <div className="p-5 gradient-surface rounded-2xl group-hover:scale-110 transition-smooth border border-primary/20">
                                    <QueueListIcon className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-smooth">Manage Playlists</h3>
                                    <p className="text-gray-400 font-medium">Create, organize, and manage video playlists</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Analytics Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
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
