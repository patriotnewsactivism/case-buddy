import React, { useState } from 'react';
import { X, Tag, Shield, TrendingUp, AlertCircle } from 'lucide-react';

interface EvidenceClassificationProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceName: string;
  evidenceDescription: string;
  fileType?: string;
}

interface Classification {
  type: string;
  subtype?: string;
  tags: string[];
  confidence: number;
  explanation: string;
  relevance: 'high' | 'medium' | 'low';
  suggestedActions: string[];
}

export default function EvidenceClassificationModal({
  isOpen,
  onClose,
  evidenceName,
  evidenceDescription,
  fileType
}: EvidenceClassificationProps) {
  const [classification, setClassification] = useState<Classification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && evidenceName && evidenceDescription) {
      classifyEvidence();
    }
  }, [isOpen, evidenceName, evidenceDescription]);

  const classifyEvidence = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/evidence/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          evidenceName,
          evidenceDescription,
          fileType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to classify evidence');
      }

      setClassification(data.classification);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center">
            <Tag className="h-6 w-6 mr-3" />
            <h2 className="text-2xl font-bold">AI Evidence Classification</h2>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Classifying evidence with AI...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Classification Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {classification && (
            <div className="space-y-6">
              {/* Evidence Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Evidence Details</h3>
                <p className="text-sm text-gray-600 mb-1"><strong>Name:</strong> {evidenceName}</p>
                <p className="text-sm text-gray-600"><strong>Description:</strong> {evidenceDescription}</p>
              </div>

              {/* Classification Results */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Type</h4>
                  <p className="text-2xl font-bold text-purple-600">{classification.type}</p>
                  {classification.subtype && (
                    <p className="text-sm text-purple-700 mt-1">{classification.subtype}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Confidence</h4>
                  <p className="text-2xl font-bold text-blue-600">{classification.confidence}%</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${classification.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Relevance */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Case Relevance</h3>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getRelevanceColor(classification.relevance)}`}>
                  <Shield className="h-4 w-4 mr-2" />
                  {classification.relevance.toUpperCase()} RELEVANCE
                </span>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Classification Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {classification.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Classification Explanation</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
                  {classification.explanation}
                </p>
              </div>

              {/* Suggested Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Suggested Actions</h3>
                <ul className="space-y-2">
                  {classification.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{action}</span>
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
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}