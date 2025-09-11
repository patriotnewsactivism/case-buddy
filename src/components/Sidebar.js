
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Item = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <li>
      <Link to={to} className={
        'block p-2 rounded-md transition-colors ' + 
        (active ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100')
      }>
        {children}
      </Link>
    </li>
  );
};

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Case Management</h2>
      <ul className="space-y-2 mb-6">
        <Item to="/cases">All Cases</Item>
        <Item to="/analyzer">Document Analyzer</Item>
        <Item to="/interview">Interview Prep</Item>
        <Item to="/profile">Profile</Item>
        <Item to="/trial">Free Trial</Item>
      </ul>
      <div className="mt-auto">
        <Link to="/cases" className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
          + New Case
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
