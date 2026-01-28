'use client'

import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchInputProps {
    onSearch: (query: string) => void
    placeholder?: string
    className?: string
    delay?: number
}

export default function SearchInput({
    onSearch,
    placeholder = 'Search videos...',
    className = '',
    delay = 500
}: SearchInputProps) {
    const [query, setQuery] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const isInitialMount = useRef(true)

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        const timer = setTimeout(() => {
            onSearch(query)
        }, delay)

        return () => clearTimeout(timer)
    }, [query, onSearch, delay])

    const handleClear = () => {
        setQuery('')
        onSearch('')
    }

    return (
        <div className={`relative w-full max-w-xl ${className}`}>
            <motion.div
                animate={{
                    scale: isFocused ? 1.02 : 1,
                    boxShadow: isFocused
                        ? '0 0 20px rgba(110, 140, 251, 0.3)'
                        : '0 0 0px rgba(0,0,0,0)'
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface/30 border transition-colors duration-300 ${isFocused ? 'border-primary/60 bg-surface/50' : 'border-primary/10'
                    }`}
            >
                <MagnifyingGlassIcon className={`w-5 h-5 transition-colors ${isFocused ? 'text-primary' : 'text-gray-500'
                    }`} />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium"
                />

                <AnimatePresence>
                    {query && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={handleClear}
                            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Subtle glow effect behind */}
            <div className={`absolute -inset-0.5 gradient-primary rounded-2xl blur opacity-0 transition-opacity duration-300 pointer-events-none ${isFocused ? 'opacity-25' : ''
                }`} />
        </div>
    )
}
