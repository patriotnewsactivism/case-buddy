import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Case {
  id: string
  user_id: string
  title: string
  type: string
  status: string
  priority: string
  client_name?: string
  damages?: string
  jurisdiction?: string
  description?: string
  progress: number
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  case_id: string
  user_id: string
  title: string
  file_name: string
  file_size: number
  file_type: string
  storage_path: string
  extracted_text?: string
  analysis_result?: any
  confidence_score?: number
  status: string
  created_at: string
}

export interface AnalysisResult {
  id: string
  document_id: string
  case_id: string
  analysis_type: string
  result: any
  confidence_score?: number
  created_at: string
}
