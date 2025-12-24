'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface VideoProtectionProps {
    children: React.ReactNode
    videoId: string
}

export default function VideoProtection({ children, videoId }: VideoProtectionProps) {
    const { data: session } = useSession()
    const [showWarning, setShowWarning] = useState(false)
    const user = session?.user as any

    useEffect(() => {
        // Disable right click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            return false
        }

        // Disable keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'u') ||
                (e.ctrlKey && e.key === 's') // Save
            ) {
                e.preventDefault()
                setShowWarning(true)
                setTimeout(() => setShowWarning(false), 2000)
                return false
            }
        }

        // Add event listeners to the document
        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <div className="relative group select-none">
            {/* Main Content */}
            <div onContextMenu={(e) => e.preventDefault()}>
                {children}
            </div>

            {/* Transparent Overlay to block direct interaction (optional, careful with controls) */}
            {/* We don't block clicks because we need controls to work, 
                but we block right click via the wrapper above */}

            {/* Watermark */}
            {user?.email && (
                <div className="absolute top-4 right-4 pointer-events-none z-50 opacity-30 select-none">
                    <div className="text-white text-xs font-mono bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
                        {user.email}
                        <br />
                        ID: {user.id?.slice(0, 8)}
                    </div>
                </div>
            )}

            {/* Floating Watermark (moves around to prevent cropping) */}
            {user?.email && (
                <div
                    className="absolute pointer-events-none z-50 opacity-10 select-none text-white text-[10px] font-mono whitespace-nowrap"
                    style={{
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`,
                        transform: 'rotate(-15deg)'
                    }}
                >
                    {user.email}
                </div>
            )}

            {/* Warning Toast */}
            {showWarning && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-red-600/90 text-white px-6 py-3 rounded-lg backdrop-blur-md font-bold animate-pulse">
                        ⚠️ Screen Recording / Downloading is Prohibited
                    </div>
                </div>
            )}
        </div>
    )
}
