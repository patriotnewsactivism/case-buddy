import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Document } from '../lib/supabase'
import { FileText, Video, Image, Clock, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react'

interface DocumentListProps {
  caseId: string
}

export const DocumentList: React.FC<DocumentListProps> = ({ caseId }) => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    }, [])[fetchDocuments]);

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('documents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `case_id=eq.${caseId}`
      }, [])(payload) => {
        console.log('Document updated:', payload)
        fetchDocuments() // Refresh list
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])[caseId])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return <FileText className="w-6 h-6 text-red-600" />
    if (fileType?.includes('image')) return <Image className="w-6 h-6 text-blue-600" />
    if (fileType?.includes('video')) return <Video className="w-6 h-6 text-purple-600" />
    return <FileText className="w-6 h-6 text-gray-600" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const downloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.storage_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = document.file_name
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading documents…</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Case Documents</h2>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents uploaded yet. Use the upload area above to add documents.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {getFileIcon(doc.file_type)}
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900 text-sm">{doc.title}</h3>
                    <p className="text-xs text-gray-500">{(doc.file_size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                {getStatusIcon(doc.status)}
              </div>

              {doc.confidence_score && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">AI Confidence</span>
                    <span className="font-medium">{doc.confidence_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${doc.confidence_score}%` }}
                    />
                  </div>
                </div>
              )}

              {doc.analysis_result && (
                <div className="mb-3 space-y-1">
                  <div className="text-xs text-gray-600">
                    <strong>Type:</strong> {doc.analysis_result.documentType}
                  </div>
                  {doc.analysis_result.keyFindings && (
                    <div className="text-xs text-gray-600">
                      <strong>Findings:</strong> {doc.analysis_result.keyFindings.length} items
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadDocument(doc)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    title="View Analysis"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

