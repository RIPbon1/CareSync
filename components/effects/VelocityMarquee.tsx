'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

interface VelocityMarqueeProps {
    children: React.ReactNode
    className?: string
    baseVelocity?: number
    direction?: 'left' | 'right'
}

export default function VelocityMarquee({
    children,
    className = '',
    baseVelocity = 2,
    direction = 'left'
}: VelocityMarqueeProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [velocity, setVelocity] = useState(baseVelocity)
    const { scrollY } = useScroll()

    // Track scroll velocity
    useEffect(() => {
        let lastScrollY = 0
        let lastTime = Date.now()

        const unsubscribe = scrollY.on('change', (current) => {
            const now = Date.now()
            const timeDelta = now - lastTime

            if (timeDelta > 0) {
                const scrollDelta = current - lastScrollY
                const scrollVelocity = Math.abs(scrollDelta) / timeDelta * 100

                // Adjust marquee speed based on scroll velocity
                const newVelocity = baseVelocity + scrollVelocity * 0.5
                setVelocity(Math.min(newVelocity, baseVelocity * 5))

                // Change direction based on scroll direction
                if (scrollDelta > 0) {
                    setVelocity(prev => direction === 'left' ? Math.abs(prev) : -Math.abs(prev))
                } else if (scrollDelta < 0) {
                    setVelocity(prev => direction === 'left' ? -Math.abs(prev) : Math.abs(prev))
                }
            }

            lastScrollY = current
            lastTime = now
        })

        return () => unsubscribe()
    }, [scrollY, baseVelocity, direction])

    // Decay velocity back to base
    useEffect(() => {
        const decay = setInterval(() => {
            setVelocity(prev => {
                const target = direction === 'left' ? baseVelocity : -baseVelocity
                return prev + (target - prev) * 0.1
            })
        }, 50)

        return () => clearInterval(decay)
    }, [baseVelocity, direction])

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden whitespace-nowrap ${className}`}
        >
            <motion.div
                className="inline-flex"
                animate={{ x: velocity > 0 ? '-50%' : '0%' }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: 30 / Math.abs(velocity),
                        ease: 'linear',
                    }
                }}
            >
                <div className="flex items-center gap-12 px-6">
                    {children}
                </div>
                <div className="flex items-center gap-12 px-6">
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

// Text Marquee variant
interface TextMarqueeProps {
    texts: string[]
    className?: string
    separator?: React.ReactNode
}

export function TextMarquee({
    texts,
    className = '',
    separator = '•'
}: TextMarqueeProps) {
    return (
        <VelocityMarquee className={className}>
            {texts.map((text, i) => (
                <span key={i} className="flex items-center gap-12">
                    <span className="text-lg md:text-xl font-medium text-muted-foreground">
                        {text}
                    </span>
                    <span className="text-primary opacity-50">{separator}</span>
                </span>
            ))}
        </VelocityMarquee>
    )
}

// Logo Marquee variant
interface LogoMarqueeProps {
    logos: { src: string; alt: string }[]
    className?: string
}

export function LogoMarquee({ logos, className = '' }: LogoMarqueeProps) {
    return (
        <VelocityMarquee className={className} baseVelocity={1}>
            {logos.map((logo, i) => (
                <img
                    key={i}
                    src={logo.src}
                    alt={logo.alt}
                    className="h-8 md:h-10 w-auto opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                />
            ))}
        </VelocityMarquee>
    )
}
