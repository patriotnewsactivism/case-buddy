
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CaseDetails() {
  const { id } = useParams();
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/cases" className="text-blue-700 hover:underline">&larr; Back</Link>
      <h1 className="text-2xl font-bold mt-2">Case #{id}</h1>
      <p className="text-gray-600">Detailed view coming soon: tasks, documents, timeline, contacts.</p>
    </div>
  );
}
