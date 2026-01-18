'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import { createClient } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { cn, formatRelativeTime, generateAvatarUrl } from '@/lib/utils'
import { Upload, Brain, Users, MessageCircle, Plus, Calendar, AlertCircle, Check, Clock, ArrowLeft, Sparkles, ChevronRight, Send, Loader2, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { MagneticButtonGlass } from '@/components/ui/MagneticButton'
import { SoundToggle, useUISounds } from '@/components/effects/UISounds'
import { celebrateTaskCompletion } from '@/components/effects/MicroConfetti'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Chat Message Type
type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  id: string
}

export default function Dashboard() {
  const router = useRouter()
  // Supabase client removed

  const { playSuccess, playClick, playNotification } = useUISounds()
  const {
    currentFamily,
    tasks,
    members,
    setTasks,
    setMembers,
    setCurrentFamily,
    addTask,
    updateTask,
    isUploading,
    setUploading,
    isChatOpen,
    setChatOpen,
    addMember,
  } = useAppStore()

  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'progress' | 'completed'>('pending')
  const [loadingInitial, setLoadingInitial] = useState(true)

  // Chat State
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Add Member State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member')

  // Fetch Data on Load
  useEffect(() => {
    // We heavily rely on the store hydration now.
    // Just a small delay to ensure hydration is complete visually.
    const timer = setTimeout(() => {
      setLoadingInitial(false)

      // Ensure default family context if missing
      if (!currentFamily) {
        setCurrentFamily('local-family')
        setUser({
          id: 'local-user',
          email: 'you@example.com'
        })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [currentFamily, setCurrentFamily])

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onDrop = async (acceptedFiles: File[]) => {
    if (!currentFamily || acceptedFiles.length === 0) return

    setUploading(true)
    const file = acceptedFiles[0]

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('familyId', currentFamily)

      // Call the Real Analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze')
      }

      if (result.success) {
        playSuccess()
        playNotification()

        // Add the new tasks to state
        if (result.tasks && Array.isArray(result.tasks)) {
          // We might need to map them if the API returns slightly different shape
          // But based on our API code it matches exactly
          // We need to fetch the inserted tasks ideally, but the API returns them!
          result.tasks.forEach((task: any) => addTask(task))
        }

        // Open chat to show the analysis summary could be a nice touch
        setChatOpen(true)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I've analyzed **${file.name}**. \n\n**Summary**: ${result.analysis?.summary || 'Analysis complete.'}\n\nI've added **${result.tasks?.length || 0}** new tasks to your board.`
        }])
      }
    } catch (error) {
      console.error('Upload error:', error)
      // Optional: Show error toast
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  // Real Chat Implementation
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput
    }

    setMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })),
          familyContext: { tasks: tasks.slice(0, 5) } // Provide some context
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      if (!response.body) throw new Error('No response body')

      // Create placeholder for assistant message
      const assistantMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: ''
      }])

      // Handle Stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let accumulatedContent = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value, { stream: true })
        accumulatedContent += chunkValue

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMsgId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        )
      }
      playNotification()

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleTaskAssignment = async (taskId: string, memberId: string | null) => {
    playClick()

    // Local state only
    updateTask(taskId, {
      assigned_to: memberId,
      status: memberId ? 'assigned' : 'pending'
    })
  }

  const handleTaskComplete = useCallback(async (taskId: string, element?: HTMLElement) => {
    playSuccess()
    celebrateTaskCompletion(element)

    // Local update only
    updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }, [playSuccess, updateTask])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName.trim()) return

    const newMember = {
      id: crypto.randomUUID(),
      family_id: currentFamily || '00000000-0000-0000-0000-000000000000',
      user_id: crypto.randomUUID(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      avatar_url: null,
      created_at: new Date().toISOString()
    }

    addMember(newMember)
    playSuccess()

    // No DB sync

    setIsAddMemberOpen(false)
    setNewMemberName('')
    setNewMemberEmail('')
  }

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const assignedTasks = tasks.filter(task => task.status === 'assigned' || task.status === 'in_progress')
  const completedTasks = tasks.filter(task => task.status === 'completed')

  const tabs = [
    { id: 'pending', label: 'Pending', count: pendingTasks.length, icon: AlertCircle, color: 'text-amber-500' },
    { id: 'progress', label: 'In Progress', count: assignedTasks.length, icon: Clock, color: 'text-blue-500' },
    { id: 'completed', label: 'Completed', count: completedTasks.length, icon: Check, color: 'text-emerald-500' },
  ]

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mx-auto mb-6 flex items-center justify-center animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your care hub...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-nav"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="group" data-cursor="hover">
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ x: -4 }}
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.div>
              </Link>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Care<span className="text-gradient">Sync</span></h1>
                  <p className="text-xs text-muted-foreground">Family Care Hub</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setChatOpen(!isChatOpen)}
                className="p-3 rounded-xl glass-card hover:bg-white/10 transition-colors relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-cursor="hover"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
              </motion.button>

              <SoundToggle />
              <ThemeToggle />

              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm cursor-pointer"
                whileHover={{ scale: 1.05 }}
                data-cursor="hover"
                title={user?.email}
              >
                {user?.email?.[0]?.toUpperCase()}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-36 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div
            {...getRootProps()}
            className={cn(
              "relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer group",
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-primary/5",
              isUploading && "pointer-events-none"
            )}
          >
            <input {...getInputProps()} />

            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-12 md:p-16 text-center">
              <motion.div
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-500/25"
                animate={isUploading ? { rotate: 360 } : { scale: [1, 1.05, 1] }}
                transition={isUploading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 3, repeat: Infinity }}
              >
                <Upload className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {isUploading ? "Analyzing Document..." : "The Brain Upload"}
              </h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
                {isUploading
                  ? "AI is extracting care tasks from your document. This may take a moment."
                  : "Drop medical documents here for instant AI analysis"
                }
              </p>

              {!isUploading && (
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    PDF
                  </span>
                </div>
              )}

              {isUploading && (
                <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden mx-auto mt-6">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #667eea, #764ba2, #f953c6)' }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 p-1.5 glass-card rounded-2xl w-fit">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-cursor="hover"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-background shadow-md rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2.5">
                  <tab.icon className={cn("w-4 h-4", tab.color)} />
                  {tab.label}
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {(activeTab === 'pending' ? pendingTasks :
              activeTab === 'progress' ? assignedTasks :
                completedTasks).map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    members={members}
                    index={index}
                    onAssign={handleTaskAssignment}
                    onComplete={handleTaskComplete}
                    isCompleted={task.status === 'completed'}
                  />
                ))}
          </AnimatePresence>

          {/* Empty State */}
          {((activeTab === 'pending' && pendingTasks.length === 0) ||
            (activeTab === 'progress' && assignedTasks.length === 0) ||
            (activeTab === 'completed' && completedTasks.length === 0)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-16 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-muted mx-auto mb-6 flex items-center justify-center">
                  {activeTab === 'pending' && <AlertCircle className="w-10 h-10 text-muted-foreground" />}
                  {activeTab === 'progress' && <Clock className="w-10 h-10 text-muted-foreground" />}
                  {activeTab === 'completed' && <Check className="w-10 h-10 text-muted-foreground" />}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No {activeTab === 'progress' ? 'in progress' : activeTab} tasks
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending' && 'Upload a medical document above to detect new tasks'}
                  {activeTab === 'progress' && 'Assign tasks to family members to start progress'}
                  {activeTab === 'completed' && 'Completed tasks will appear here'}
                </p>
              </motion.div>
            )}
        </div>

        {/* Family Members Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Family Members</h2>
            <MagneticButtonGlass onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </MagneticButtonGlass>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-shadow"
                data-cursor="hover"
              >
                <img
                  src={member.avatar_url || generateAvatarUrl(member.name)}
                  alt={member.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{member.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                </div>
                <div className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  member.role === 'admin'
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {member.role || 'member'}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Sentient Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md glass z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Sentient Chat</h3>
                    <p className="text-xs text-muted-foreground">Powered by Groq Llama 3</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setChatOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
                {/* Welcome Message */}
                {messages.length === 0 && (
                  <div className="glass-card rounded-2xl p-5 mb-4">
                    <p className="text-muted-foreground">
                      👋 Hello! I'm your Sentient Care Assistant. I can help you understand medical documents, suggest care tasks, and coordinate with your family.
                    </p>
                  </div>
                )}

                {/* Message List */}
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex w-full",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] rounded-2xl p-4 shadow-sm",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted/50 text-foreground rounded-tl-sm border border-border/50"
                    )}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}

                {isChatLoading && !messages.find(m => m.id === 'loading') && messages[messages.length - 1]?.role === 'user' && (
                  <motion.div className="flex justify-start">
                    <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4 flex gap-1">
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border shrink-0 bg-background/50 backdrop-blur-lg">
                {/* Suggestions */}
                {messages.length === 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {['Summarize recent tasks', 'What does this prescription mean?', 'Schedule a check-up'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => { setChatInput(suggestion); handleSendMessage(); }}
                        className="whitespace-nowrap px-4 py-2 rounded-full border border-border text-xs hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your care plan..."
                    disabled={isChatLoading}
                    className="w-full pl-5 pr-14 py-4 rounded-2xl glass-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                  >
                    {isChatLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddMemberOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsAddMemberOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card rounded-3xl p-8 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Add Member</h3>
                    <p className="text-sm text-muted-foreground">Invite family to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddMemberOpen(false)}
                  className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-5 py-4 rounded-2xl glass bg-white/50 dark:bg-black/20 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full px-5 py-4 rounded-2xl glass bg-white/50 dark:bg-black/20 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Role</label>
                  <div className="flex bg-muted/50 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setNewMemberRole('admin')}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
                        newMemberRole === 'admin'
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMemberRole('member')}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
                        newMemberRole === 'member'
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Member
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <MagneticButtonGlass className="w-full justify-center !bg-primary !text-primary-foreground hover:!bg-primary/90">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Family Member
                  </MagneticButtonGlass>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Task Card Component (Same as before)
function TaskCard({
  task,
  members,
  index,
  onAssign,
  onComplete,
  isCompleted
}: {
  task: any
  members: any[]
  index: number
  onAssign: (taskId: string, memberId: string | null) => void
  onComplete: (taskId: string, element?: HTMLElement) => void
  isCompleted: boolean
}) {
  const assignedMember = members.find(m => m.id === task.assigned_to)

  const priorityStyles = {
    urgent: 'from-red-500 to-rose-500',
    high: 'from-amber-500 to-orange-500',
    medium: 'from-blue-500 to-cyan-500',
    low: 'from-slate-400 to-slate-500',
  }

  // Ensure priority has a fallback
  const priorityClass = priorityStyles[task.priority as keyof typeof priorityStyles] || priorityStyles.medium

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glass-card rounded-3xl p-6 relative overflow-hidden group",
        isCompleted && "opacity-60"
      )}
      data-cursor="hover"
    >
      {/* Priority Indicator */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        priorityClass
      )} />

      {/* Content */}
      <div className="pt-2">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className={cn(
            "font-semibold text-foreground text-lg flex-1",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>

          {!isCompleted && (
            <motion.button
              onClick={(e) => onComplete(task.id, e.currentTarget as HTMLElement)}
              className="w-8 h-8 rounded-lg border-2 border-border hover:border-emerald-500 hover:bg-emerald-500 flex items-center justify-center transition-colors group/check"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              data-cursor="hover"
            >
              <Check className="w-4 h-4 text-transparent group-hover/check:text-white transition-colors" />
            </motion.button>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {task.due_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {formatRelativeTime(task.due_date)}
            </div>
          )}

          {assignedMember ? (
            <div className="flex items-center gap-2">
              <img
                src={assignedMember.avatar_url || generateAvatarUrl(assignedMember.name)}
                alt={assignedMember.name}
                className="w-7 h-7 rounded-full border-2 border-background object-cover"
              />
              <span className="text-xs text-muted-foreground">{assignedMember.name.split(' ')[0]}</span>
            </div>
          ) : (
            <div className="flex items-center -space-x-2">
              {members.slice(0, 3).map((member) => (
                <motion.button
                  key={member.id}
                  onClick={() => onAssign(task.id, member.id)}
                  className="w-8 h-8 rounded-full border-2 border-background overflow-hidden hover:scale-110 hover:z-10 transition-transform"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  title={`Assign to ${member.name}`}
                  data-cursor="hover"
                >
                  <img
                    src={member.avatar_url || generateAvatarUrl(member.name)}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}