import React, { useState } from 'react';
import { addDoc } from '../services/storage';
import { searchDocuments } from '../services/search';
import { FileText, Upload, Search, AlertCircle, CheckCircle, Loader2, Filter, Download, Eye, Clock } from 'lucide-react';
import AIAnalysisPanel from '../components/AIAnalysisPanel';

function extractText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(String(e.target.result || ''));
    reader.readAsText(file);
  });
}

const DocumentAnalyzer = () => {
  const [documentContent, setDocumentContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('brief');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setDocumentName(file.name);
    
    if (file.type.startsWith('text/')) {
      const text = await extractText(file);
      setDocumentContent(text);
    } else if (file.type === 'application/pdf') {
      // In a real implementation, this would use a PDF parsing library
      setDocumentContent(`Uploaded PDF: ${file.name} (PDF content would be extracted here). You can paste text below for analysis.`);
    } else {
      setDocumentContent(`Uploaded file: ${file.name} (preview not supported for this file type). You can paste text below for analysis.`);
    }
    
    // Add to uploaded files list
    setUploadedFiles(prev => [...prev, {
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toLocaleString(),
      status: 'uploaded'
    }]);
  };

  const analyzeDocument = async () => {
    if (!documentContent.trim()) {
      alert('Please upload or paste document content first.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    // In a real implementation, this would call an AI service API
    // For now, we'll simulate legal document analysis
    setTimeout(() => {
      // Extract key sentences for basic analysis
      const lines = documentContent.split(/\n+/).map(s => s.trim()).filter(Boolean);
      const top = lines.slice(0, 5);
      const summary = top.join('\n');
      
      // Identify legal terms
      const legalTerms = [
        'plaintiff', 'defendant', 'court', 'motion', 'judgment', 'appeal',
        'statute', 'evidence', 'testimony', 'witness', 'damages', 'liability'
      ];
      
      const foundTerms = legalTerms.filter(term => 
        documentContent.toLowerCase().includes(term)
      );
      
      // Generate basic analysis
      const analysisText = `
## Document Analysis Summary

**Document Type:** ${documentType === 'brief' ? 'Legal Brief' : documentType === 'contract' ? 'Contract' : documentType === 'discovery' ? 'Discovery Document' : 'Legal Document'}

**Key Content:**
${summary}

**Legal Terms Identified:** ${foundTerms.join(', ')}

**Recommended Actions:**
1. Review document for factual accuracy
2. Cross-reference with related case documents
3. Identify potential strengths and weaknesses
4. Consider additional evidence needs
      `;
      
      // Save to local library
      addDoc({ 
        name: documentName || 'Analyzed Document', 
        text: documentContent, 
        summary,
        analysis: analysisText,
        documentType
      });
      
      setIsAnalyzing(false);
      setAnalysisResult(analysisText);
      setShowAIPanel(true);
    }, 2000);
  };

  const runSearch = () => {
    setResults(searchDocuments(query));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-4">
        <FileText className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Legal Document Analyzer</h2>
      </div>
      <p className="text-gray-600 mb-6">Upload legal documents for AI-powered analysis, insights, and case strategy recommendations</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 text-blue-600 mr-2" />
              Document Upload
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm font-medium">Document Type</label>
              <select 
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="brief">Legal Brief</option>
                <option value="contract">Contract</option>
                <option value="discovery">Discovery Document</option>
                <option value="pleading">Pleading</option>
                <option value="correspondence">Legal Correspondence</option>
                <option value="evidence">Evidence</option>
                <option value="other">Other Legal Document</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm font-medium">Upload a file</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <input 
                  type="file" 
                  onChange={handleFile} 
                  className="hidden" 
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 mb-1">Drag and drop or click to upload</p>
                  <p className="text-gray-500 text-sm">Supports PDF, Word, and text files</p>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm font-medium">Document Name</label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter document name..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm font-medium">Document Content</label>
              <textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Paste document content here or upload a file above..."
              />
            </div>
            
            <button
              onClick={analyzeDocument}
              disabled={isAnalyzing || !documentContent.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Document...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Analyze Document
                </>
              )}
            </button>
          </div>

          {analysisResult && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Analysis Result
                </h3>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-md border border-gray-200">{analysisResult}</pre>
              </div>
            </div>
          )}
          
          {showAIPanel && (
            <AIAnalysisPanel documentContent={documentContent} />
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Search className="w-5 h-5 text-blue-600 mr-2" />
              Document Search
            </h3>
            <div className="flex gap-2 mb-4">
              <input 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="Search your document library..." 
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              <button 
                onClick={runSearch} 
                className="bg-gray-800 hover:bg-black text-white px-4 rounded-md flex items-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Search Results</span>
              <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </button>
            </div>
            
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {results.map(r => (
                <li key={r.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <div className="font-medium text-gray-900">{r.name}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-2">
                      {r.documentType || 'Document'}
                    </span>
                    <span>Score: {r.score}</span>
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2 mt-1">{r.summary}</div>
                </li>
              ))}
              {results.length === 0 && (
                <li className="text-gray-500 text-sm p-3 text-center">
                  No results found. Try a different search term.
                </li>
              )}
            </ul>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              Recent Uploads
            </h3>
            
            {uploadedFiles.length > 0 ? (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {uploadedFiles.map(file => (
                  <li key={file.id} className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="mr-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <span className="mx-1">•</span>
                        <span>{file.uploadedAt}</span>
                      </div>
                    </div>
                    <div className="ml-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {file.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No documents uploaded yet</p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Document Analysis Tips</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Upload complete documents for best results</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Select the correct document type for specialized analysis</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Use search to find related documents in your library</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>AI analysis works best with clear, well-formatted text</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;