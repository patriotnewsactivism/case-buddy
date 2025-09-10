import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">CaseBuddy</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:text-blue-200 transition-colors">Dashboard</a></li>
            <li><a href="#" className="hover:text-blue-200 transition-colors">Cases</a></li>
            <li><a href="#" className="hover:text-blue-200 transition-colors">Documents</a></li>
            <li><a href="#" className="hover:text-blue-200 transition-colors">Interview Prep</a></li>
            <li><a href="#" className="hover:text-blue-200 transition-colors">Analytics</a></li>
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors">
            Sign In
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md transition-colors">
            Free Trial
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;