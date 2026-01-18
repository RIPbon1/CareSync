'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Palette } from 'lucide-react'

interface ThemeToggleProps {
    className?: string
}

type Theme = 'light' | 'dark'
type AccentColor = 'indigo' | 'purple' | 'pink' | 'blue' | 'emerald' | 'amber'

const accentColors: Record<AccentColor, { primary: string; gradient: string }> = {
    indigo: {
        primary: '245 82% 67%',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f953c6 100%)'
    },
    purple: {
        primary: '271 81% 56%',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #c026d3 100%)'
    },
    pink: {
        primary: '330 81% 60%',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 50%, #f472b6 100%)'
    },
    blue: {
        primary: '213 94% 68%',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 50%, #0891b2 100%)'
    },
    emerald: {
        primary: '160 84% 39%',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #14b8a6 100%)'
    },
    amber: {
        primary: '45 93% 47%',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #fbbf24 100%)'
    },
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const [theme, setTheme] = useState<Theme>('dark')
    const [accentColor, setAccentColor] = useState<AccentColor>('indigo')
    const [showPalette, setShowPalette] = useState(false)
    const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 })
    const [isTransitioning, setIsTransitioning] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Initialize theme from system preference or localStorage
    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null
        const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches

        const initialTheme = stored || (systemPrefers ? 'dark' : 'light')
        setTheme(initialTheme)
        document.documentElement.classList.toggle('dark', initialTheme === 'dark')

        // Load accent color
        const storedAccent = localStorage.getItem('accentColor') as AccentColor | null
        if (storedAccent && accentColors[storedAccent]) {
            setAccentColor(storedAccent)
            applyAccentColor(storedAccent)
        }
    }, [])

    const applyAccentColor = (color: AccentColor) => {
        const root = document.documentElement
        root.style.setProperty('--primary', accentColors[color].primary)
        root.style.setProperty('--gradient-primary', accentColors[color].gradient)
    }

    const toggleTheme = useCallback(() => {
        if (!buttonRef.current || isTransitioning) return

        const rect = buttonRef.current.getBoundingClientRect()
        setBubblePosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        })

        setIsTransitioning(true)

        // Small delay for bubble animation
        setTimeout(() => {
            const newTheme = theme === 'dark' ? 'light' : 'dark'
            setTheme(newTheme)
            localStorage.setItem('theme', newTheme)
            document.documentElement.classList.toggle('dark', newTheme === 'dark')

            setTimeout(() => {
                setIsTransitioning(false)
            }, 600)
        }, 200)
    }, [theme, isTransitioning])

    const handleAccentChange = (color: AccentColor) => {
        setAccentColor(color)
        localStorage.setItem('accentColor', color)
        applyAccentColor(color)
        setShowPalette(false)
    }

    return (
        <div className={`relative flex items-center gap-2 ${className}`}>
            {/* Theme Toggle Button */}
            <motion.button
                ref={buttonRef}
                onClick={toggleTheme}
                className="relative p-3 rounded-xl glass-card overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-cursor="hover"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                        <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Moon className="w-5 h-5 text-indigo-400" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Sun className="w-5 h-5 text-amber-500" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Accent Color Picker */}
            <motion.button
                onClick={() => setShowPalette(!showPalette)}
                className="p-3 rounded-xl glass-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-cursor="hover"
                aria-label="Change accent color"
            >
                <Palette className="w-5 h-5" style={{ color: `hsl(${accentColors[accentColor].primary})` }} />
            </motion.button>

            {/* Accent Color Palette Dropdown */}
            <AnimatePresence>
                {showPalette && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute top-full mt-2 right-0 p-3 rounded-2xl glass-card shadow-xl z-50"
                    >
                        <div className="flex gap-2">
                            {(Object.keys(accentColors) as AccentColor[]).map((color) => (
                                <motion.button
                                    key={color}
                                    onClick={() => handleAccentChange(color)}
                                    className={`
                    w-8 h-8 rounded-full relative
                    ${accentColor === color ? 'ring-2 ring-offset-2 ring-offset-background' : ''}
                  `}
                                    style={{
                                        background: accentColors[color].gradient,
                                        ringColor: `hsl(${accentColors[color].primary})`
                                    }}
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.9 }}
                                    data-cursor="hover"
                                    aria-label={`Set ${color} accent color`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Circular Theme Transition Bubble */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        className="theme-transition-overlay"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >
                        <motion.div
                            className="theme-bubble"
                            style={{
                                left: bubblePosition.x,
                                top: bubblePosition.y,
                                width: Math.max(window.innerWidth, window.innerHeight) * 2,
                                height: Math.max(window.innerWidth, window.innerHeight) * 2,
                                marginLeft: -Math.max(window.innerWidth, window.innerHeight),
                                marginTop: -Math.max(window.innerWidth, window.innerHeight),
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 2 }}
                            transition={{
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Font Size Controls
export function FontSizeControls({ className = '' }: { className?: string }) {
    const [fontSize, setFontSize] = useState(100)

    useEffect(() => {
        const stored = localStorage.getItem('fontSize')
        if (stored) {
            setFontSize(parseInt(stored))
            document.documentElement.style.fontSize = `${parseInt(stored)}%`
        }
    }, [])

    const changeFontSize = (delta: number) => {
        const newSize = Math.max(80, Math.min(120, fontSize + delta))
        setFontSize(newSize)
        localStorage.setItem('fontSize', String(newSize))
        document.documentElement.style.fontSize = `${newSize}%`
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <motion.button
                onClick={() => changeFontSize(-10)}
                className="p-2 rounded-lg glass-card text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-cursor="hover"
                aria-label="Decrease font size"
            >
                A-
            </motion.button>
            <span className="text-xs text-muted-foreground w-12 text-center">{fontSize}%</span>
            <motion.button
                onClick={() => changeFontSize(10)}
                className="p-2 rounded-lg glass-card text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-cursor="hover"
                aria-label="Increase font size"
            >
                A+
            </motion.button>
        </div>
    )
}
