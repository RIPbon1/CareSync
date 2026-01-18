'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSphere({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!meshRef.current) return

        // Subtle rotation based on time
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.1

        // React to mouse position
        meshRef.current.position.x = THREE.MathUtils.lerp(
            meshRef.current.position.x,
            mouse.current.x * 0.5,
            0.05
        )
        meshRef.current.position.y = THREE.MathUtils.lerp(
            meshRef.current.position.y,
            mouse.current.y * 0.3,
            0.05
        )
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1, 64, 64]} scale={2}>
                <MeshDistortMaterial
                    color="#667eea"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
        </Float>
    )
}

function FloatingRing({ position, color, mouse }: {
    position: [number, number, number]
    color: string
    mouse: React.MutableRefObject<{ x: number; y: number }>
}) {
    const ringRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!ringRef.current) return

        ringRef.current.rotation.x = state.clock.elapsedTime * 0.2 + mouse.current.y * 0.3
        ringRef.current.rotation.y = state.clock.elapsedTime * 0.3 + mouse.current.x * 0.3
    })

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
            <mesh ref={ringRef} position={position}>
                <torusGeometry args={[0.8, 0.1, 16, 100]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.9}
                    roughness={0.1}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </Float>
    )
}

function Particles({ count = 50, mouse }: {
    count?: number
    mouse: React.MutableRefObject<{ x: number; y: number }>
}) {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const position = [
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
            ]
            const scale = Math.random() * 0.1 + 0.02
            temp.push({ position, scale })
        }
        return temp
    }, [count])

    useFrame((state) => {
        if (!meshRef.current) return

        const time = state.clock.elapsedTime

        particles.forEach((particle, i) => {
            const matrix = new THREE.Matrix4()
            const position = new THREE.Vector3(
                particle.position[0] + Math.sin(time + i) * 0.2 + mouse.current.x * 0.5,
                particle.position[1] + Math.cos(time + i) * 0.2 + mouse.current.y * 0.3,
                particle.position[2]
            )
            matrix.setPosition(position)
            matrix.scale(new THREE.Vector3(particle.scale, particle.scale, particle.scale))
            meshRef.current!.setMatrixAt(i, matrix)
        })

        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
                color="#a78bfa"
                emissive="#a78bfa"
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
            />
        </instancedMesh>
    )
}

interface Hero3DProps {
    className?: string
}

export default function Hero3D({ className = '' }: Hero3DProps) {
    const mouse = useRef({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouse.current = {
            x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
        }
    }

    return (
        <div
            className={`absolute inset-0 ${className}`}
            onMouseMove={handleMouseMove}
        >
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                style={{ background: 'transparent' }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} color="#f953c6" intensity={0.5} />
                <pointLight position={[10, -10, 5]} color="#667eea" intensity={0.5} />

                <AnimatedSphere mouse={mouse} />

                <FloatingRing position={[-2.5, 1, -1]} color="#764ba2" mouse={mouse} />
                <FloatingRing position={[2.5, -1, -2]} color="#f953c6" mouse={mouse} />
                <FloatingRing position={[0, 2, -1.5]} color="#4facfe" mouse={mouse} />

                <Particles mouse={mouse} />

                <Environment preset="night" />
            </Canvas>
        </div>
    )
}
