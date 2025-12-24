'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname()

    // Don't show navbar on login/register
    if (pathname.startsWith('/auth')) return null

    return (
        <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        {/* Mobile Toggle */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 text-gray-400 hover:text-white transition"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link href="/home" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold gradient-text">Kushal Stream</span>
                        </Link>
                    </div>

                    {/* Right side - Empty or minimal */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Premium Experience</span>
                    </div>
                </div>
            </div>
        </nav>
    )
}
