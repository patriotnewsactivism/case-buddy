import React, { useState } from 'react';
import CaseCard from '../components/CaseCard';
import TrialCountdown from '../components/TrialCountdown';

const CaseManagement = () => {
  const [cases, setCases] = useState([
    {
      id: 1,
      title: "Tech Startup Market Entry",
      description: "Analyzing market opportunities for AI-powered productivity tools in Southeast Asia",
      type: "Market Entry",
      lastUpdated: "2025-09-08",
      documents: 12,
      evidence: 8,
      timelineEvents: 15
    },
    {
      id: 2,
      title: "Hospital Merger Evaluation",
      description: "Assessing financial and operational synergies between two regional healthcare providers",
      type: "M&A",
      lastUpdated: "2025-09-05",
      documents: 24,
      evidence: 16,
      timelineEvents: 22
    },
    {
      id: 3,
      title: "E-commerce Growth Strategy",
      description: "Developing expansion plan for online retail platform in European markets",
      type: "Growth Strategy",
      lastUpdated: "2025-09-01",
      documents: 18,
      evidence: 5,
      timelineEvents: 12
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Calculate trial end date (14 days from now)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);
  
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || caseItem.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Case Management</h2>
        <p className="text-gray-600">Organize and analyze all your legal cases in one place</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md w-full md:w-80"
                />
              </div>
              
              <div className="flex space-x-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="market sizing">Market Sizing</option>
                  <option value="m&a">M&A</option>
                  <option value="profitability">Profitability</option>
                  <option value="market entry">Market Entry</option>
                  <option value="growth strategy">Growth Strategy</option>
                  <option value="operations">Operations</option>
                </select>
                
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap">
                  + New Case
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map((caseItem) => (
                <CaseCard 
                  key={caseItem.id}
                  title={caseItem.title}
                  description={caseItem.description}
                  type={caseItem.type}
                  lastUpdated={caseItem.lastUpdated}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <ul className="space-y-3">
              <li className="flex items-start p-3 hover:bg-gray-50 rounded-md">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <span className="text-blue-800">📄</span>
                </div>
                <div>
                  <p className="font-medium">New document added to "Tech Startup Market Entry"</p>
                  <p className="text-gray-500 text-sm">2 hours ago</p>
                </div>
              </li>
              <li className="flex items-start p-3 hover:bg-gray-50 rounded-md">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <span className="text-green-800">📅</span>
                </div>
                <div>
                  <p className="font-medium">Timeline event added to "Hospital Merger Evaluation"</p>
                  <p className="text-gray-500 text-sm">1 day ago</p>
                </div>
              </li>
              <li className="flex items-start p-3 hover:bg-gray-50 rounded-md">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <span className="text-purple-800">🎤</span>
                </div>
                <div>
                  <p className="font-medium">Interview practice session completed</p>
                  <p className="text-gray-500 text-sm">2 days ago</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <TrialCountdown endDate={trialEndDate} />
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Case Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold">{cases.length}</p>
              </div>
              <div>
                <p className="text-gray-600">Documents</p>
                <p className="text-2xl font-bold">{cases.reduce((sum, caseItem) => sum + caseItem.documents, 0)}</p>
              </div>
              <div>
                <p className="text-gray-600">Evidence Items</p>
                <p className="text-2xl font-bold">{cases.reduce((sum, caseItem) => sum + caseItem.evidence, 0)}</p>
              </div>
              <div>
                <p className="text-gray-600">Timeline Events</p>
                <p className="text-2xl font-bold">{cases.reduce((sum, caseItem) => sum + caseItem.timelineEvents, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseManagement;