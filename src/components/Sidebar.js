import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Case Management</h2>
      <ul className="space-y-2 mb-6">
        <li>
          <a href="#" className="block p-2 bg-blue-100 rounded-md text-blue-800 font-medium">
            All Cases
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            Market Sizing
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            M&A
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            Profitability
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            Market Entry
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            Growth Strategy
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            Operations
          </a>
        </li>
      </ul>
      
      <h2 className="text-lg font-semibold mb-4">Tools</h2>
      <ul className="space-y-2 mb-6">
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            Document Analyzer
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            Timeline Builder
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            Evidence Manager
          </a>
        </li>
        <li>
          <a href="#" className="block p-2 hover:bg-gray-100 rounded-md transition-colors">
            FOIA Tracker
          </a>
        </li>
      </ul>
      
      <div className="mt-auto">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
          + New Case
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;