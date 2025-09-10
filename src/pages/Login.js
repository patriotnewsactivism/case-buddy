import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would connect to an authentication service
    console.log('Login attempt with:', { email, password, rememberMe });
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In to CaseBuddy</h2>
      <p className="text-gray-600 mb-6">Access your case management and interview preparation tools</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
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
        
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors"
        >
          Sign In
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
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
            Start Free Trial
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;