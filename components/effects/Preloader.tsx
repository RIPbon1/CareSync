'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PreloaderProps {
    onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [loadingText, setLoadingText] = useState('Initializing neural pathways...')

    const loadingTexts = [
        'Initializing neural pathways...',
        'Syncing care protocols...',
        'Loading family connections...',
        'Preparing your sanctuary...',
        'Almost ready...'
    ]

    useEffect(() => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReducedMotion) {
            setIsLoading(false)
            onComplete?.()
            return
        }

        // Simulate loading progress
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval)
                    return 100
                }
                return prev + Math.random() * 15 + 5
            })
        }, 200)

        // Change loading text
        let textIndex = 0
        const textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % loadingTexts.length
            setLoadingText(loadingTexts[textIndex])
        }, 600)

        // Complete loading
        const timer = setTimeout(() => {
            clearInterval(progressInterval)
            clearInterval(textInterval)
            setLoadingProgress(100)

            setTimeout(() => {
                setIsLoading(false)
                onComplete?.()
            }, 500)
        }, 2500)

        return () => {
            clearTimeout(timer)
            clearInterval(progressInterval)
            clearInterval(textInterval)
        }
    }, [onComplete])

    return (
        <AnimatePresence>
            {isLoading && (
                <>
                    {/* Main Preloader */}
                    <motion.div
                        className="preloader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="preloader-content">
                            {/* Animated Logo */}
                            <div className="preloader-logo">
                                <div className="preloader-ring" />
                                <div className="preloader-ring" />
                                <div className="preloader-ring" />

                                {/* Center Icon */}
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }}
                                >
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="url(#logo-gradient)"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <defs>
                                            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#667eea" />
                                                <stop offset="50%" stopColor="#764ba2" />
                                                <stop offset="100%" stopColor="#f953c6" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M12 2a8 8 0 0 0-8 8c0 4 3 7 4 8s1 3 4 3 3-2 4-3 4-4 4-8a8 8 0 0 0-8-8z" />
                                        <path d="M12 8v4" />
                                        <path d="M12 16h.01" />
                                    </svg>
                                </motion.div>
                            </div>

                            {/* Brand Name */}
                            <motion.h1
                                className="text-3xl font-bold text-white mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Care<span className="text-gradient">Sync</span>
                            </motion.h1>

                            {/* Loading Text */}
                            <motion.p
                                key={loadingText}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                className="text-white/70 text-sm mb-6"
                            >
                                {loadingText}
                            </motion.p>

                            {/* Progress Bar */}
                            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        background: 'linear-gradient(90deg, #667eea, #764ba2, #f953c6)',
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Curtain Wipe Transition */}
                    <motion.div
                        className="preloader-wipe"
                        initial={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.76, 0, 0.24, 1],
                            delay: 0.1
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    )
}
