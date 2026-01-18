'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BentoCardProps {
    children: ReactNode
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'tall' | 'wide'
    delay?: number
    gradient?: boolean
    glow?: boolean
}

export default function BentoCard({
    children,
    className = '',
    size = 'md',
    delay = 0,
    gradient = false,
    glow = false
}: BentoCardProps) {
    const sizeClasses = {
        sm: '',
        md: '',
        lg: 'md:col-span-2',
        tall: 'md:row-span-2',
        wide: 'md:col-span-2',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }}
            whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 }
            }}
            className={`
        relative overflow-hidden
        glass-card rounded-3xl
        p-8 md:p-10
        ${sizeClasses[size]}
        ${glow ? 'shadow-glow' : ''}
        ${className}
      `}
            data-cursor="hover"
        >
            {/* Gradient Border */}
            {gradient && (
                <div className="absolute inset-0 rounded-3xl p-[1px] pointer-events-none">
                    <div
                        className="absolute inset-0 rounded-3xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.3) 50%, rgba(249,83,198,0.2) 100%)',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                            padding: '1px',
                        }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Hover Gradient Overlay */}
            <motion.div
                className="absolute inset-0 opacity-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(102,126,234,0.15) 0%, transparent 50%)',
                }}
                whileHover={{ opacity: 1 }}
            />
        </motion.div>
    )
}

// Bento Grid Container
export function BentoGrid({
    children,
    className = ''
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div className={`
      grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
      gap-6 md:gap-8
      ${className}
    `}>
            {children}
        </div>
    )
}

// Feature Card with Icon
interface FeatureCardProps {
    icon: ReactNode
    title: string
    description: string
    gradient?: string
    delay?: number
}

export function FeatureCard({
    icon,
    title,
    description,
    gradient = 'from-indigo-500 to-purple-500',
    delay = 0
}: FeatureCardProps) {
    return (
        <BentoCard delay={delay} gradient>
            <div className={`
        w-16 h-16 rounded-2xl 
        bg-gradient-to-br ${gradient}
        flex items-center justify-center
        mb-6 shadow-lg
      `}>
                <div className="text-white">{icon}</div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-3">
                {title}
            </h3>

            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </BentoCard>
    )
}

// Stat Card
interface StatCardProps {
    value: string | number
    label: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    delay?: number
}

export function StatCard({
    value,
    label,
    trend = 'neutral',
    trendValue,
    delay = 0
}: StatCardProps) {
    const trendColors = {
        up: 'text-emerald-500',
        down: 'text-red-500',
        neutral: 'text-muted-foreground',
    }

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    }

    return (
        <BentoCard delay={delay} className="text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-gradient mb-2"
            >
                {value}
            </motion.div>

            <p className="text-muted-foreground mb-2">{label}</p>

            {trendValue && (
                <span className={`text-sm font-medium ${trendColors[trend]}`}>
                    {trendIcons[trend]} {trendValue}
                </span>
            )}
        </BentoCard>
    )
}
