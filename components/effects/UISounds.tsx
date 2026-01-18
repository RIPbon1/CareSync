'use client'

import { useCallback, useRef, useState, useEffect } from 'react'

// UI Sound effects manager
const sounds = {
    click: '/sounds/click.mp3',
    hover: '/sounds/hover.mp3',
    success: '/sounds/success.mp3',
    notification: '/sounds/notification.mp3',
    toggle: '/sounds/toggle.mp3',
}

export function useUISounds() {
    const [isMuted, setIsMuted] = useState(true) // Muted by default
    const audioContext = useRef<AudioContext | null>(null)
    const gainNode = useRef<GainNode | null>(null)

    useEffect(() => {
        // Initialize audio context on first user interaction
        const initAudio = () => {
            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
                gainNode.current = audioContext.current.createGain()
                gainNode.current.connect(audioContext.current.destination)
                gainNode.current.gain.value = isMuted ? 0 : 0.3
            }
            window.removeEventListener('click', initAudio)
        }

        window.addEventListener('click', initAudio)
        return () => window.removeEventListener('click', initAudio)
    }, [isMuted])

    // Generate synthetic sounds using Web Audio API
    const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
        if (isMuted || !audioContext.current || !gainNode.current) return

        // Check for reduced motion preference (extend to audio)
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) return

        const oscillator = audioContext.current.createOscillator()
        const envelope = audioContext.current.createGain()

        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, audioContext.current.currentTime)

        envelope.gain.setValueAtTime(0, audioContext.current.currentTime)
        envelope.gain.linearRampToValueAtTime(0.3, audioContext.current.currentTime + 0.01)
        envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration)

        oscillator.connect(envelope)
        envelope.connect(gainNode.current)

        oscillator.start(audioContext.current.currentTime)
        oscillator.stop(audioContext.current.currentTime + duration)
    }, [isMuted])

    const playClick = useCallback(() => {
        playTone(800, 0.1, 'sine')
    }, [playTone])

    const playHover = useCallback(() => {
        playTone(600, 0.05, 'sine')
    }, [playTone])

    const playSuccess = useCallback(() => {
        if (isMuted || !audioContext.current) return

        // Play a pleasant success chord
        setTimeout(() => playTone(523.25, 0.15, 'sine'), 0) // C5
        setTimeout(() => playTone(659.25, 0.15, 'sine'), 80) // E5
        setTimeout(() => playTone(783.99, 0.2, 'sine'), 160) // G5
    }, [isMuted, playTone])

    const playNotification = useCallback(() => {
        if (isMuted || !audioContext.current) return

        playTone(880, 0.1, 'sine')
        setTimeout(() => playTone(1108.73, 0.15, 'sine'), 100)
    }, [isMuted, playTone])

    const playToggle = useCallback(() => {
        playTone(440, 0.08, 'triangle')
    }, [playTone])

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev)
        if (gainNode.current) {
            gainNode.current.gain.value = isMuted ? 0.3 : 0
        }
    }, [isMuted])

    return {
        playClick,
        playHover,
        playSuccess,
        playNotification,
        playToggle,
        toggleMute,
        isMuted,
    }
}

// Sound toggle button component
export function SoundToggle() {
    const { toggleMute, isMuted, playToggle } = useUISounds()

    const handleToggle = () => {
        toggleMute()
        if (isMuted) {
            playToggle()
        }
    }

    return (
        <button
            onClick={handleToggle}
            className="p-3 rounded-xl glass-card transition-colors hover:bg-white/10"
            data-cursor="hover"
            aria-label={isMuted ? 'Enable UI sounds' : 'Disable UI sounds'}
        >
            {isMuted ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
            )}
        </button>
    )
}

export default function UISounds() {
    // This is just a placeholder - use the hook in your components
    return null
}
