
import React from 'react';
import TrialCountdown from '../components/TrialCountdown';

const FreeTrial = () => {
  const endDate = new Date(Date.now() + 1000*60*60*24*14).toISOString();
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Free Trial</h1>
      <p className="text-gray-600 mb-4">Enjoy all features during your 14‑day trial.</p>
      <TrialCountdown endDate={endDate} />
    </div>
  );
};

export default FreeTrial;
