'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('theme') as Theme
        if (savedTheme) {
            setTheme(savedTheme)
        }
    }, [])

    useEffect(() => {
        if (!mounted) return
        const root = window.document.documentElement

        // Force sync with state
        if (theme === 'dark') {
            root.classList.add('dark')
            root.classList.remove('light')
        } else {
            root.classList.add('light')
            root.classList.remove('dark')
        }

        localStorage.setItem('theme', theme)
        console.log('DOM Updated - Theme:', theme, 'Classes:', root.className)
    }, [theme, mounted])

    const toggleTheme = () => {
        console.log('Toggling theme from:', theme)
        setTheme(prev => {
            const next = prev === 'light' ? 'dark' : 'light'
            console.log('Next theme will be:', next)
            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)

    // For Server Components or early hydration, return a safe default
    if (!context) {
        return { theme: 'light' as Theme, toggleTheme: () => { } }
    }

    return context
}
