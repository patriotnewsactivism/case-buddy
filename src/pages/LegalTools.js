import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Gavel, BookOpen, FileText, Calendar, MessageSquare, Scale } from 'lucide-react';

import AIAnalysisPanel from '../components/AIAnalysisPanel';
import InterviewSimulator from '../components/InterviewSimulator';
import DeadlineCalculator from '../components/DeadlineCalculator';
import LegalTemplates from '../components/LegalTemplates';
import CaseLawResearch from '../components/CaseLawResearch';

const LegalTools = () => {
  const [activeTab, setActiveTab] = useState('document-analysis');
  
  const tabs = [
    { id: 'document-analysis', label: 'Document Analysis', icon: FileText },
    { id: 'testimony-prep', label: 'Testimony Prep', icon: MessageSquare },
    { id: 'deadline-calculator', label: 'Deadline Calculator', icon: Calendar },
    { id: 'legal-templates', label: 'Legal Templates', icon: Scale },
    { id: 'case-law', label: 'Case Law Research', icon: BookOpen }
  ];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Gavel className="w-7 h-7 text-blue-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Tools Suite</h1>
          <p className="text-gray-600">Comprehensive AI-powered tools to help you win your case</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'document-analysis' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Document Analysis</h2>
              <p className="text-gray-600 mb-6">
                Upload legal documents to receive AI-powered analysis including key facts, legal issues, relevant case law, and strategic recommendations.
              </p>
              <AIAnalysisPanel />
            </div>
          )}
          
          {activeTab === 'testimony-prep' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Testimony Preparation</h2>
              <p className="text-gray-600 mb-6">
                Practice for depositions, direct examination, and cross-examination with AI-powered feedback to improve your testimony skills.
              </p>
              <InterviewSimulator />
            </div>
          )}
          
          {activeTab === 'deadline-calculator' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Deadline Calculator</h2>
              <p className="text-gray-600 mb-6">
                Calculate important legal deadlines based on jurisdiction-specific rules, including court holidays and weekend adjustments.
              </p>
              <DeadlineCalculator />
            </div>
          )}
          
          {activeTab === 'legal-templates' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Document Templates</h2>
              <p className="text-gray-600 mb-6">
                Access professional legal document templates for various case types. Customize and download templates to save time and ensure proper formatting.
              </p>
              <LegalTemplates />
            </div>
          )}
          
          {activeTab === 'case-law' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Law Research</h2>
              <p className="text-gray-600 mb-6">
                Search for relevant case law to support your legal arguments. Find precedents, citations, and key holdings from federal and state courts.
              </p>
              <CaseLawResearch />
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Gavel className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How These Tools Help You Win Your Case</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Document Analysis
                </h4>
                <p className="text-blue-700 text-sm">
                  Quickly extract key facts, identify legal issues, and get strategic recommendations from your legal documents.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Testimony Preparation
                </h4>
                <p className="text-blue-700 text-sm">
                  Practice and refine your testimony for depositions and trial with realistic scenarios and expert feedback.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline Management
                </h4>
                <p className="text-blue-700 text-sm">
                  Never miss a critical filing deadline with our jurisdiction-specific calculator that accounts for court rules.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Scale className="w-4 h-4 mr-2" />
                  Professional Documents
                </h4>
                <p className="text-blue-700 text-sm">
                  Create properly formatted legal documents quickly using our extensive template library tailored to your case type.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Case Law Research
                </h4>
                <p className="text-blue-700 text-sm">
                  Find relevant precedents and citations to strengthen your legal arguments and support your position.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Gavel className="w-4 h-4 mr-2" />
                  Strategic Advantage
                </h4>
                <p className="text-blue-700 text-sm">
                  Gain the upper hand with comprehensive tools that help you organize, analyze, and present your case effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalTools;