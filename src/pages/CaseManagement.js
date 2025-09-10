
import React, { useEffect, useState } from 'react';
import { loadCases, addCase } from '../services/storage';
import { Link } from 'react-router-dom';

export default function CaseManagement() {
  const [cases, setCases] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('General');
  const [description, setDescription] = useState('');

  useEffect(()=>{ setCases(loadCases()); }, []);

  const create = (e) => {
    e.preventDefault();
    const c = addCase({ title, type, description, lastUpdated: new Date().toISOString().slice(0,10) });
    setCases(prev => [...prev, c]);
    setTitle(''); setType('General'); setDescription('');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cases</h1>
      <form onSubmit={create} className="bg-white border p-4 rounded mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Title" className="p-3 border rounded" />
        <select value={type} onChange={e=>setType(e.target.value)} className="p-3 border rounded">
          <option>General</option><option>Litigation</option><option>FOIA</option><option>RICO</option>
        </select>
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4">Add Case</button>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="md:col-span-3 p-3 border rounded" />
      </form>
      <ul className="grid md:grid-cols-2 gap-4">
        {cases.map(c => (
          <li key={c.id} className="border rounded p-4 bg-white">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-gray-600">{c.type} • updated {c.lastUpdated}</div>
            <p className="text-gray-700 mt-2 line-clamp-3">{c.description}</p>
            <Link to={'/cases/'+c.id} className="text-blue-700 hover:underline mt-2 inline-block">Open</Link>
          </li>
        ))}
        {cases.length===0 && <li className="text-gray-500">No cases yet.</li>}
      </ul>
    </div>
  );
}
