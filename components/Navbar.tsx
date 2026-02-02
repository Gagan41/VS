'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname()

    // Don't show navbar on login/register
    if (pathname.startsWith('/auth')) return null

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-width-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        {/* Mobile Toggle */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-primary hover:bg-primary/10 transition-smooth hover:scale-105 focus-primary"
                            aria-label="Toggle menu"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link href="/home" className="flex items-center space-x-2 group">
                            <span className="text-2xl font-black text-black tracking-tight uppercase group-hover:text-primary transition-all">
                                Kushal Stream
                            </span>
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    )
}
