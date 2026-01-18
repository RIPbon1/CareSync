'use client'

import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    strength?: number
    disabled?: boolean
}

export default function MagneticButton({
    children,
    className = '',
    onClick,
    strength = 0.3,
    disabled = false
}: MagneticButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current || disabled) return

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) return

        const button = buttonRef.current
        const rect = button.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const deltaX = (e.clientX - centerX) * strength
        const deltaY = (e.clientY - centerY) * strength

        button.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    }, [strength, disabled])

    const handleMouseLeave = useCallback(() => {
        if (!buttonRef.current) return
        buttonRef.current.style.transform = 'translate(0, 0)'
    }, [])

    return (
        <motion.button
            ref={buttonRef}
            className={`magnetic-button ${className}`}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            whileTap={{ scale: 0.95 }}
            data-cursor="hover"
            style={{
                transition: 'transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
        >
            <span className="relative z-10">{children}</span>

            {/* Gradient background */}
            <motion.div
                className="absolute inset-0 rounded-[inherit] opacity-0"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f953c6 100%)',
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    )
}

// Primary variant
export function MagneticButtonPrimary({
    children,
    className = '',
    ...props
}: MagneticButtonProps) {
    return (
        <MagneticButton
            className={`
        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
        text-white font-semibold
        px-8 py-4
        rounded-2xl
        shadow-lg shadow-indigo-500/25
        hover:shadow-xl hover:shadow-indigo-500/40
        transition-shadow duration-300
        ${className}
      `}
            {...props}
        >
            {children}
        </MagneticButton>
    )
}

// Glass variant
export function MagneticButtonGlass({
    children,
    className = '',
    ...props
}: MagneticButtonProps) {
    return (
        <MagneticButton
            className={`
        glass-card
        text-gray-800 dark:text-white font-medium
        px-6 py-3
        rounded-xl
        hover:bg-white/90 dark:hover:bg-white/10
        transition-colors duration-300
        ${className}
      `}
            {...props}
        >
            {children}
        </MagneticButton>
    )
}
