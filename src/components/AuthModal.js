import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, this would connect to an authentication service
    console.log('Auth attempt with:', { email, password, fullName, company, rememberMe });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          âœ•
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {mode === 'login' ? 'Sign In to CaseBuddy' : 'Start Your Free Trial'}
        </h2>
        
        {mode === 'login' ? (
          <p className="text-gray-600 mb-6">Access your case management and interview preparation tools</p>
        ) : (
          <p className="text-gray-600 mb-6">
            Get full access to all CaseBuddy features for 14 days. No credit card required.
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
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
          )}
          
          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          
          {mode === 'signup' && (
            <div>
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                required
              />
            </div>
          )}
          
          {mode === 'signup' && (
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
          )}
          
          {mode === 'login' && (
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="remember" className="text-gray-700">Remember me</label>
              </div>
              
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Forgot password?
              </a>
            </div>
          )}
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{mode === 'login' ? 'Signing In...' : 'Starting Trial...'}</span>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Start 14-Day Free Trial'}</span>
            )}
          </button>
        </form>
        
        <div className="mt-6">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors mb-3">
            Sign in with Google
          </button>
          <button className="w-full bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-md transition-colors">
            Sign in with LinkedIn
          </button>
        </div>
        
        {mode === 'login' && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => {/* In a real app, this would switch to signup mode */}}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Start Free Trial
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;