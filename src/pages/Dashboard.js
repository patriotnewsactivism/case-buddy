import React from 'react';
import CaseCard from '../components/CaseCard';

const Dashboard = () => {
  // Sample data - in a real app this would come from the backend
  const cases = [
    {
      id: 1,
      title: "Tech Startup Market Entry",
      description: "Analyzing market opportunities for AI-powered productivity tools in Southeast Asia",
      type: "Market Entry",
      lastUpdated: "2025-09-08"
    },
    {
      id: 2,
      title: "Hospital Merger Evaluation",
      description: "Assessing financial and operational synergies between two regional healthcare providers",
      type: "M&A",
      lastUpdated: "2025-09-05"
    },
    {
      id: 3,
      title: "E-commerce Growth Strategy",
      description: "Developing expansion plan for online retail platform in European markets",
      type: "Growth Strategy",
      lastUpdated: "2025-09-01"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's an overview of your active cases.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((caseItem) => (
          <CaseCard 
            key={caseItem.id}
            title={caseItem.title}
            description={caseItem.description}
            type={caseItem.type}
            lastUpdated={caseItem.lastUpdated}
          />
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <span className="font-semibold">Recommendation:</span> Your market entry case shows strong potential in Indonesia. Consider focusing on Jakarta and Surabaya metropolitan areas for initial launch.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Interview Preparation</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <span className="font-semibold">Tip:</span> You have 3 upcoming interview sessions. Practice your framework explanations for market sizing cases.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;