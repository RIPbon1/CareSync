'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Brain, Heart, Users, Sparkles } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router])

  const handleSignIn = async () => {
    console.log('Button clicked - navigating to dashboard')
    // Always go to dashboard in demo mode for now
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-48 h-48 bg-purple-300/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -40, 0],
            y: [0, 25, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-200/8 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -40, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            className="w-24 h-24 bg-primary rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-7xl font-bold text-gray-900 mb-6"
          >
            Care<span className="text-primary">Sync</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 mb-4 font-light"
          >
            Sentient Care Coordination Platform
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Transform medical documents into actionable family care tasks with AI-powered analysis and real-time collaboration.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={handleSignIn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-12 py-4 rounded-2xl text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300"
          >
            Start Your Care Journey
          </motion.button>

          {/* Demo Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-4 text-sm text-gray-500"
          >
            ✨ Click to explore the demo - no signup required!
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto"
        >
          {/* Feature 1 */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">The Brain Upload</h3>
            <p className="text-gray-600 leading-relaxed">
              Drop medical documents and watch AI extract actionable care tasks automatically.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 text-center"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Family Hub</h3>
            <p className="text-gray-600 leading-relaxed">
              Real-time dashboard where family members collaborate on care tasks seamlessly.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sentient Chat</h3>
            <p className="text-gray-600 leading-relaxed">
              Ask questions about medical documents and get intelligent, contextual answers.
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-24 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm">Built for families, powered by AI</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}