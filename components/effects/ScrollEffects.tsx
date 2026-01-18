'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'

// Parallax wrapper component
interface ParallaxProps {
    children: ReactNode
    offset?: number
    className?: string
}

export function Parallax({ children, offset = 50, className = '' }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    })

    const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])
    const smoothY = useSpring(y, { damping: 20, stiffness: 100 })

    return (
        <div ref={ref} className={`relative ${className}`}>
            <motion.div style={{ y: smoothY }}>
                {children}
            </motion.div>
        </div>
    )
}

// Parallax with multiple depth layers
interface ParallaxLayersProps {
    layers: {
        content: ReactNode
        speed: number // -1 to 1, where negative is slower, positive is faster
        className?: string
    }[]
    className?: string
}

export function ParallaxLayers({ layers, className = '' }: ParallaxLayersProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    })

    return (
        <div ref={ref} className={`relative ${className}`}>
            {layers.map((layer, i) => {
                const y = useTransform(
                    scrollYProgress,
                    [0, 1],
                    [100 * layer.speed, -100 * layer.speed]
                )
                const smoothY = useSpring(y, { damping: 30, stiffness: 100 })

                return (
                    <motion.div
                        key={i}
                        style={{ y: smoothY }}
                        className={`absolute inset-0 ${layer.className || ''}`}
                    >
                        {layer.content}
                    </motion.div>
                )
            })}
        </div>
    )
}

// Scrollytelling section
interface ScrollytellingSectionProps {
    children: ReactNode
    className?: string
    onProgress?: (progress: number) => void
}

export function ScrollytellingSection({
    children,
    className = '',
    onProgress
}: ScrollytellingSectionProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end end']
    })

    useEffect(() => {
        if (onProgress) {
            const unsubscribe = scrollYProgress.on('change', onProgress)
            return () => unsubscribe()
        }
    }, [scrollYProgress, onProgress])

    return (
        <div ref={ref} className={`relative ${className}`}>
            {children}
        </div>
    )
}

// Pinned horizontal scroll section
interface HorizontalScrollProps {
    children: ReactNode
    className?: string
    panelCount?: number
}

export function HorizontalScroll({
    children,
    className = '',
    panelCount = 3
}: HorizontalScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    })

    const x = useTransform(
        scrollYProgress,
        [0, 1],
        ['0%', `-${(panelCount - 1) * 100}%`]
    )
    const smoothX = useSpring(x, { damping: 30, stiffness: 100 })

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            style={{ height: `${panelCount * 100}vh` }}
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                <motion.div
                    className="flex h-full"
                    style={{ x: smoothX }}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    )
}

// Single panel for horizontal scroll
export function HorizontalPanel({
    children,
    className = ''
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div className={`flex-shrink-0 w-screen h-full ${className}`}>
            {children}
        </div>
    )
}

// Fade in on scroll
interface FadeInOnScrollProps {
    children: ReactNode
    className?: string
    direction?: 'up' | 'down' | 'left' | 'right'
    delay?: number
}

export function FadeInOnScroll({
    children,
    className = '',
    direction = 'up',
    delay = 0
}: FadeInOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'center center']
    })

    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1])

    const directionOffset = {
        up: { y: 50, x: 0 },
        down: { y: -50, x: 0 },
        left: { y: 0, x: 50 },
        right: { y: 0, x: -50 },
    }

    const { x: startX, y: startY } = directionOffset[direction]

    const x = useTransform(scrollYProgress, [0, 1], [startX, 0])
    const y = useTransform(scrollYProgress, [0, 1], [startY, 0])

    return (
        <div ref={ref} className={className}>
            <motion.div
                style={{ opacity, x, y }}
                transition={{ delay }}
            >
                {children}
            </motion.div>
        </div>
    )
}

// Scale on scroll
interface ScaleOnScrollProps {
    children: ReactNode
    className?: string
    scaleRange?: [number, number]
}

export function ScaleOnScroll({
    children,
    className = '',
    scaleRange = [0.8, 1]
}: ScaleOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'center center']
    })

    const scale = useTransform(scrollYProgress, [0, 1], scaleRange)
    const smoothScale = useSpring(scale, { damping: 30, stiffness: 100 })

    return (
        <div ref={ref} className={className}>
            <motion.div style={{ scale: smoothScale }}>
                {children}
            </motion.div>
        </div>
    )
}

// Reveal text on scroll
interface RevealTextProps {
    text: string
    className?: string
}

export function RevealText({ text, className = '' }: RevealTextProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end center']
    })

    const words = text.split(' ')

    return (
        <div ref={ref} className={`flex flex-wrap gap-x-2 gap-y-1 ${className}`}>
            {words.map((word, i) => {
                const start = i / words.length
                const end = start + 1 / words.length
                const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1])
                const y = useTransform(scrollYProgress, [start, end], [20, 0])

                return (
                    <motion.span
                        key={i}
                        style={{ opacity, y }}
                        className="inline-block"
                    >
                        {word}
                    </motion.span>
                )
            })}
        </div>
    )
}
