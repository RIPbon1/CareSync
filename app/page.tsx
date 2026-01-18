'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
// Supabase import removed
import { Brain, Heart, Users, Sparkles, ArrowRight, Shield, Zap, Clock } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { MagneticButtonPrimary } from '@/components/ui/MagneticButton'
import BentoCard, { BentoGrid, FeatureCard } from '@/components/ui/BentoCard'
import { TextMarquee } from '@/components/effects/VelocityMarquee'
import { FadeInOnScroll, ScaleOnScroll, RevealText, Parallax } from '@/components/effects/ScrollEffects'
import { SoundToggle, useUISounds } from '@/components/effects/UISounds'
import KineticNav, { MobileNav, HamburgerButton } from '@/components/layout/KineticNav'

// Dynamically import Hero3D for performance
const Hero3D = dynamic(() => import('@/components/effects/Hero3D'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />
})

const navItems = [
  { label: 'Features', href: '#features', preview: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500' },
  { label: 'Working', href: '#how-it-works', preview: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=500' },
  { label: 'Stats', href: '#stats', preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=500' },
  { label: 'Vision', href: '#vision', preview: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=500' },
]

export default function Home() {
  const router = useRouter()
  // const supabase = createClient()
  const { playSuccess } = useUISounds()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Supabase Auth removed 
  useEffect(() => {
    // No auth check needed for local mode
  }, [router])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleStartJourney = () => {
    playSuccess()
    router.push('/dashboard')
  }

  const marqueeTexts = [
    'AI-Powered Care Analysis',
    'Real-time Family Coordination',
    'Secure Medical Document Processing',
    'Smart Task Assignment',
    'Voice Authentication',
    'Instant Care Insights',
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Mobile Navigation */}
      <MobileNav
        items={navItems}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Fixed Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 glass-nav transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4 z-50 relative"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold hidden md:block">
              Care<span className="text-gradient">Sync</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <KineticNav items={navItems} />
          </div>

          <div className="flex items-center gap-3 z-50 relative">
            <div className="hidden md:flex items-center gap-3">
              <SoundToggle />
              <ThemeToggle />
            </div>

            <div className="md:hidden">
              <HamburgerButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-8 pt-24 overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-60">
          <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />}>
            <Hero3D />
          </Suspense>
        </div>

        {/* Floating Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.8) 0%, transparent 70%)',
              x: mousePosition.x * 30,
              y: mousePosition.y * 30,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.8) 0%, transparent 70%)',
              x: mousePosition.x * -20,
              y: mousePosition.y * -20,
            }}
            animate={{ scale: [1, 0.9, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card mb-10 backdrop-blur-3xl bg-white/5 border border-white/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-foreground/80">
              Now with Voice Authentication & AI Analysis
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-bold mb-8 leading-tight tracking-tight text-center"
          >
            <span className="block text-foreground">Sentient Care</span>
            <span className="block text-gradient pb-2">Coordination</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light text-center"
          >
            Transform medical documents into actionable family care tasks with
            <span className="text-foreground font-medium"> AI-powered analysis</span> and
            <span className="text-foreground font-medium"> real-time collaboration</span>.
          </motion.p>

          {/* CTA Button - Centered and Single */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex items-center justify-center"
          >
            <MagneticButtonPrimary onClick={handleStartJourney}>
              <span className="flex items-center gap-3 text-lg px-2">
                Start Your Care Journey
                <ArrowRight className="w-5 h-5" />
              </span>
            </MagneticButtonPrimary>
          </motion.div>

          {/* Small text below */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            ✨ AI-powered healthcare for your family
          </motion.p>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Velocity Marquee */}
      <section id="how-it-works" className="py-12 border-y border-border/50 bg-background/50 backdrop-blur-sm">
        <TextMarquee texts={marqueeTexts} />
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-24">
              <motion.p className="text-primary font-medium mb-4 tracking-widest uppercase text-sm">
                Advanced Features
              </motion.p>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6">
                Everything you need for
                <span className="block text-gradient">family care coordination</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Powered by advanced AI to transform how families manage healthcare together.
              </p>
            </div>
          </FadeInOnScroll>

          <BentoGrid>
            {/* The Brain Upload - Large Card */}
            <BentoCard size="wide" delay={0.1} gradient glow>
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl skew-y-3">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
                    The Brain Upload
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Drop any medical document — discharge papers, prescriptions, lab results — and watch our AI extract actionable care tasks automatically. No more manual data entry.
                  </p>
                </div>
              </div>
            </BentoCard>

            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Family Hub"
              description="Real-time dashboard where family members collaborate on care tasks seamlessly."
              gradient="from-purple-500 to-pink-500"
              delay={0.2}
            />

            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Sentient Chat"
              description="Ask questions about medical documents and get intelligent, contextual answers."
              gradient="from-emerald-500 to-teal-500"
              delay={0.3}
            />

            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Voice Authentication"
              description="Secure access with biometric voice verification."
              gradient="from-amber-500 to-orange-500"
              delay={0.4}
            />

            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Smart Scheduling"
              description="AI-optimized task scheduling that considers family availability and urgency."
              gradient="from-blue-500 to-cyan-500"
              delay={0.5}
            />

            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Instant Insights"
              description="Real-time analytics and insights about care progress and adherence."
              gradient="from-rose-500 to-pink-500"
              delay={0.6}
            />
          </BentoGrid>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />

        <div className="max-w-7xl mx-auto relative">
          <ScaleOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
              {[
                { value: '99%', label: 'Accuracy Rate' },
                { value: '<3s', label: 'Analysis Time' },
                { value: '10K+', label: 'Families Served' },
                { value: '24/7', label: 'AI Availability' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-gradient mb-3">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScaleOnScroll>
        </div>
      </section>

      <section id="vision" className="py-32 px-6 md:px-8 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <RevealText
            text="Healthcare coordination shouldn't be overwhelming. CareSync brings intelligence, clarity, and peace of mind to families navigating complex medical journeys together."
            className="text-2xl md:text-4xl lg:text-5xl font-medium leading-tight text-foreground justify-center"
          />
        </div>
      </section>

      <section className="py-32 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

        <Parallax offset={50}>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8">
                Ready to transform your
                <span className="block text-gradient">family's care coordination?</span>
              </h2>

              <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Join thousands of families who have simplified their healthcare journey with CareSync.
              </p>

              <div className="flex justify-center">
                <MagneticButtonPrimary onClick={handleStartJourney}>
                  <span className="flex items-center gap-3 text-lg px-2">
                    Get Started — It's Free
                    <ArrowRight className="w-6 h-6" />
                  </span>
                </MagneticButtonPrimary>
              </div>
            </motion.div>
          </div>
        </Parallax>
      </section>

      <footer className="py-12 px-6 md:px-8 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">CareSync</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Built for families, powered by AI</span>
            </div>

            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CareSync. All rights reserved.
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}