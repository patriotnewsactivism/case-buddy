import React from 'react';
import TrialCountdown from '../components/TrialCountdown';

const TrialExpired = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Free Trial Has Expired</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Thank you for trying CaseBuddy. To continue using our advanced case management and AI-powered interview preparation tools, please upgrade to a premium subscription.
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upgrade to Premium</h2>
        <p className="text-gray-600 mb-6">
          Get unlimited access to all CaseBuddy features including advanced AI analysis, interview preparation tools, and secure cloud storage.
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg">Premium Plan</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="mt-4 space-y-2 text-left text-gray-700">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited cases and documents
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Advanced AI analysis tools
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Interview preparation simulator
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Secure cloud storage
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Priority customer support
              </li>
            </ul>
          </div>
        </div>
        
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors mb-4">
          Upgrade Now
        </button>
        
        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-md transition-colors">
          Extend Trial (Contact Support)
        </button>
      </div>
    </div>
  );
};

export default TrialExpired;