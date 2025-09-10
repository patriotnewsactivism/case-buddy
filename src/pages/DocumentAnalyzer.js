
import React, { useState } from 'react';
import { addDoc } from '../services/storage';
import { searchDocuments } from '../services/search';

function extractText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(String(e.target.result || ''));
    reader.readAsText(file);
  });
}

const DocumentAnalyzer = () => {
  const [documentContent, setDocumentContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('text/')) {
      const text = await extractText(file);
      setDocumentContent(text);
    } else {
      // For demo, we don't parse PDFs here.
      setDocumentContent(`Uploaded file: ${file.name} (preview not supported here). You can paste text below.`);
    }
  };

  const analyzeDocument = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    // naive key sentence extraction
    const lines = documentContent.split(/\n+/).map(s=>s.trim()).filter(Boolean);
    const top = lines.slice(0, 5);
    const summary = top.join('\n');
    // save to local library
    addDoc({ name: 'Pasted Document', text: documentContent, summary });
    setTimeout(()=>{
      setIsAnalyzing(false);
      setAnalysisResult(summary || 'No content to analyze.');
    }, 400);
  };

  const runSearch = () => {
    setResults(searchDocuments(query));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Analyzer</h2>
      <p className="text-gray-600 mb-6">Upload documents for AI-powered analysis and insights</p>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Upload a file</label>
          <input type="file" onChange={handleFile} className="block" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Document Content</label>
          <textarea
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-md"
            placeholder="Paste document content here or upload a file above..."
          />
        </div>
        <button
          onClick={analyzeDocument}
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Document"}
        </button>
      </div>

      {analysisResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Analysis Result</h3>
          <pre className="whitespace-pre-wrap text-green-900">{analysisResult}</pre>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Semantic Search</h3>
        <div className="flex gap-2 mb-3">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your document library..." className="flex-1 p-3 border border-gray-300 rounded-md" />
          <button onClick={runSearch} className="bg-gray-800 hover:bg-black text-white px-4 rounded-md">Search</button>
        </div>
        <ul className="space-y-2">
          {results.map(r => (
            <li key={r.id} className="p-3 border border-gray-200 rounded">
              <div className="font-medium">{r.name} <span className="text-xs text-gray-500">score {r.score}</span></div>
              <div className="text-sm text-gray-700 line-clamp-3">{r.summary}</div>
            </li>
          ))}
          {results.length===0 && <li className="text-gray-500">No results yet.</li>}
        </ul>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;
