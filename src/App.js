
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentAnalyzer from './pages/DocumentAnalyzer';
import CaseManagement from './pages/CaseManagement';
import InterviewPrep from './pages/InterviewPrep';
import Login from './pages/Login';
import Profile from './pages/Profile';
import FreeTrial from './pages/FreeTrial';
import TrialExpired from './pages/TrialExpired';
import CaseDetails from './pages/CaseDetails';
import { isAuthed } from './services/auth';

const Shell = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  </div>
);

const PrivateRoute = ({ element }) => {
  return isAuthed() ? element : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Shell><Dashboard /></Shell>} />
        <Route path="/cases" element={<Shell><CaseManagement /></Shell>} />
        <Route path="/cases/:id" element={<Shell><CaseDetails /></Shell>} />
        <Route path="/analyzer" element={<Shell><DocumentAnalyzer /></Shell>} />
        <Route path="/interview" element={<Shell><InterviewPrep /></Shell>} />
        <Route path="/profile" element={<Shell><Profile /></Shell>} />
        <Route path="/trial" element={<Shell><FreeTrial /></Shell>} />
        <Route path="/trial-expired" element={<Shell><TrialExpired /></Shell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
