/**
 * Database Types for Real-Time Code Review Dashboard
 * Auto-generated from Supabase migration: 001_create_realtime_schema.sql
 *
 * Generate updated types with:
 * npx supabase gen types typescript --local > supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pr_sessions: {
        Row: {
          id: string
          pr_id: string
          user_id: string
          joined_at: string
          last_seen_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          pr_id: string
          user_id: string
          joined_at?: string
          last_seen_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          pr_id?: string
          user_id?: string
          joined_at?: string
          last_seen_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pr_sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      presence: {
        Row: {
          id: string
          session_id: string
          user_id: string
          pr_id: string
          username: string
          avatar_url: string | null
          current_file: string | null
          current_line: number | null
          status: string
          last_heartbeat: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          pr_id: string
          username: string
          avatar_url?: string | null
          current_file?: string | null
          current_line?: number | null
          status?: string
          last_heartbeat?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          pr_id?: string
          username?: string
          avatar_url?: string | null
          current_file?: string | null
          current_line?: number | null
          status?: string
          last_heartbeat?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "pr_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cursors: {
        Row: {
          id: string
          session_id: string
          user_id: string
          pr_id: string
          file_path: string
          x: number
          y: number
          line_number: number | null
          color: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          pr_id: string
          file_path: string
          x: number
          y: number
          line_number?: number | null
          color: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          pr_id?: string
          file_path?: string
          x?: number
          y?: number
          line_number?: number | null
          color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursors_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "pr_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cursors_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          pr_id: string
          file_path: string
          line_number: number
          user_id: string
          username: string
          avatar_url: string | null
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
          is_deleted: boolean
        }
        Insert: {
          id?: string
          pr_id: string
          file_path: string
          line_number: number
          user_id: string
          username: string
          avatar_url?: string | null
          content: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
        Update: {
          id?: string
          pr_id?: string
          file_path?: string
          line_number?: number
          user_id?: string
          username?: string
          avatar_url?: string | null
          content?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_stale_sessions: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      cleanup_stale_presence: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for application code
export type PRSession = Database['public']['Tables']['pr_sessions']['Row']
export type PRSessionInsert = Database['public']['Tables']['pr_sessions']['Insert']
export type PRSessionUpdate = Database['public']['Tables']['pr_sessions']['Update']

export type Presence = Database['public']['Tables']['presence']['Row']
export type PresenceInsert = Database['public']['Tables']['presence']['Insert']
export type PresenceUpdate = Database['public']['Tables']['presence']['Update']

export type Cursor = Database['public']['Tables']['cursors']['Row']
export type CursorInsert = Database['public']['Tables']['cursors']['Insert']
export type CursorUpdate = Database['public']['Tables']['cursors']['Update']

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

// Status enum for presence table
export type PresenceStatus = 'viewing' | 'commenting' | 'idle'

// Helper type for PR ID format
export type PRId = `${string}/${string}/${number}` // owner/repo/number

// Helper type for session with presence
export interface SessionWithPresence extends PRSession {
  presence: Presence | null
}

// Helper type for comment with replies
export interface CommentWithReplies extends Comment {
  replies?: Comment[]
}

// Supabase client configuration
export interface SupabaseConfig {
  url: string
  anonKey: string
}
