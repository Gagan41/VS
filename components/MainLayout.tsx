'use client'

import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'
import { usePathname } from 'next/navigation'

export default function MainLayout({ children, session }: { children: React.ReactNode, session: any }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Don't show navigation on auth pages or landing page
    const isGuestPage = pathname.startsWith('/auth') || pathname === '/login' || pathname === '/register' || pathname === '/'

    if (isGuestPage) {
        return (
            <div className="min-h-screen bg-white">
                {children}
                <Toaster position="top-right" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar with blue shadow */}
            <div className="shadow-[0_2px_8px_rgba(37,99,235,0.15)]">
                <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            {/* Sidebar with blue shadow */}
            <div className="shadow-[2px_0_8px_rgba(37,99,235,0.15)]">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            {/* Main content area with white background */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''} lg:pl-64 min-h-screen bg-white pt-6`}>
                <main className="bg-white">{children}</main>
            </div>
            <Toaster position="top-right" />
        </div>
    )
}
