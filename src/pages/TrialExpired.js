
import React from 'react';

const TrialExpired = () => (
  <div className="p-6 max-w-2xl mx-auto">
    <h1 className="text-2xl font-bold text-red-700 mb-2">Trial Expired</h1>
    <p className="text-gray-700">Your trial has expired. Please upgrade your plan to continue using CaseBuddy.</p>
    <a href="https://wtpnews.org" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded">Upgrade</a>
  </div>
);
export default TrialExpired;
