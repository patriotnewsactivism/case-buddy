import React, { useState } from 'react';
import { Brain, AlertCircle, Loader2, CheckCircle, Scale, Gavel } from 'lucide-react';

const AIAnalysisPanel = ({ documentContent }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    
    // In a real implementation, this would call an AI service API
    // For now, we'll simulate the response with legal-specific analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysis({
        documentType: "Legal Brief",
        keyFacts: [
          "Plaintiff alleges Fourth Amendment violations under 42 U.S.C. § 1983",
          "Incident occurred on June 15, 2025 during traffic stop",
          "Officer Smith is primary defendant with Metro PD as municipal defendant",
          "Plaintiff seeking compensatory damages of $250,000 and punitive damages",
          "Body camera footage referenced as key evidence"
        ],
        legalIssues: [
          "Qualified immunity defense likely to be raised",
          "Municipal liability under Monell requires showing of policy or custom",
          "Excessive force claim requires objective reasonableness analysis",
          "Potential supplemental state law claims for assault and battery"
        ],
        caseReferences: [
          { case: "Graham v. Connor, 490 U.S. 386 (1989)", relevance: "Establishes objective reasonableness standard for excessive force claims" },
          { case: "Monell v. Dept. of Social Services, 436 U.S. 658 (1978)", relevance: "Municipal liability requires policy or custom" },
          { case: "Tennessee v. Garner, 471 U.S. 1 (1985)", relevance: "Use of force must be proportional to threat" }
        ],
        timelineEvents: [
          { date: "2025-06-15", title: "Incident occurred during traffic stop" },
          { date: "2025-06-16", title: "Medical treatment sought for injuries" },
          { date: "2025-06-20", title: "Internal affairs complaint filed" },
          { date: "2025-07-30", title: "Notice of claim submitted to municipality" },
          { date: "2025-09-10", title: "Statute of limitations deadline approaching" }
        ],
        recommendations: [
          "Request preservation of all body camera footage and dispatch recordings",
          "Obtain complete medical records and expert evaluation of injuries",
          "Identify and interview all witnesses to the incident",
          "File FOIA request for officer disciplinary records and department policies",
          "Consider retaining use-of-force expert for testimony"
        ],
        riskAssessment: {
          strengthScore: 75,
          weaknesses: [
            "Potential factual disputes about compliance with officer commands",
            "Prior case dismissals in similar circumstances in this jurisdiction",
            "Qualified immunity remains significant hurdle"
          ],
          opportunities: [
            "Body camera footage provides objective evidence",
            "Similar cases have recently succeeded in this circuit",
            "Department has history of excessive force complaints"
          ]
        }
      });
    }, 3000);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <Brain className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="font-semibold text-xl text-gray-900">Legal Document Analysis</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Upload legal documents to receive AI-powered analysis including key facts, legal issues, relevant case law, and strategic recommendations.
      </p>
      
      <button 
        onClick={runAIAnalysis}
        disabled={isAnalyzing}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md mb-6 transition-colors disabled:opacity-50 flex items-center justify-center w-full md:w-auto"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing Document...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            Run Legal Analysis
          </>
        )}
      </button>
      
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* Document Type */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Gavel className="w-5 h-5 text-blue-700 mr-2" />
              <h4 className="font-semibold text-blue-900">Document Type</h4>
            </div>
            <p className="text-blue-800">{analysis.documentType}</p>
          </div>
          
          {/* Key Facts */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Key Facts Identified
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.keyFacts.map((fact, index) => (
                <li key={index} className="text-gray-700">{fact}</li>
              ))}
            </ul>
          </div>
          
          {/* Legal Issues */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
              Legal Issues
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.legalIssues.map((issue, index) => (
                <li key={index} className="text-gray-700">{issue}</li>
              ))}
            </ul>
          </div>
          
          {/* Case References */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Scale className="w-5 h-5 text-purple-600 mr-2" />
              Relevant Case Law
            </h4>
            <div className="space-y-3">
              {analysis.caseReferences.map((caseRef, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium text-gray-900">{caseRef.case}</p>
                  <p className="text-gray-600 text-sm">{caseRef.relevance}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeline */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Case Timeline</h4>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-5 bottom-5 w-0.5 bg-gray-300"></div>
              
              <ul className="space-y-4">
                {analysis.timelineEvents.map((event, index) => (
                  <li key={index} className="flex items-start ml-6 relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 mt-1.5 w-3 h-3 rounded-full bg-blue-600"></div>
                    <div>
                      <span className="font-medium text-gray-900 block">{event.date}</span>
                      <span className="text-gray-700">{event.title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Strategic Recommendations</h4>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
          
          {/* Risk Assessment */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Case Strength Assessment</h4>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Case Strength</span>
                <span className="font-medium">{analysis.riskAssessment.strengthScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${analysis.riskAssessment.strengthScore}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-red-700 mb-2">Potential Challenges</h5>
                <ul className="text-sm space-y-1">
                  {analysis.riskAssessment.weaknesses.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium text-green-700 mb-2">Case Strengths</h5>
                <ul className="text-sm space-y-1">
                  {analysis.riskAssessment.opportunities.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;