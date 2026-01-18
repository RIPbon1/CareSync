'use client'

import { useCallback, useEffect, useRef } from 'react'

// Lightweight confetti implementation without canvas-confetti for SSR compatibility
export function useMicroConfetti() {
    const createConfetti = useCallback((options?: {
        x?: number
        y?: number
        particleCount?: number
        spread?: number
        colors?: string[]
    }) => {
        // Check for reduced motion preference
        if (typeof window !== 'undefined') {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            if (prefersReducedMotion) return
        }

        const {
            x = window.innerWidth / 2,
            y = window.innerHeight / 2,
            particleCount = 30,
            spread = 60,
            colors = ['#667eea', '#764ba2', '#f953c6', '#4facfe', '#00f2fe', '#fee140']
        } = options || {}

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            createParticle(x, y, spread, colors)
        }
    }, [])

    return createConfetti
}

function createParticle(x: number, y: number, spread: number, colors: string[]) {
    const particle = document.createElement('div')
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Random shape
    const shapes = ['circle', 'square', 'star']
    const shape = shapes[Math.floor(Math.random() * shapes.length)]

    const size = Math.random() * 8 + 4
    const angle = Math.random() * spread - spread / 2
    const velocity = Math.random() * 6 + 4
    const rotation = Math.random() * 360

    // Calculate direction
    const radians = (angle - 90) * (Math.PI / 180)
    const vx = Math.cos(radians) * velocity
    const vy = Math.sin(radians) * velocity

    particle.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    pointer-events: none;
    z-index: 100000;
    transform: rotate(${rotation}deg);
    ${shape === 'circle' ? 'border-radius: 50%;' : ''}
    ${shape === 'star' ? `
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    ` : ''}
  `

    document.body.appendChild(particle)

    let posX = x
    let posY = y
    let velocityX = vx * (Math.random() > 0.5 ? 1 : -1)
    let velocityY = vy
    let rot = rotation
    let opacity = 1
    let gravity = 0.1
    let friction = 0.99
    let rotationSpeed = (Math.random() - 0.5) * 10

    function animate() {
        velocityY += gravity
        velocityX *= friction
        velocityY *= friction

        posX += velocityX
        posY += velocityY
        rot += rotationSpeed
        opacity -= 0.02

        particle.style.left = `${posX}px`
        particle.style.top = `${posY}px`
        particle.style.transform = `rotate(${rot}deg)`
        particle.style.opacity = String(opacity)

        if (opacity > 0) {
            requestAnimationFrame(animate)
        } else {
            particle.remove()
        }
    }

    requestAnimationFrame(animate)
}

// Task completion celebration effect
export function celebrateTaskCompletion(element?: HTMLElement) {
    const rect = element?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2

    // Create confetti burst
    const colors = ['#10b981', '#34d399', '#6ee7b7', '#667eea', '#f953c6']

    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            createParticle(x, y, 120, colors)
        }, i * 20)
    }
}

export default function MicroConfetti() {
    // This component doesn't render anything - it's just a container for the hook
    return null
}
