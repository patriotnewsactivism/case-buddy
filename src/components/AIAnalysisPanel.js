import React, { useState } from 'react';

const AIAnalysisPanel = ({ documentContent }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    // In a real implementation, this would call an AI service API
    // For now, we'll simulate the response
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysis({
        keyFacts: [
          "Market size estimate: $2.3 billion",
          "Growth rate: 12% annually",
          "Main competitors identified",
          "Regulatory changes expected in 2026"
        ],
        timelineEvents: [
          { date: "2025-09-10", title: "Market entry opportunity identified" },
          { date: "2025-12-01", title: "Competitor launch anticipated" },
          { date: "2026-01-01", title: "Regulatory changes implementation" }
        ],
        recommendations: [
          "Focus on underserved market segments",
          "Consider partnership opportunities with local distributors",
          "Monitor competitor activities closely"
        ]
      });
    }, 3000);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="font-semibold text-lg mb-3">AI Document Analysis</h3>
      
      <button 
        onClick={runAIAnalysis}
        disabled={isAnalyzing}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-4 transition-colors disabled:opacity-50"
      >
        {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
      </button>
      
      {analysis && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Key Facts Identified</h4>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.keyFacts.map((fact, index) => (
                <li key={index} className="text-gray-600">{fact}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Suggested Timeline Events</h4>
            <ul className="space-y-2">
              {analysis.timelineEvents.map((event, index) => (
                <li key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                  <span className="font-medium mr-2">{event.date}:</span>
                  <span className="text-gray-600">{event.title}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Case Recommendations</h4>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-600">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;