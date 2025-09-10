import React, { useState } from 'react';
import AIAnalysisPanel from '../components/AIAnalysisPanel';
import InterviewSimulator from '../components/InterviewSimulator';

const CaseDetails = () => {
  const [activeTab, setActiveTab] = useState('documents');
  
  // Sample case data - in a real app this would come from the backend
  const caseData = {
    title: "Tech Startup Market Entry",
    description: "Analyzing market opportunities for AI-powered productivity tools in Southeast Asia",
    type: "Market Entry",
    lastUpdated: "2025-09-08"
  };
  
  // Sample documents - in a real app this would come from the backend
  const documents = [
    { id: 1, name: "Market Research Report.pdf", date: "2025-09-05" },
    { id: 2, name: "Competitor Analysis.docx", date: "2025-09-03" },
    { id: 3, name: "Regulatory Guidelines.txt", date: "2025-09-01" }
  ];
  
  // Sample timeline events - in a real app this would come from the backend
  const timelineEvents = [
    { id: 1, date: "2025-09-01", title: "Initial market research", description: "Completed comprehensive market analysis for Southeast Asia" },
    { id: 2, date: "2025-09-05", title: "Competitor evaluation", description: "Identified key competitors and their market positioning" },
    { id: 3, date: "2025-09-08", title: "Regulatory review", description: "Assessed legal requirements for market entry" }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{caseData.title}</h2>
        <div className="flex items-center mt-2">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">
            {caseData.type}
          </span>
          <span className="text-gray-500 text-sm">Last updated: {caseData.lastUpdated}</span>
        </div>
        <p className="text-gray-600 mt-3">{caseData.description}</p>
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'evidence'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Evidence
          </button>
          <button
            onClick={() => setActiveTab('foia')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'foia'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            FOIA Requests
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Interview Prep
          </button>
        </nav>
      </div>
      
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Case Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium">{doc.name}</h4>
                <p className="text-gray-500 text-sm mt-2">Added: {doc.date}</p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Document
                </button>
              </div>
            ))}
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors mt-4">
            + Add Document
          </button>
        </div>
      )}
      
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Case Timeline</h3>
          <div className="space-y-4">
            {timelineEvents.map((event) => (
              <div key={event.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="w-0.5 h-full bg-gray-300"></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-gray-500 text-sm">{event.date}</p>
                  <p className="text-gray-700 mt-2">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            + Add Timeline Event
          </button>
        </div>
      )}
      
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">AI Document Analysis</h3>
          <AIAnalysisPanel documentContent="" />
        </div>
      )}
      
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Case Interview Simulator</h3>
          <InterviewSimulator />
        </div>
      )}
    </div>
  );
};

export default CaseDetails;