import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  try {
    return createClientComponentClient()
  } catch (error) {
    console.log('Supabase client initialization failed, using demo mode')
    // Return a mock client for demo mode
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: () => Promise.resolve({ error: new Error('Demo mode') })
      },
      from: () => ({
        select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [] }) }) }),
        insert: () => ({ select: () => Promise.resolve({ data: [] }) }),
        update: () => ({ eq: () => Promise.resolve({ data: [] }) })
      }),
      channel: () => ({
        on: () => ({ subscribe: () => Promise.resolve() }),
        unsubscribe: () => Promise.resolve()
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Demo mode') }),
          getPublicUrl: () => ({ data: { publicUrl: 'demo-url' } })
        })
      }
    } as any
  }
}

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          name: string
          email: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          name: string
          email?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          name?: string
          email?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          family_id: string
          uploaded_by: string | null
          filename: string
          file_url: string
          document_type: string | null
          analysis_result: any | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          uploaded_by?: string | null
          filename: string
          file_url: string
          document_type?: string | null
          analysis_result?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          uploaded_by?: string | null
          filename?: string
          file_url?: string
          document_type?: string | null
          analysis_result?: any | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          family_id: string
          document_id: string | null
          title: string
          description: string | null
          priority: string
          status: string
          assigned_to: string | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          document_id?: string | null
          title: string
          description?: string | null
          priority?: string
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          document_id?: string | null
          title?: string
          description?: string | null
          priority?: string
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}