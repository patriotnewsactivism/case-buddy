import React, { useState, useEffect } from 'react';

const TrialCountdown = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    setTimeLeft(calculateTimeLeft());
    
    return () => clearInterval(timer);
  }, [endDate]);
  
  if (isExpired) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="font-medium text-red-800">Trial Expired</h3>
        <p className="text-red-700 text-sm mt-1">
          Your free trial has ended. Please upgrade to continue using CaseBuddy.
        </p>
        <button className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
          Upgrade Now
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
      <h3 className="font-medium text-orange-800">Free Trial Ends In</h3>
      <div className="flex space-x-4 mt-2">
        <div className="text-center">
          <div className="text-xl font-bold text-orange-800">{timeLeft.days}</div>
          <div className="text-xs text-orange-700">Days</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-800">{timeLeft.hours}</div>
          <div className="text-xs text-orange-700">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-800">{timeLeft.minutes}</div>
          <div className="text-xs text-orange-700">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-800">{timeLeft.seconds}</div>
          <div className="text-xs text-orange-700">Seconds</div>
        </div>
      </div>
      <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
        Upgrade Now
      </button>
    </div>
  );
};

export default TrialCountdown;