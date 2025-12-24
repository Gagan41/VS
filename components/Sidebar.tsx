'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    HomeIcon,
    QueueListIcon,
    SparklesIcon,
    GiftIcon,
    ClockIcon,
    VideoCameraIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import {
    HomeIcon as HomeIconSolid,
    QueueListIcon as QueueListIconSolid,
    SparklesIcon as SparklesIconSolid,
    GiftIcon as GiftIconSolid,
    ClockIcon as ClockIconSolid,
    VideoCameraIcon as VideoCameraIconSolid
} from '@heroicons/react/24/solid'
import { signOut } from 'next-auth/react'

const navigation = [
    { name: 'Home', href: '/home', icon: HomeIcon, iconActive: HomeIconSolid },
    { name: 'Premium', href: '/premium', icon: SparklesIcon, iconActive: SparklesIconSolid },
    { name: 'Free Videos', href: '/free', icon: GiftIcon, iconActive: GiftIconSolid },
    { name: 'Watch Later', href: '/watch-later', icon: ClockIcon, iconActive: ClockIconSolid },
    { name: 'Playlists', href: '/playlists', icon: QueueListIcon, iconActive: QueueListIconSolid },
]

export default function Sidebar({ session, isOpen, onClose }: { session: any, isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname()
    const user = session?.user as any
    const isAdmin = user?.role === 'ADMIN'

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed left-0 top-0 lg:top-16 w-64 h-full lg:h-[calc(100vh-4rem)] bg-gray-900 border-r border-white/5 overflow-y-auto z-40 lg:z-20 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full p-4">
                    {/* Mobile Header */}
                    <div className="flex lg:hidden items-center justify-between mb-8 px-2">
                        <span className="text-xl font-bold gradient-text">Kushal Stream</span>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-4">Sections</h2>
                            <nav className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition group ${isActive
                                                ? 'bg-purple-600/10 text-purple-400'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'group-hover:text-white'}`} />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {isAdmin && (
                            <div>
                                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-4">Admin</h2>
                                <nav className="space-y-1">
                                    <Link
                                        href="/admin"
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition group ${pathname.startsWith('/admin')
                                            ? 'bg-purple-600/10 text-purple-400'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <VideoCameraIcon className="w-5 h-5 group-hover:text-white" />
                                        <span className="font-medium">Admin Dashboard</span>
                                    </Link>
                                </nav>
                            </div>
                        )}
                    </div>

                    {/* User Section at Bottom */}
                    <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-white/10">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg uppercase">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <Link
                                href="/profile"
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition group ${pathname === '/profile' ? 'bg-purple-600/10 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <UserIcon className="w-5 h-5 group-hover:text-white" />
                                <span className="font-medium">Profile Settings</span>
                            </Link>

                            {/* Upgrade to Premium - Only show for free users */}
                            {!isAdmin && user?.subscriptionStatus !== 'ACTIVE' && (
                                <Link
                                    href="/pricing"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition group bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:from-purple-600/30 hover:to-blue-600/30"
                                >
                                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                                    <span className="font-bold text-purple-300">Upgrade to Premium</span>
                                </Link>
                            )}

                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition group text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </aside>
        </>
    )
}
