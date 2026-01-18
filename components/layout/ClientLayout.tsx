'use client'

import { useState, useEffect } from 'react'
import LiquidCursor from '@/components/effects/LiquidCursor'
import NoiseOverlay from '@/components/effects/NoiseOverlay'
import Preloader from '@/components/effects/Preloader'

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Check for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mediaQuery.matches)

        // If reduced motion, skip preloader
        if (mediaQuery.matches) {
            setIsLoaded(true)
        }

        // Initialize dark mode from localStorage or system preference
        const storedTheme = localStorage.getItem('theme')
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="opacity-0">
                {children}
            </div>
        )
    }

    return (
        <>
            {/* Preloader */}
            {!prefersReducedMotion && (
                <Preloader onComplete={() => setIsLoaded(true)} />
            )}

            {/* Noise Texture Overlay */}
            <NoiseOverlay />

            {/* Custom Liquid Cursor */}
            {!prefersReducedMotion && <LiquidCursor />}

            {/* Main Content */}
            <main className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                {children}
            </main>
        </>
    )
}
