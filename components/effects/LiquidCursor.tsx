'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

interface CursorState {
    isHovering: boolean
    isClicking: boolean
    cursorText: string
    cursorIcon: 'default' | 'play' | 'link' | 'drag' | 'zoom'
}

export default function LiquidCursor() {
    const [cursorState, setCursorState] = useState<CursorState>({
        isHovering: false,
        isClicking: false,
        cursorText: '',
        cursorIcon: 'default'
    })
    const [isVisible, setIsVisible] = useState(false)
    const [shockwaves, setShockwaves] = useState<{ id: number; x: number; y: number }[]>([])

    // Smooth cursor position with different spring configs
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    // Main cursor with tight spring
    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 }
    const cursorXSpring = useSpring(cursorX, springConfig)
    const cursorYSpring = useSpring(cursorY, springConfig)

    // Follower with laggy/fluid spring
    const followerConfig = { damping: 20, stiffness: 150, mass: 1 }
    const followerXSpring = useSpring(cursorX, followerConfig)
    const followerYSpring = useSpring(cursorY, followerConfig)

    useEffect(() => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) return

        const handleMouseMove = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
            setIsVisible(true)
        }

        const handleMouseLeave = () => {
            setIsVisible(false)
        }

        const handleMouseEnter = () => {
            setIsVisible(true)
        }

        const handleClick = (e: MouseEvent) => {
            // Add shockwave effect
            const id = Date.now()
            setShockwaves(prev => [...prev, { id, x: e.clientX, y: e.clientY }])

            // Remove shockwave after animation
            setTimeout(() => {
                setShockwaves(prev => prev.filter(s => s.id !== id))
            }, 600)

            setCursorState(prev => ({ ...prev, isClicking: true }))
            setTimeout(() => {
                setCursorState(prev => ({ ...prev, isClicking: false }))
            }, 150)
        }

        // Detect hoverable elements
        const handleElementHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement

            // Check for interactive elements
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.dataset.cursor === 'hover' ||
                target.closest('[data-cursor="hover"]')

            const isPlay =
                target.dataset.cursor === 'play' ||
                target.closest('[data-cursor="play"]')

            const isDrag =
                target.dataset.cursor === 'drag' ||
                target.closest('[data-cursor="drag"]')

            const cursorText = target.dataset.cursorText ||
                target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text') || ''

            if (isPlay) {
                setCursorState({ isHovering: true, isClicking: false, cursorText: '', cursorIcon: 'play' })
            } else if (isDrag) {
                setCursorState({ isHovering: true, isClicking: false, cursorText: 'Drag', cursorIcon: 'drag' })
            } else if (isInteractive) {
                setCursorState({ isHovering: true, isClicking: false, cursorText, cursorIcon: 'link' })
            } else {
                setCursorState({ isHovering: false, isClicking: false, cursorText: '', cursorIcon: 'default' })
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mousemove', handleElementHover)
        window.addEventListener('mousedown', handleClick)
        document.addEventListener('mouseleave', handleMouseLeave)
        document.addEventListener('mouseenter', handleMouseEnter)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mousemove', handleElementHover)
            window.removeEventListener('mousedown', handleClick)
            document.removeEventListener('mouseleave', handleMouseLeave)
            document.removeEventListener('mouseenter', handleMouseEnter)
        }
    }, [cursorX, cursorY])

    // Don't render on touch devices or if reduced motion is preferred
    if (typeof window !== 'undefined') {
        const isTouchDevice = 'ontouchstart' in window
        if (isTouchDevice) return null
    }

    return (
        <>
            {/* Main Cursor Dot */}
            <motion.div
                className="cursor-main"
                style={{
                    left: cursorXSpring,
                    top: cursorYSpring,
                    opacity: isVisible ? 1 : 0,
                }}
                animate={{
                    width: cursorState.isHovering ? 60 : cursorState.isClicking ? 8 : 12,
                    height: cursorState.isHovering ? 60 : cursorState.isClicking ? 8 : 12,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                {/* Cursor Text/Icon when hovering */}
                <AnimatePresence>
                    {cursorState.isHovering && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center text-black text-xs font-medium"
                        >
                            {cursorState.cursorIcon === 'play' && (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="play-icon-offset">
                                    <path d="M4 3.5v9l7-4.5-7-4.5z" />
                                </svg>
                            )}
                            {cursorState.cursorIcon === 'drag' && (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 0L6 2h1.5v5H2L4 5.5h-2L8 0zM8 16l2-2H8.5v-5H14l-2 1.5h2L8 16zM0 8l2-2v1.5h5V2L5.5 4V2L0 8zM16 8l-2 2v-1.5h-5v5.5l1.5-2v2L16 8z" />
                                </svg>
                            )}
                            {cursorState.cursorText && (
                                <span className="whitespace-nowrap">{cursorState.cursorText}</span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Follower Circle (Laggy) */}
            <motion.div
                className="cursor-follower"
                style={{
                    left: followerXSpring,
                    top: followerYSpring,
                    opacity: isVisible ? 1 : 0,
                }}
                animate={{
                    width: cursorState.isHovering ? 80 : cursorState.isClicking ? 35 : 40,
                    height: cursorState.isHovering ? 80 : cursorState.isClicking ? 35 : 40,
                    borderColor: cursorState.isHovering
                        ? 'rgba(255, 255, 255, 0.9)'
                        : 'rgba(255, 255, 255, 0.4)',
                }}
                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
            />

            {/* Click Shockwaves */}
            <AnimatePresence>
                {shockwaves.map(({ id, x, y }) => (
                    <motion.div
                        key={id}
                        className="shockwave"
                        initial={{
                            left: x,
                            top: y,
                            width: 20,
                            height: 20,
                            x: '-50%',
                            y: '-50%',
                            opacity: 0.6,
                            scale: 0
                        }}
                        animate={{
                            scale: 4,
                            opacity: 0
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ mixBlendMode: 'difference' }}
                    />
                ))}
            </AnimatePresence>
        </>
    )
}
