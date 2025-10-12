import React, { useState } from 'react';
import { X, FileText, AlertCircle, CheckCircle, TrendingUp, Users, MapPin, Calendar } from 'lucide-react';

interface DocumentAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  documentType?: string;
}

interface Analysis {
  summary: string;
  keyPoints: string[];
  entities: {
    people: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
  };
  legalIssues: string[];
  risks: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
  confidence: number;
}

export default function DocumentAnalysisModal({ 
  isOpen, 
  onClose, 
  documentText,
  documentType 
}: DocumentAnalysisProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && documentText) {
      analyzeDocument();
    }
  }, [isOpen, documentText]);

  const analyzeDocument = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          documentText,
          documentType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze document');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-3" />
            <h2 className="text-2xl font-bold">AI Document Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Analyzing document with AI...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Analysis Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Confidence Score */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">Analysis Confidence</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.round(analysis.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Key Points */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {analysis.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Entities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Identified Entities</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.entities.people.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">People</h4>
                      </div>
                      <ul className="space-y-1">
                        {analysis.entities.people.map((person, index) => (
                          <li key={index} className="text-sm text-gray-700">{person}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.entities.organizations.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Organizations</h4>
                      </div>
                      <ul className="space-y-1">
                        {analysis.entities.organizations.map((org, index) => (
                          <li key={index} className="text-sm text-gray-700">{org}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.entities.locations.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <MapPin className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Locations</h4>
                      </div>
                      <ul className="space-y-1">
                        {analysis.entities.locations.map((location, index) => (
                          <li key={index} className="text-sm text-gray-700">{location}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.entities.dates.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Dates</h4>
                      </div>
                      <ul className="space-y-1">
                        {analysis.entities.dates.map((date, index) => (
                          <li key={index} className="text-sm text-gray-700">{date}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal Issues */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Issues</h3>
                <div className="space-y-2">
                  {analysis.legalIssues.map((issue, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-gray-800">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Identified Risks</h3>
                <div className="space-y-3">
                  {analysis.risks.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(risk.severity)}`}>
                          {risk.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700">{risk.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}