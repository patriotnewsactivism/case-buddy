import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../lib/supabase'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface DocumentUploadProps {
  caseId: string
  onUploadComplete: (document: any) => void
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ caseId, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${caseId}/${uuidv4()}.${fileExt}`

      // Upload file to Supabase storage
      setUploadProgress(25)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      setUploadProgress(50)

      // Create document record in database
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          case_id: caseId,
          user_id: user.id,
          title: file.name.replace(`.${fileExt}`, ''),
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: fileName,
          status: 'uploaded'
        })
        .select()
        .single()

      if (dbError) throw dbError

      setUploadProgress(75)

      // Trigger OCR and analysis
      await triggerDocumentAnalysis(documentData.id, fileName)

      setUploadProgress(100)
      onUploadComplete(documentData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [caseId, onUploadComplete])

  const triggerDocumentAnalysis = async (documentId: string, filePath: string) => {
    try {
      // Call Netlify function to process document
      const response = await fetch('/.netlify/functions/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          filePath,
          caseId
        })
      })

      if (!response.ok) {
        throw new Error('Document processing failed')
      }

      const result = await response.json()
      console.log('Document processing initiated:', result)

    } catch (err) {
      console.error('Analysis trigger failed:', err)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB limit
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
            <div>
              <p className="text-lg font-medium text-gray-900">Processing Document...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the file here' : 'Upload Legal Document'}
              </p>
              <p className="text-gray-600">
                Drag & drop or click to upload PDF, images, or Word documents
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Maximum file size: 50MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}
    </div>
  )
}
