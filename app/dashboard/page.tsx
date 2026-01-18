'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { cn, formatRelativeTime, getPriorityColor, generateAvatarUrl } from '@/lib/utils'
import { Upload, Brain, Users, MessageCircle, Plus, Calendar, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function Dashboard() {
  const supabase = createClient()
  const {
    currentFamily,
    tasks,
    members,
    setTasks,
    setMembers,
    updateTask,
    isUploading,
    setUploading,
    isChatOpen,
    setChatOpen,
  } = useAppStore()

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    console.log('Dashboard loading...')
    
    // Always set demo user
    setUser({
      id: 'demo-user',
      email: 'demo@caresync.com',
      user_metadata: { name: 'Demo User' }
    })

    // Always set demo family
    useAppStore.getState().setCurrentFamily('demo-family')
    
    // Add demo members
    const demoMembers = [
      {
        id: 'member-1',
        family_id: 'demo-family',
        user_id: 'demo-user',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar_url: null,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'member-2',
        family_id: 'demo-family',
        user_id: 'demo-user-2',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatar_url: null,
        role: 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'member-3',
        family_id: 'demo-family',
        user_id: 'demo-user-3',
        name: 'Emma Johnson',
        email: 'emma@example.com',
        avatar_url: null,
        role: 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    setMembers(demoMembers)
    
    // Add demo tasks
    const demoTasks = [
      {
        id: 'task-1',
        family_id: 'demo-family',
        document_id: 'demo-doc-1',
        title: 'Schedule follow-up appointment',
        description: 'Call Dr. Smith\'s office to schedule a follow-up appointment within 2 weeks',
        priority: 'high',
        status: 'pending',
        assigned_to: null,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'task-2',
        family_id: 'demo-family',
        document_id: 'demo-doc-1',
        title: 'Pick up prescription',
        description: 'Collect new medication from pharmacy - bring insurance card',
        priority: 'urgent',
        status: 'assigned',
        assigned_to: 'member-2',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'task-3',
        family_id: 'demo-family',
        document_id: 'demo-doc-1',
        title: 'Monitor blood pressure daily',
        description: 'Take blood pressure readings twice daily and log results',
        priority: 'medium',
        status: 'in_progress',
        assigned_to: 'member-1',
        due_date: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'task-4',
        family_id: 'demo-family',
        document_id: 'demo-doc-1',
        title: 'Prepare discharge summary',
        description: 'Organize all medical documents and create summary for family',
        priority: 'low',
        status: 'completed',
        assigned_to: 'member-3',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    setTasks(demoTasks)
    console.log('Demo data loaded successfully')
  }, [])

  // Removed complex useEffect - using simple demo mode only

  const onDrop = async (acceptedFiles: File[]) => {
    if (!currentFamily || acceptedFiles.length === 0) return

    setUploading(true)
    const file = acceptedFiles[0]

    try {
      // In demo mode, simulate the upload process
      if (currentFamily === 'demo-family') {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Add demo tasks
        const newDemoTasks = [
          {
            id: `task-${Date.now()}`,
            family_id: currentFamily,
            document_id: `doc-${Date.now()}`,
            title: 'Review medication schedule',
            description: `Based on ${file.name}, ensure medication is taken as prescribed`,
            priority: 'high',
            status: 'pending',
            assigned_to: null,
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `task-${Date.now() + 1}`,
            family_id: currentFamily,
            document_id: `doc-${Date.now()}`,
            title: 'Contact healthcare provider',
            description: 'Follow up on treatment plan from uploaded document',
            priority: 'medium',
            status: 'pending',
            assigned_to: null,
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        
        // Add tasks to store
        newDemoTasks.forEach(task => {
          useAppStore.getState().addTask(task)
        })
        
        console.log('Demo document processed successfully')
        return
      }

      // Real API call for production
      const formData = new FormData()
      formData.append('file', file)
      formData.append('familyId', currentFamily)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Document analyzed successfully:', result)
      } else {
        console.error('Analysis failed:', result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  const handleTaskAssignment = async (taskId: string, memberId: string | null) => {
    if (currentFamily === 'demo-family') {
      // Demo mode - update task in store
      updateTask(taskId, {
        assigned_to: memberId,
        status: memberId ? 'assigned' : 'pending'
      })
      return
    }

    // Real database update for production
    await supabase
      .from('tasks')
      .update({ 
        assigned_to: memberId,
        status: memberId ? 'assigned' : 'pending'
      })
      .eq('id', taskId)
  }

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const assignedTasks = tasks.filter(task => task.status === 'assigned' || task.status === 'in_progress')
  const completedTasks = tasks.filter(task => task.status === 'completed')

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-32 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-indigo-200/15 rounded-full blur-xl"
          animate={{ 
            x: [0, 20, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        {/* Demo Banner */}
        {currentFamily === 'demo-family' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto mb-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-3 text-center"
          >
            <p className="text-sm text-primary font-medium">
              🎯 Demo Mode Active - Explore CareSync with sample data!
            </p>
          </motion.div>
        )}

        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CareSync</h1>
              <p className="text-gray-600">Sentient Care Coordination</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => setChatOpen(!isChatOpen)}
              className="p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:bg-white/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5 text-primary" />
            </motion.button>
            
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.email?.[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        {/* Upload Zone - The Brain Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={cn(
              "relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer",
              isDragActive 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-gray-300 hover:border-primary/50 hover:bg-primary/5",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-12 text-center">
              <motion.div
                className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center"
                animate={isUploading ? { rotate: 360 } : { scale: [1, 1.05, 1] }}
                transition={isUploading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
              >
                <Upload className="w-8 h-8 text-primary" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isUploading ? "Analyzing Document..." : "The Brain Upload"}
              </h3>
              <p className="text-gray-600 mb-4">
                {isUploading 
                  ? "AI is extracting care tasks from your document"
                  : "Drop medical documents here for AI analysis"
                }
              </p>
              
              {!isUploading && (
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>PDF</span>
                  <span>•</span>
                  <span>Images</span>
                  <span>•</span>
                  <span>Discharge Papers</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Pending Tasks</h2>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                {pendingTasks.length}
              </span>
            </div>

            <AnimatePresence>
              {pendingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  whileDrag={{ scale: 1.05, rotate: 2 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
                    <div className={cn("w-3 h-3 rounded-full", getPriorityColor(task.priority))} />
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                  )}
                  
                  {task.due_date && (
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatRelativeTime(task.due_date)}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {members.map((member) => (
                      <motion.button
                        key={member.id}
                        onClick={() => handleTaskAssignment(task.id, member.id)}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm hover:scale-110 transition-transform"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <img
                          src={member.avatar_url || generateAvatarUrl(member.name)}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Assigned Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">In Progress</h2>
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                {assignedTasks.length}
              </span>
            </div>

            <Reorder.Group
              axis="y"
              values={assignedTasks}
              onReorder={() => {}} // Handle reordering if needed
              className="space-y-4"
            >
              <AnimatePresence>
                {assignedTasks.map((task, index) => {
                  const assignedMember = members.find(m => m.id === task.assigned_to)
                  
                  return (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
                        <div className={cn("w-3 h-3 rounded-full", getPriorityColor(task.priority))} />
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                      )}
                      
                      {assignedMember && (
                        <div className="flex items-center space-x-3">
                          <img
                            src={assignedMember.avatar_url || generateAvatarUrl(assignedMember.name)}
                            alt={assignedMember.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{assignedMember.name}</span>
                        </div>
                      )}
                    </Reorder.Item>
                  )
                })}
              </AnimatePresence>
            </Reorder.Group>
          </motion.div>

          {/* Completed Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Completed</h2>
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                {completedTasks.length}
              </span>
            </div>

            <AnimatePresence>
              {completedTasks.map((task, index) => {
                const assignedMember = members.find(m => m.id === task.assigned_to)
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-green-50/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-green-100 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-700 flex-1 line-through">{task.title}</h3>
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    
                    {assignedMember && (
                      <div className="flex items-center space-x-3">
                        <img
                          src={assignedMember.avatar_url || generateAvatarUrl(assignedMember.name)}
                          alt={assignedMember.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-500">{assignedMember.name}</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Sentient Chat Slide-out */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 z-50"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sentient Chat</h3>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Ask questions about your medical documents</p>
            </div>
            
            <div className="flex-1 p-6">
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <p className="text-sm text-gray-600">
                  Chat functionality will be implemented here. Users can ask questions about uploaded medical documents.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}