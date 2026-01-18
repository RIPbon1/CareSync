'use client'

import { useRouter } from 'next/navigation'

export default function TestPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">CareSync Test Page</h1>
        <p className="text-lg text-gray-600 mb-8">If you can see this, the app is working!</p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="block w-full bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to Landing Page
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="block w-full bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}