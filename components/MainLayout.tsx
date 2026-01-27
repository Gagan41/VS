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
            <div className="min-h-screen">
                {children}
                <Toaster position="top-right" />
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'blur-sm lg:blur-none' : ''} lg:pl-64 pt-16`}>
                <main>{children}</main>
            </div>
            <Toaster position="top-right" />
        </div>
    )
}
