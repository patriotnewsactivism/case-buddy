import React, { useState } from 'react';

const SecureLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, this would connect to an authentication service
    console.log('Login attempt with:', { email, password, rememberMe });
    
    // Simulate API call and 2FA requirement
    setTimeout(() => {
      setIsSubmitting(false);
      setShowTwoFactor(true);
    }, 1500);
  };
  
  const handleTwoFactorSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, this would verify the 2FA code
    console.log('2FA code submitted:', twoFactorCode);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowTwoFactor(false);
      // Here you would typically redirect the user to the dashboard
      console.log('User successfully logged in');
    }, 1500);
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg">
      {!showTwoFactor ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Secure Login</h2>
          <p className="text-gray-600 mb-6">Please enter your credentials to access CaseBuddy</p>
          
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
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600 mb-6">Please enter the code sent to your registered device</p>
          
          <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Authentication Code</label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="123456"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </>
      )}
      
      <div className="mt-6">
        <p className="text-gray-600 text-sm">
          Your security is our priority. All login attempts are encrypted and monitored.
        </p>
      </div>
    </div>
  );
};

export default SecureLogin;