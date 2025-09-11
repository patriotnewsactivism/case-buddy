
// naive semantic-ish search using TF-IDF-like scoring over uploaded docs (client-only)
import { loadDocs } from './storage';

export function searchDocuments(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const docs = loadDocs();
  return docs.map(d => {
    const text = (d.text || '').toLowerCase();
    const score = terms.reduce((acc,t)=> acc + (text.includes(t) ? 1 : 0), 0);
    return { ...d, score };
  }).filter(d => d.score>0).sort((a,b)=> b.score - a.score);
}
