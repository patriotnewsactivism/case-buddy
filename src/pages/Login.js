
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, verify2FA } from '../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleCreds = (e) => {
    e.preventDefault();
    try {
      signIn(email, password);
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handle2FA = (e) => {
    e.preventDefault();
    try {
      verify2FA(code);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
      <p className="text-gray-600 mb-6">Secure login with 2FA</p>
      {error && <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
      {step===1 && (
        <form onSubmit={handleCreds} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full p-3 border border-gray-300 rounded-md" placeholder="you@firm.com" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full p-3 border border-gray-300 rounded-md" placeholder="••••••••" />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">Continue</button>
        </form>
      )}
      {step===2 && (
        <form onSubmit={handle2FA} className="space-y-4">
          <div className="text-gray-700">Enter the 6‑digit code from your authenticator app.</div>
          <input value={code} onChange={e=>setCode(e.target.value)} inputMode="numeric" pattern="\d{6}" maxLength={6} className="w-full p-3 border border-gray-300 rounded-md tracking-widest text-center" placeholder="123456" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">Verify</button>
        </form>
      )}
    </div>
  );
};

export default Login;
