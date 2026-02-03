'use client'

import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchInputProps {
    onSearch: (query: string) => void
    value?: string
    placeholder?: string
    className?: string
    delay?: number
}

export default function SearchInput({
    onSearch,
    value,
    placeholder = 'Search videos...',
    className = '',
    delay = 500
}: SearchInputProps) {
    const [query, setQuery] = useState(value || '')
    const [isFocused, setIsFocused] = useState(false)
    const isInitialMount = useRef(true)

    useEffect(() => {
        if (value !== undefined) {
            setQuery(value)
        }
    }, [value])

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
        <div className={`relative w-full ${className}`}>
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 border ${isFocused
                    ? 'border-primary bg-white dark:bg-[#1E293B] shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)]'
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B]/50'
                    }`}
            >
                <MagnifyingGlassIcon className={`w-5 h-5 transition-colors ${isFocused ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'
                    }`} />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium"
                />

                <AnimatePresence>
                    {query && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={handleClear}
                            className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

        </div>
    )
}
