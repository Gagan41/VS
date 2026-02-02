'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatWatchTime, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/cropping'
import {
    UserIcon,
    CreditCardIcon,
    HistoryIcon,
    BarChart3,
    CameraIcon,
    TrashIcon,
    XIcon,
    CheckIcon
} from 'lucide-react'

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [activeTab, setActiveTab] = useState('account')
    const [watchHistory, setWatchHistory] = useState([])
    const [totalWatchTime, setTotalWatchTime] = useState(0)
    const [name, setName] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [profileFile, setProfileFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Cropping state
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [showCropper, setShowCropper] = useState(false)

    const user = session?.user as any

    useEffect(() => {
        if (profileFile) {
            const url = URL.createObjectURL(profileFile)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setPreviewUrl(null)
        }
    }, [profileFile])

    useEffect(() => {
        if (user) {
            setName(user.name || '')
        }
        fetchWatchHistory()
    }, [user])

    const fetchWatchHistory = async () => {
        try {
            const response = await fetch('/api/watch-history')
            const data = await response.json()
            setWatchHistory(data)

            const total = data.reduce((sum: number, item: any) => sum + item.totalWatchTimeSeconds, 0)
            setTotalWatchTime(total)
        } catch (error) {
            console.error('Error fetching watch history:', error)
        }
    }

    const handleRemovePhoto = async () => {
        if (!confirm('Are you sure you want to remove your profile photo?')) return
        setIsUploading(true)
        try {
            const response = await fetch('/api/user/profile-photo', {
                method: 'DELETE'
            })

            if (response.ok) {
                toast.success('Photo removed')
                await update({ image: null })
            } else {
                toast.error('Failed to remove photo')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsUploading(false)
        }
    }

    const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleUploadProfile = async () => {
        if (!profileFile || !croppedAreaPixels || !previewUrl) return
        setIsUploading(true)
        try {
            const croppedImage = await getCroppedImg(
                previewUrl,
                croppedAreaPixels
            )

            if (!croppedImage) {
                toast.error('Failed to crop image')
                return
            }

            const formData = new FormData()
            formData.append('file', croppedImage, 'profile.jpg')

            const response = await fetch('/api/user/profile-photo', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                toast.success('Profile photo updated!')
                setProfileFile(null)
                setShowCropper(false)
                await update({ image: data.url })
            } else {
                toast.error('Upload failed')
            }
        } catch (error) {
            console.error(error)
            toast.error('Something went wrong')
        } finally {
            setIsUploading(false)
        }
    }

    const handleUpdateName = async () => {
        if (!name.trim()) return
        try {
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })

            if (response.ok) {
                toast.success('Name updated successfully!')
                setIsEditing(false)
                await update({ name })
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to update name')
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    const tabs = [
        { id: 'account', label: 'Account', icon: UserIcon },
        { id: 'subscription', label: 'Subscription', icon: CreditCardIcon },
        { id: 'history', label: 'Watch History', icon: HistoryIcon },
    ]

    return (
        <div className="min-h-screen pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            <main className="max-w-6xl mx-auto pb-20">
                <div className="mb-12 border-b border-gray-200 pb-10">
                    <h1 className="text-5xl font-black text-black mb-3">My Profile</h1>
                    <p className="text-gray-700 text-lg font-medium">Manage your personal settings and consumption data.</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-10 bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-[10px] transition-all ${activeTab === tab.id
                                ? 'bg-black text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-200 hover:text-black'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Account Settings */}
                {activeTab === 'account' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm text-center">
                                <div className="relative inline-block group">
                                    <div className="w-40 h-40 rounded-[2rem] overflow-hidden bg-gray-100 border-4 border-gray-50 mx-auto transition-transform duration-500 group-hover:scale-105 shadow-inner">
                                        {user?.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-300">
                                                {user?.name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-3 bg-black text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition group/icon">
                                        <CameraIcon className="w-5 h-5" />
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    setProfileFile(file)
                                                    setShowCropper(true)
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="mt-6 space-y-2">
                                    <h2 className="text-2xl font-black text-black">{user?.name}</h2>
                                    <p className="text-gray-600 font-bold">{user?.email}</p>
                                    <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mt-2 border border-primary/20">
                                        {user?.role} Access
                                    </div>
                                    {user?.image && (
                                        <button
                                            onClick={handleRemovePhoto}
                                            className="flex items-center gap-2 mx-auto mt-6 text-xs font-bold text-red-400 hover:text-red-300 transition"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                            Remove Photo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm space-y-10">
                                <h3 className="text-xl font-black text-black flex items-center gap-3 uppercase tracking-tight">
                                    <span className="w-2 h-7 bg-black rounded-full"></span>
                                    Identity Details
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Display Name</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={!isEditing}
                                                className={`flex-1 bg-gray-50 px-6 py-4 rounded-2xl text-black font-black transition-all focus:ring-2 focus:ring-primary outline-none ${isEditing ? 'border-primary' : 'border-gray-200 opacity-80'
                                                    }`}
                                            />
                                            {isEditing ? (
                                                <div className="flex gap-2">
                                                    <button onClick={handleUpdateName} className="p-4 bg-green-100 text-green-600 rounded-2xl hover:bg-green-200 transition">
                                                        <CheckIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => setIsEditing(false)} className="p-4 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition">
                                                        <XIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setIsEditing(true)} className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition shadow-md">
                                                    Change
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 opacity-80">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                                        <div className="bg-gray-100 px-6 py-4 rounded-2xl text-black font-bold border border-gray-200">
                                            {user?.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Member Since</p>
                                    <p className="text-2xl font-black text-black tracking-tight">December 2025</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Account Type</p>
                                    <p className="text-2xl font-black text-primary tracking-tight uppercase">{user?.subscriptionStatus?.toLowerCase() || 'Standard'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Watch History */}
                {activeTab === 'history' && (
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-black uppercase tracking-tight">Chronological Records</h3>
                            <span className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                {watchHistory.length} Entries
                            </span>
                        </div>

                        {watchHistory.length === 0 ? (
                            <div className="text-center py-32 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No historical data detected.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {watchHistory.map((item: any) => (
                                    <div key={item.id} className="group relative bg-white rounded-[2rem] border border-gray-200 overflow-hidden transition-all hover:scale-[1.02] shadow-sm hover:shadow-md">
                                        <div className="aspect-video bg-gray-100">
                                            {item.video.thumbnailUrl && (
                                                <img src={item.video.thumbnailUrl} alt={item.video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h4 className="text-black font-black truncate mb-2 group-hover:text-primary transition-colors">{item.video.title}</h4>
                                            <div className="flex justify-between text-[10px] text-gray-600 font-black uppercase tracking-wider">
                                                <span>{formatWatchTime(item.totalWatchTimeSeconds)}</span>
                                                <span>{formatDate(item.lastWatchedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Analytics */}
                {activeTab === 'analytics' && (
                    <div className="flex items-center justify-center py-10">
                        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-200 shadow-xl text-center max-w-lg w-full">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <HistoryIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Total Consumption Metric</h3>
                            <p className="text-7xl font-black text-black mb-6 tracking-tighter">{formatWatchTime(totalWatchTime)}</p>
                            <p className="text-gray-700 font-bold leading-relaxed">Aggregate duration of all content consumed across our high-fidelity streaming relay.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Cropping Modal */}
            {showCropper && previewUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
                    <div className="glass w-full max-w-2xl rounded-[3rem] border border-white/10 overflow-hidden">
                        <div className="p-8 flex justify-between items-center border-b border-white/5">
                            <h3 className="text-xl font-black text-white">Adjust Composition</h3>
                            <button onClick={() => setShowCropper(false)} className="text-gray-400 hover:text-white transition-colors">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative h-96 bg-gray-900">
                            <Cropper
                                image={previewUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-black text-gray-500 uppercase tracking-widest">
                                    <span>Optical Zoom</span>
                                    <span className="text-white">{Math.round(zoom * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleUploadProfile}
                                    disabled={isUploading}
                                    className="flex-1 py-5 bg-purple-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-purple-500 transition shadow-xl shadow-purple-900/40 disabled:opacity-50"
                                >
                                    {isUploading ? 'Synchronizing...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCropper(false)
                                        setProfileFile(null)
                                    }}
                                    className="px-10 py-5 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition border border-white/5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
