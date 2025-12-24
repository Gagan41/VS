'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ViewAnalyticsChartProps {
    className?: string
}

export default function ViewAnalyticsChart({ className = '' }: ViewAnalyticsChartProps) {
    const [period, setPeriod] = useState('30d')
    const [data, setData] = useState<any[]>([])
    const [totalViews, setTotalViews] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [period])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/admin/analytics?period=${period}`)
            const result = await response.json()

            if (result.error) {
                console.error('Analytics error:', result.error)
                return
            }

            setData(Array.isArray(result.dailyViews) ? result.dailyViews : [])
            setTotalViews(typeof result.totalViews === 'number' ? result.totalViews : 0)
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <div className={`glass rounded-2xl p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">View Analytics</h2>
                    <p className="text-gray-400">Total Views: {totalViews.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d', '1y'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${period === p
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                    No view data available for this period
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            labelFormatter={formatDate}
                        />
                        <Line
                            type="monotone"
                            dataKey="views"
                            stroke="#9333ea"
                            strokeWidth={3}
                            fill="url(#colorViews)"
                            dot={{ fill: '#9333ea', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
