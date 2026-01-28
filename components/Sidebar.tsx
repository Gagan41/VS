'use client'

import Image from 'next/image'
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
    const user = session?.user as any
    const isAdmin = user?.role === 'ADMIN'

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 lg:top-16 w-64 h-full lg:h-[calc(100vh-4rem)] border-r border-primary/10 overflow-y-auto z-40 lg:z-20 transition-transform duration-300 transform shadow-deep ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ background: 'rgba(60, 70, 123, 0.98)', backdropFilter: 'blur(20px)' }}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Mobile Header */}
                    <div className="flex lg:hidden items-center justify-between mb-8 px-2">
                        <span className="text-xl font-bold gradient-text-primary">Kushal Stream</span>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-smooth">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <h2 className="text-xs font-semibold text-secondary-400 uppercase tracking-wider px-3 mb-3">Sections</h2>
                            <nav className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group relative border-2 ${isActive
                                                ? 'border-primary/70 bg-primary/20 text-white backdrop-blur-xl shadow-[0_0_20px_rgba(110,140,251,0.35)]'
                                                : 'border-transparent text-gray-400 hover:bg-primary/10 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-smooth ${isActive ? 'text-white' : 'group-hover:text-primary'}`} />
                                            <span className="font-medium">{item.name}</span>
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {isAdmin && (
                            <div>
                                <h2 className="text-xs font-semibold text-secondary-400 uppercase tracking-wider px-3 mb-3">Admin</h2>
                                <nav className="space-y-1">
                                    <Link
                                        href="/admin"
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group relative border-2 ${pathname.startsWith('/admin')
                                            ? 'border-primary/70 bg-primary/20 text-white backdrop-blur-xl shadow-[0_0_20px_rgba(110,140,251,0.35)]'
                                            : 'border-transparent text-gray-400 hover:bg-primary/10 hover:text-white'
                                            }`}
                                    >
                                        <VideoCameraIcon className={`w-5 h-5 transition-smooth ${pathname.startsWith('/admin') ? 'text-white' : 'group-hover:text-primary'}`} />
                                        <span className="font-medium">Admin Dashboard</span>
                                        {pathname.startsWith('/admin') && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                        )}
                                    </Link>
                                </nav>
                            </div>
                        )}
                    </div>

                    {/* User Section at Bottom */}
                    <div className="mt-auto pt-6 border-t border-primary/10 space-y-4">
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface border-2 border-primary/30">
                                {user?.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || 'User'}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg uppercase bg-gradient-surface">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <Link
                                href="/profile"
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group border-2 ${pathname === '/profile' ? 'border-primary/70 bg-primary/20 text-white backdrop-blur-xl shadow-[0_0_20px_rgba(110,140,251,0.35)]' : 'border-transparent text-gray-400 hover:bg-primary/10 hover:text-white'}`}
                            >
                                <UserIcon className={`w-5 h-5 transition-smooth ${pathname === '/profile' ? 'text-white' : 'group-hover:text-primary'}`} />
                                <span className="font-medium">Profile Settings</span>
                            </Link>

                            {/* Upgrade to Premium - Only show for free users */}
                            {!isAdmin && user?.subscriptionStatus !== 'ACTIVE' && (
                                <Link
                                    href="/pricing"
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group gradient-primary hover:shadow-glow-primary animate-glow"
                                >
                                    <SparklesIcon className="w-5 h-5 text-white flex-shrink-0" />
                                    <span className="font-bold text-white">Upgrade to Premium</span>
                                </Link>
                            )}

                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group text-gray-400 hover:bg-red-500/10 hover:text-red-400"
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
