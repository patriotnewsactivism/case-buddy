
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthed, signOut } from '../services/auth';

const Header = () => {
  const navigate = useNavigate();
  const out = () => { signOut(); navigate('/login'); };
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="text-xl font-bold text-gray-800">CaseBuddy</div>
      <nav className="space-x-4">
        <Link to="/" className="text-gray-700 hover:text-black">Dashboard</Link>
        <Link to="/cases" className="text-gray-700 hover:text-black">Cases</Link>
        <Link to="/analyzer" className="text-gray-700 hover:text-black">Analyzer</Link>
        {isAuthed() ? (
          <button onClick={out} className="text-gray-700 hover:text-black">Sign out</button>
        ) : (
          <Link to="/login" className="text-gray-700 hover:text-black">Sign in</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
