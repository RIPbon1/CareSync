'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface NavItem {
    label: string
    href: string
    preview?: string // Optional preview image/video URL
}

interface KineticNavProps {
    items: NavItem[]
    className?: string
}

export default function KineticNav({ items, className = '' }: KineticNavProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
    const navRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

    // Update magic line position
    useEffect(() => {
        const activeElement = itemRefs.current[hoveredIndex ?? activeIndex]
        if (activeElement && navRef.current) {
            const navRect = navRef.current.getBoundingClientRect()
            const itemRect = activeElement.getBoundingClientRect()

            setIndicatorStyle({
                left: itemRect.left - navRect.left,
                width: itemRect.width,
            })
        }
    }, [activeIndex, hoveredIndex])

    return (
        <nav
            ref={navRef}
            className={`relative ${className}`}
        >
            {/* Nav Items with Staggered Entrance */}
            <div className="flex items-center gap-2">
                {items.map((item, index) => (
                    <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: index * 0.1,
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="relative"
                    >
                        <Link
                            href={item.href}
                            ref={(el) => { itemRefs.current[index] = el }}
                            onClick={() => setActiveIndex(index)}
                            className={`
                relative px-5 py-3 rounded-xl
                font-medium text-sm
                transition-colors duration-300
                ${activeIndex === index
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }
              `}
                            data-cursor="hover"
                        >
                            {item.label}
                        </Link>

                        {/* Hover Preview */}
                        <AnimatePresence>
                            {hoveredIndex === index && item.preview && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50"
                                >
                                    <div className="w-48 h-32 rounded-xl overflow-hidden shadow-2xl glass-card">
                                        <img
                                            src={item.preview}
                                            alt={item.label}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* Magic Line Indicator */}
            <motion.div
                className="absolute bottom-0 h-[3px] rounded-full"
                style={{
                    background: 'linear-gradient(90deg, #667eea, #764ba2, #f953c6)',
                }}
                animate={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                }}
            />
        </nav>
    )
}

// Mobile Navigation with Curtain Drop Effect
interface MobileNavProps {
    items: NavItem[]
    isOpen: boolean
    onClose: () => void
}

export function MobileNav({ items, isOpen, onClose }: MobileNavProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Curtain Drop Navigation */}
                    <motion.nav
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200
                        }}
                        className="fixed inset-x-0 top-0 z-50 glass-nav p-8"
                    >
                        <div className="flex flex-col gap-6">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className="text-3xl font-semibold text-foreground hover:text-gradient transition-colors"
                                        data-cursor="hover"
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Close Button */}
                        <motion.button
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={onClose}
                            className="absolute top-6 right-6 p-3 rounded-xl glass-card"
                            data-cursor="hover"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </motion.nav>
                </>
            )}
        </AnimatePresence>
    )
}

// Hamburger Menu Button with Animation
interface HamburgerProps {
    isOpen: boolean
    onClick: () => void
    className?: string
}

export function HamburgerButton({ isOpen, onClick, className = '' }: HamburgerProps) {
    return (
        <motion.button
            onClick={onClick}
            className={`p-3 rounded-xl glass-card ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-cursor="hover"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
            <div className="w-6 h-5 relative flex flex-col justify-between">
                <motion.span
                    className="w-full h-0.5 bg-foreground rounded-full origin-left"
                    animate={{
                        rotate: isOpen ? 45 : 0,
                        y: isOpen ? 0 : 0,
                    }}
                />
                <motion.span
                    className="w-full h-0.5 bg-foreground rounded-full"
                    animate={{
                        opacity: isOpen ? 0 : 1,
                        x: isOpen ? 20 : 0,
                    }}
                />
                <motion.span
                    className="w-full h-0.5 bg-foreground rounded-full origin-left"
                    animate={{
                        rotate: isOpen ? -45 : 0,
                        y: isOpen ? 0 : 0,
                    }}
                />
            </div>
        </motion.button>
    )
}
