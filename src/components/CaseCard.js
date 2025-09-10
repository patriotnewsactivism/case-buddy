import React from 'react';

const CaseCard = ({ title, description, type, lastUpdated }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {type}
        </span>
      </div>
      <p className="text-gray-600 mt-2 text-sm">{description}</p>
      <div className="mt-4 text-xs text-gray-500">
        Last updated: {lastUpdated}
      </div>
    </div>
  );
};

export default CaseCard;