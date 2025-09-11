import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { DocumentUpload } from './components/DocumentUpload'
import { DocumentList } from './components/DocumentList'
import { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading CaseBuddy…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">CaseBuddy</h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
          <p className="text-gray-600 mt-2">AI-Powered Legal Document Analysis</p>
        </div>

        <div className="space-y-8">
          {/* Document Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
            <DocumentUpload
              caseId={selectedCaseId || 'default-case'}
              onUploadComplete={(doc) => {
                console.log('Document uploaded:', doc)
                // Refresh document list automatically via real-time subscription
              }}
            />
          </div>

          {/* Document List Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <DocumentList caseId={selectedCaseId || 'default-case'} />
          </div>
        </div>
      </div>
    </div>
  )
}
