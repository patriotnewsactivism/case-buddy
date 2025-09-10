import React, { useState } from 'react';

const DocumentAnalyzer = () => {
  const [documentContent, setDocumentContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const analyzeDocument = () => {
    setIsAnalyzing(true);
    // In a real app, this would send the document content to an AI service for analysis
    setAnalysisResult('');
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult(`
        ## AI Analysis Results
        
        **Key Facts Identified:**
        - Market size estimate: $2.3 billion
        - Growth rate: 12% annually
        - Main competitors: Company A, Company B, Company C
        - Regulatory changes expected in 2026
        
        **Potential Timeline Events:**
        - [Add] Market entry opportunity identified (2025-09-10)
        - [Add] Competitor Company A launch (2025-12-01)
        - [Add] Regulatory changes implementation (2026-01-01)
        
        **Case Recommendations:**
        - Focus on underserved market segments
        - Consider partnership opportunities with local distributors
        - Monitor competitor activities closely
      `);
    }, 3000);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Analyzer</h2>
      <p className="text-gray-600 mb-6">Upload documents for AI-powered analysis and insights</p>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Document Content</label>
          <textarea
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-md"
            placeholder="Paste document content here or upload a file below..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Upload File</label>
          <input
            type="file"
            className="w-full p-2 border border-gray-300 rounded-md"
            accept=".pdf,.doc,.docx,.txt"
          />
        </div>
        
        <button 
          onClick={analyzeDocument}
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </button>
      </div>
      
      {analysisResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
          <div className="prose max-w-none">
            {analysisResult.split('\n').map((line, index) => (
              <p key={index} className={line.startsWith('##') ? 'font-semibold text-lg' : ''}>
                {line.startsWith('##') ? line.substring(2) : line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalyzer;