'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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
import { signOut, useSession } from 'next-auth/react'

const navigation = [
    { name: 'Home', href: '/home', icon: HomeIcon, iconActive: HomeIconSolid },
    { name: 'Premium', href: '/premium', icon: SparklesIcon, iconActive: SparklesIconSolid },
    { name: 'Free Videos', href: '/free', icon: GiftIcon, iconActive: GiftIconSolid },
    { name: 'Watch Later', href: '/watch-later', icon: ClockIcon, iconActive: ClockIconSolid },
    { name: 'Playlists', href: '/playlists', icon: QueueListIcon, iconActive: QueueListIconSolid },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { data: session } = useSession()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isPlaylistContext = searchParams.get('playlistId')
    const user = session?.user as any
    const isAdmin = user?.role === 'ADMIN'

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 lg:top-16 w-64 h-full lg:h-[calc(100vh-4rem)] bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-white/10 overflow-y-auto z-40 lg:z-20 transition-all duration-300 transform shadow-lg ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Mobile Header */}
                    <div className="flex lg:hidden items-center justify-between mb-8 px-2">
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Kushal Stream</span>
                        <button onClick={onClose} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-smooth">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">Sections</h2>
                            <nav className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = item.href === '/home'
                                        ? (pathname === '/home' || pathname === '/') && !isPlaylistContext
                                        : item.href === '/playlists'
                                            ? pathname.startsWith('/playlists') || isPlaylistContext
                                            : pathname.startsWith(item.href)
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group relative border-2 ${isActive
                                                ? 'border-primary text-black dark:text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] font-bold'
                                                : 'border-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-smooth ${isActive ? 'text-black dark:text-white' : 'group-hover:text-primary'}`} />
                                            <span className="font-medium text-inherit">{item.name}</span>
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black dark:bg-white rounded-r-full" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {isAdmin && (
                            <div>
                                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">Admin</h2>
                                <nav className="space-y-1">
                                    <Link
                                        href="/admin"
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group relative border-2 ${pathname.startsWith('/admin')
                                            ? 'border-primary text-black dark:text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] font-bold'
                                            : 'border-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary'
                                            }`}
                                    >
                                        <VideoCameraIcon className={`w-5 h-5 transition-smooth ${pathname.startsWith('/admin') ? 'text-black dark:text-white' : 'group-hover:text-primary'}`} />
                                        <span className="font-medium">Admin Dashboard</span>
                                        {pathname.startsWith('/admin') && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black dark:bg-white rounded-r-full" />
                                        )}
                                    </Link>
                                </nav>
                            </div>
                        )}
                    </div>

                    {/* User Section at Bottom */}
                    <div className="mt-auto pt-6 border-t border-gray-200 space-y-4">
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border-2 border-primary/30">
                                {user?.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || 'User'}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg uppercase bg-gray-100">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <Link
                                href="/profile"
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group border-2 ${pathname === '/profile' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary'}`}
                            >
                                <UserIcon className={`w-5 h-5 transition-smooth ${pathname === '/profile' ? 'text-primary' : 'group-hover:text-primary'}`} />
                                <span className="font-medium">Profile Settings</span>
                            </Link>

                            {/* Upgrade to Premium - Only show for free users */}
                            {!isAdmin && user?.subscriptionStatus !== 'ACTIVE' && (
                                <Link
                                    href="/pricing"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all group bg-black hover:bg-gray-800 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.4)]"
                                >
                                    <SparklesIcon className="w-5 h-5 text-white flex-shrink-0" />
                                    <span className="font-bold text-white uppercase tracking-wider text-xs">Upgrade to Premium</span>
                                </Link>
                            )}

                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group text-gray-700 dark:text-gray-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-white/5"
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
