'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { useTheme } from './ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname()
    const { theme, toggleTheme } = useTheme()

    // Don't show navbar on login/register
    if (pathname.startsWith('/auth')) return null

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-white/10 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        {/* Mobile Toggle */}
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-smooth hover:scale-105 focus-primary"
                            aria-label="Toggle menu"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link href="/home" className="flex items-center space-x-2 group">
                            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase group-hover:text-primary transition-all">
                                Kushal Stream
                            </span>
                        </Link>
                    </div>

                    {/* Right Side: Theme Switch */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="relative flex items-center gap-2 p-1 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-all hover:scale-105 active:scale-95 group"
                            aria-label="Toggle theme"
                        >
                            <div className="relative w-14 h-7 flex items-center px-1">
                                {/* Moving knob */}
                                <motion.div
                                    animate={{ x: theme === 'dark' ? 28 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="z-10 w-5 h-5 rounded-full bg-white dark:bg-black shadow-md flex items-center justify-center border border-gray-200 dark:border-zinc-600"
                                >
                                    {theme === 'dark' ? (
                                        <Moon className="w-3 h-3 text-blue-400 fill-blue-400" />
                                    ) : (
                                        <Sun className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    )}
                                </motion.div>

                                {/* Background Icons */}
                                <div className="absolute inset-0 flex items-center justify-between px-2 text-gray-400 dark:text-gray-500">
                                    <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`} />
                                    <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
