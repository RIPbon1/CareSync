import { create } from 'zustand'
import { Database } from './supabase'

type Task = Database['public']['Tables']['tasks']['Row']
type Member = Database['public']['Tables']['members']['Row']
type Document = Database['public']['Tables']['documents']['Row']

interface AppState {
  // Current family
  currentFamily: string | null
  setCurrentFamily: (familyId: string | null) => void

  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  removeTask: (taskId: string) => void

  // Members
  members: Member[]
  setMembers: (members: Member[]) => void
  addMember: (member: Member) => void

  // Documents
  documents: Document[]
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void

  // UI State
  isChatOpen: boolean
  setChatOpen: (open: boolean) => void
  
  isUploading: boolean
  setUploading: (uploading: boolean) => void

  selectedTaskId: string | null
  setSelectedTaskId: (taskId: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Current family
  currentFamily: null,
  setCurrentFamily: (familyId) => set({ currentFamily: familyId }),

  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),

  // Members
  members: [],
  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),

  // Documents
  documents: [],
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ documents: [...state.documents, document] })),

  // UI State
  isChatOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open }),
  
  isUploading: false,
  setUploading: (uploading) => set({ isUploading: uploading }),

  selectedTaskId: null,
  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),
}))

// Selectors
export const useCurrentTasks = () => {
  const tasks = useAppStore((state) => state.tasks)
  const currentFamily = useAppStore((state) => state.currentFamily)
  
  return tasks.filter((task) => task.family_id === currentFamily)
}

export const useTasksByStatus = (status: string) => {
  const tasks = useCurrentTasks()
  return tasks.filter((task) => task.status === status)
}

export const useTasksByMember = (memberId: string) => {
  const tasks = useCurrentTasks()
  return tasks.filter((task) => task.assigned_to === memberId)
}