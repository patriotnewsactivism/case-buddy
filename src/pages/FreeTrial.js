import React, { useState } from 'react';

const FreeTrial = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, this would connect to a registration service
    console.log('Free trial registration:', { email, fullName, company });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Start Your Free Trial</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get full access to all CaseBuddy features for 14 days. No credit card required. 
          Experience AI-powered case management and interview preparation tools today.
        </p>
      </div>
      
      {!isSubmitted ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="your@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Company (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Your company name"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Starting Trial...' : 'Start 14-Day Free Trial'}
            </button>
          </form>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="text-center">
              By starting your free trial, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Welcome to CaseBuddy!</h2>
          <p className="text-green-700 mb-6">
            Your 14-day free trial has been activated. You now have full access to all features.
          </p>
          <p className="text-gray-700 mb-6">
            We've sent a welcome email to <span className="font-semibold">{email}</span> with instructions to get started.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            Go to Dashboard
          </button>
        </div>
      )}
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-lg mb-2">Case Management</h3>
          <p className="text-gray-700">Organize all your legal cases in one place with advanced categorization</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-lg mb-2">AI Interview Prep</h3>
          <p className="text-gray-700">Practice case interviews with AI-powered feedback and analysis</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="font-semibold text-lg mb-2">Document Intelligence</h3>
          <p className="text-gray-700">Automatically extract key facts and insights from your documents</p>
        </div>
      </div>
    </div>
  );
};

export default FreeTrial;