'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

interface PostLoginIntroProps {
    userName: string
    onEnter: () => void
}

export default function PostLoginIntro({ userName, onEnter }: PostLoginIntroProps) {
    const [isExiting, setIsExiting] = useState(false)

    const containerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: { duration: 1, ease: [0, 0, 0.2, 1] as any }
        },
        exit: {
            y: -100,
            opacity: 0,
            transition: { duration: 0.8, ease: [0.645, 0.045, 0.355, 1] as any }
        }
    }

    const itemVariants = {
        initial: { opacity: 0, y: 30 },
        animate: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.5 + (i * 0.4),
                duration: 0.8,
                ease: [0, 0, 0.2, 1] as any
            }
        })
    }

    const handleEnter = () => {
        setIsExiting(true)
        setTimeout(onEnter, 800)
    }

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden"
                >
                    {/* Background Soft Blue Gradient Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05)_0%,rgba(255,255,255,1)_70%)]" />

                    {/* Animated Glow Waves */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"
                        />
                    </div>

                    <div className="relative z-10 max-w-4xl w-full px-6 text-center">
                        <div className="space-y-8">
                            <WelcomeHeadline userName={userName} />
                            <ProjectIntroLines />
                            <EnterButton onClick={handleEnter} />
                        </div>
                    </div>

                    {/* Branding Scale In */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.05, scale: 1 }}
                        transition={{ delay: 2, duration: 2 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    >
                        <span className="text-8xl font-black text-black tracking-tighter uppercase whitespace-nowrap">
                            Kushal Stream
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function WelcomeHeadline({ userName }: { userName: string }) {
    return (
        <div className="space-y-2">
            <motion.h1
                custom={0}
                variants={{
                    initial: { opacity: 0, y: 30 },
                    animate: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.8 } }
                }}
                initial="initial"
                animate="animate"
                className="text-4xl md:text-6xl lg:text-7xl font-black text-black tracking-tight"
            >
                Welcome, <span className="text-primary">{userName}</span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="text-gray-500 font-bold uppercase tracking-[0.3em] text-sm"
            >
                You're signed in.
            </motion.p>
        </div>
    )
}

function ProjectIntroLines() {
    const lines = [
        "Your exclusive destination for premium storytelling.",
        "Crafted for high-fidelity streaming and modern creators.",
        "Unleash your creativity with our professional dashboard."
    ]

    return (
        <div className="space-y-3 py-8">
            {lines.map((line, i) => (
                <motion.p
                    key={i}
                    custom={i + 1}
                    variants={{
                        initial: { opacity: 0, y: 20 },
                        animate: { opacity: 1, y: 0, transition: { delay: 1.5 + (i * 0.3), duration: 0.6 } }
                    }}
                    initial="initial"
                    animate="animate"
                    className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed"
                >
                    {line}
                </motion.p>
            ))}
        </div>
    )
}

function EnterButton({ onClick }: { onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
            className="pt-4"
        >
            <button
                onClick={onClick}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-black rounded-2xl hover:bg-gray-900 transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] active:scale-95 overflow-hidden"
            >
                <span className="relative z-10 uppercase tracking-widest text-sm">Enter Dashboard</span>
                <ArrowRightIcon className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />

                {/* Button Shine Effect */}
                <motion.div
                    animate={{
                        left: ['-100%', '200%']
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        repeatDelay: 1
                    }}
                    className="absolute top-0 bottom-0 w-20 bg-white/10 skew-x-12"
                />
            </button>
        </motion.div>
    )
}
